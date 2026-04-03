<script setup>
import { onMounted, onUnmounted, ref, shallowRef, nextTick, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  HORIZONS,
  ARTEMIS_II_MISSION,
  eclipticKmToThree,
  fetchLatestState,
  fetchTrajectoryArc,
  distanceKm,
  speedKmS,
  withUniformSampleTimes,
  interpolateTimedRows,
} from '../lib/horizons.js'
import TuileInfos from './TuileInfos.vue'

const props = defineProps({
  timelineLive: { type: Boolean, default: true },
  timelineAt: {
    type: Date,
    required: true,
  },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['computed-events'])

/** Textures: official three.js examples (MIT license in the repo). */
const TEX_EARTH = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
const TEX_MOON = 'https://threejs.org/examples/textures/planets/moon_1024.jpg'

/** Physics (WGS84 / IAU) — Earth and trajectory: same scale as Horizons. Moon / Orion: minimum display size (positions unchanged). */
const EARTH_R_KM = 6371.01
const MOON_R_KM = 1737.4
const SCENE_PER_KM = 1 / 170000
const BODY_RADIUS_MUL = 2
/** Moon radius in scene: at least this minimum (position still from Horizons). */
const MOON_DISPLAY_RADIUS_MIN = MOON_R_KM * SCENE_PER_KM * 4  // ×4 real scale (×2 of previous ×2)
const canvasRef = ref(null)
const loading = ref(true)
const textureError = ref(null)
const ephemError = ref(null)
const ephemLoading = ref(true)
const ephemUpdated = ref('—')
const trajStatus = ref('Trajectory: loading…')
const trajError = ref(null)

const telemetry = shallowRef({
  distEarth: '—',
  distMoon: '—',
  speed: '—',
})

const orionRow = shallowRef(null)
const moonRow = shallowRef(null)
/** Horizons samples with `timeMs` for timeline scrub (Orion = mission arc, Moon = local orbit). */
const orionTrajTimed = shallowRef(null)
const moonOrbitTimed = shallowRef(null)

let frameId = 0
let renderer
let scene
let camera
let controls
let earthMesh
let moonMesh
let orionGroup
let trajectoryRoot
let moonOrbitRoot
let moonTrailRoot
let clock

let pollTimer = 0
let livePositionTimer = 0
let orbitTargetInitialized = false
let eventsMarkersRoot = null

const EVENT_COLORS = {
  milestone: 0x4de8ff,
  burn:      0xff9944,
  flyby:     0xcc66ff,
  reentry:   0xff5533,
  landing:   0x44dd88,
  info:      0x8899bb,
}

function createStarfield(count = 4000) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 90 + Math.random() * 220
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xaaccff,
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  })
  return new THREE.Points(geo, mat)
}

function createOrion() {
  const g = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde8,
    metalness: 0.45,
    roughness: 0.35,
  })
  const heatMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    metalness: 0.2,
    roughness: 0.6,
  })
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52), heatMat)
  cap.rotation.x = Math.PI
  cap.position.y = 0.35
  g.add(cap)

  const crew = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.9, 32), bodyMat)
  crew.position.y = -0.15
  g.add(crew)

  const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.55, 24), bodyMat)
  sm.position.y = -0.85
  g.add(sm)

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2744,
    metalness: 0.6,
    roughness: 0.25,
  })
  const solar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.35), panelMat)
  solar.position.set(0.9, -0.5, 0)
  solar.rotation.z = -0.15
  g.add(solar)

  /* Visible marker (Horizons-scale positions; mesh deliberately enlarged). */
  g.scale.setScalar(0.028)
  return g
}

function rowToSceneVector(row) {
  const t = eclipticKmToThree(row.x, row.y, row.z, SCENE_PER_KM)
  return new THREE.Vector3(t.x, t.y, t.z)
}

function velocitySceneDirection(row) {
  const t = eclipticKmToThree(row.vx, row.vy, row.vz, 1)
  const v = new THREE.Vector3(t.x, t.y, t.z)
  if (v.lengthSq() < 1e-18) return new THREE.Vector3(0, 0, 1)
  return v.normalize()
}

function formatKm(v) {
  if (!Number.isFinite(v)) return '—'
  if (v >= 1e6) return `${(v / 1e6).toFixed(3)} M km`
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)} k km`
  return `${v.toFixed(1)} km`
}

function formatUtcTime(d) {
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

function disposeTrajectory(root) {
  if (!root) return
  const materials = new Set()
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m) => m && materials.add(m))
    }
  })
  materials.forEach((m) => m.dispose())
  scene?.remove(root)
}

/**
 * Trajectory line — straight segments between Horizons samples (no Catmull-Rom:
 * with ~3 h steps, Catmull-Rom over-bends and forms loops off the real path).
 * Legacy: per-segment tubes were avoided; a simple polyline is used.
 */
const SPLINE_TUBE_RADIUS = 0.008
const SPLINE_SEG_SUBDIV = 14

function buildTrajectoryGroup(rows) {
  const pts = rows
    .map((r) => rowToSceneVector(r))
    .filter(
      (v) =>
        Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z),
    )
  if (pts.length < 2) return null

  // Single polyline through all points — simple, robust, no Frenet-frame issues.
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x4de8ff,
    linewidth: 1,
    depthWrite: false,
    depthTest: false,
  })
  const line = new THREE.Line(lineGeo, lineMat)
  line.frustumCulled = false
  line.renderOrder = 10

  const g = new THREE.Group()
  g.name = 'missionTrajectory'
  g.frustumCulled = false
  g.add(line)

  console.log('[Artemis] Trajectory built:', pts.length, 'points, first:', pts[0], 'last:', pts[pts.length - 1])
  return g
}

function buildEventMarkers(events, trajRows) {
  const g = new THREE.Group()
  g.name = 'missionEvents'
  for (const ev of events) {
    const row = interpolateTimedRows(trajRows, ev.timeMs)
    if (!row) continue
    const pos = rowToSceneVector(row)
    if (!Number.isFinite(pos.x)) continue
    const color = EVENT_COLORS[ev.type] ?? 0xffffff

    // Inner bright dot
    const innerMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 10, 10),
      new THREE.MeshBasicMaterial({ color, depthTest: false }),
    )
    innerMesh.position.copy(pos)
    innerMesh.renderOrder = 22
    g.add(innerMesh)

    // Outer translucent halo
    const haloMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 10, 10),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthTest: false }),
    )
    haloMesh.position.copy(pos)
    haloMesh.renderOrder = 21
    g.add(haloMesh)
  }
  return g
}

function applyTelemetryFromRows(moon, orion) {
  const dEarth = orion.rg
  const dMoon = distanceKm(orion, moon)
  const spd = speedKmS(orion)
  telemetry.value = {
    distEarth: formatKm(dEarth),
    distMoon: formatKm(dMoon),
    speed: Number.isFinite(spd) ? `${spd.toFixed(4)} km/s` : '—',
  }
}

function applyScrubbedState(atDate) {
  const om = orionTrajTimed.value
  const mm = moonOrbitTimed.value
  if (!om?.length || !mm?.length) return
  const ms = atDate.getTime()
  const o = interpolateTimedRows(om, ms)
  const m = interpolateTimedRows(mm, ms)
  if (!o || !m) return
  orionRow.value = o
  moonRow.value = m
  ephemUpdated.value = formatUtcTime(new Date(o.timeMs))
  applyTelemetryFromRows(m, o)
}

async function refreshInstantStates() {
  if (!props.timelineLive) return
  const now = new Date()
  try {
    const [moon, orion] = await Promise.all([
      fetchLatestState(HORIZONS.MOON, now),
      fetchLatestState(HORIZONS.ARTEMIS_II_ORION, now),
    ])
    moonRow.value = moon
    orionRow.value = orion
    ephemError.value = null
    ephemUpdated.value = formatUtcTime(now)
    applyTelemetryFromRows(moon, orion)
  } catch (e) {
    console.error('[Artemis] Horizons instant state — error:', e)
    ephemError.value = e instanceof Error ? e.message : String(e)
  } finally {
    ephemLoading.value = false
  }
}

/** Full mission arc: fine step near Earth (first 24 h), coarse step for the rest. */
const TRAJ_FINE_STEP_MS = 24 * 3600 * 1000   // 24 h in ms
const TRAJ_FINE_STEP    = '15 min'
const TRAJ_COARSE_STEP  = '1 h'
// Keep a single label for TuileInfos display (use coarse step as representative)
const MISSION_TRAJ_STEP = TRAJ_COARSE_STEP

/**
 * Assign timeMs to each row based on a fixed step, starting at startDate.
 * More reliable than withUniformSampleTimes when rows come from mixed-step batches.
 */
function assignSampleTimes(rows, startDate, stepMs) {
  const t0 = startDate.getTime()
  return rows.map((r, i) => ({ ...r, timeMs: t0 + i * stepMs }))
}

function missionDateLabel(d) {
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

const missionLaunchLabel = missionDateLabel(ARTEMIS_II_MISSION.launchUtc)
const missionSplineStartLabel = missionDateLabel(ARTEMIS_II_MISSION.trajectoryStartUtc)
const missionSplineEndLabel = missionDateLabel(ARTEMIS_II_MISSION.trajectoryEndUtc)
const missionStep = MISSION_TRAJ_STEP

async function loadMoonOrbit() {
  // ~27.3 d sidereal month centered on mission, 6 h step → ~110 points
  const start = new Date(ARTEMIS_II_MISSION.launchUtc.getTime() - 14 * 24 * 3600 * 1000)
  const end   = new Date(ARTEMIS_II_MISSION.launchUtc.getTime() + 14 * 24 * 3600 * 1000)
  try {
    const rows = await fetchTrajectoryArc(HORIZONS.MOON, start, end, '6 h')
    moonOrbitTimed.value = withUniformSampleTimes(rows, start, end)
    const pts = rows
      .map((r) => rowToSceneVector(r))
      .filter((v) => Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z))
    if (pts.length < 2 || !scene) return

    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({
      color: 0x8899bb,
      dashSize: 0.04,
      gapSize: 0.03,
      depthTest: false,
      transparent: true,
      opacity: 0.45,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances() // required for LineDashedMaterial
    line.frustumCulled = false
    line.renderOrder = 5

    moonOrbitRoot = line
    scene.add(moonOrbitRoot)

    // Initial trail at real-time
    buildMoonTrail(Date.now())
  } catch (e) {
    console.warn('[Artemis] Moon orbit:', e)
  }
}

/**
 * Rebuilds the Moon trail centered on `nowMs`.
 * Called on load and whenever moonRow updates (live or timeline scrub).
 */
function buildMoonTrail(nowMs) {
  disposeTrajectory(moonTrailRoot)
  moonTrailRoot = null

  const timed = moonOrbitTimed.value
  if (!timed?.length || !scene) return

  const trailMs = 3 * 24 * 3600 * 1000
  const trailRows = timed.filter((r) => r.timeMs <= nowMs && r.timeMs >= nowMs - trailMs)
  // First future sample so the trail head meets the interpolated position
  const nextRow = timed.find((r) => r.timeMs > nowMs)
  if (nextRow) trailRows.push(nextRow)
  if (trailRows.length < 2) return

  const trailPts = trailRows.map((r) => rowToSceneVector(r))
  const n = trailPts.length
  const colArr = new Float32Array(n * 3)
  const headColor = new THREE.Color(0xc8f0ff)
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1)
    colArr[i * 3]     = headColor.r * f
    colArr[i * 3 + 1] = headColor.g * f
    colArr[i * 3 + 2] = headColor.b * f
  }
  const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts)
  trailGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3))
  const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false })
  const trailLine = new THREE.Line(trailGeo, trailMat)
  trailLine.frustumCulled = false
  trailLine.renderOrder = 7
  moonTrailRoot = trailLine
  scene.add(moonTrailRoot)
}

// Resync trail whenever moonRow changes:
// — live: 90 s poll with timeMs ≈ Date.now()
// — timeline scrub: interpolateTimedRows sets row.timeMs to simulated time
watch(moonRow, (row) => {
  if (!row) return
  buildMoonTrail(typeof row.timeMs === 'number' ? row.timeMs : Date.now())

  // Center orbit target on Earth–Moon midpoint once, on first data (live or scrubbed).
  // Earth is at origin in Horizons geocentric frame.
  if (!orbitTargetInitialized && controls) {
    const moonPos = rowToSceneVector(row)
    controls.target.set(moonPos.x / 2, moonPos.y / 2, moonPos.z / 2)
    controls.update()
    orbitTargetInitialized = true
  }
})

/**
 * Derive key event timestamps directly from Horizons trajectory data.
 * Returns a map { id → timeMs } for events that can be computed from positions.
 * – lunar-flyby : sample where distance Orion–Moon is minimum
 * – lunar-soi   : first inbound sample where distance Orion–Moon drops below 66 100 km
 * – entry       : last sample where Orion geocentric distance rg > 6 493 km
 *                 (Earth radius 6 371 + 122 km atmosphere entry altitude)
 */
function deriveEventTimes(orionRows, moonRows) {
  const MOON_SOI_KM = 66_100
  const ENTRY_RG_KM = 6_371 + 122

  let minDist = Infinity
  let flybyMs = null
  let soiMs = null
  let entryMs = null

  for (let i = 0; i < orionRows.length; i++) {
    const orRow = orionRows[i]
    const mRow = interpolateTimedRows(moonRows, orRow.timeMs)
    if (!mRow) continue

    const d = distanceKm(orRow, mRow)

    // Closest lunar approach
    if (d < minDist) {
      minDist = d
      flybyMs = orRow.timeMs
    }

    // First inbound SOI crossing (distance decreasing and crossing threshold)
    if (soiMs === null && i > 0) {
      const prev = orionRows[i - 1]
      const prevM = interpolateTimedRows(moonRows, prev.timeMs)
      if (prevM) {
        const dPrev = distanceKm(prev, prevM)
        if (dPrev > MOON_SOI_KM && d <= MOON_SOI_KM) {
          soiMs = orRow.timeMs
        }
      }
    }

    // Last sample still above entry altitude (Orion still in space)
    if (orRow.rg > ENTRY_RG_KM) {
      entryMs = orRow.timeMs
    }
  }

  return { flybyMs, soiMs, entryMs }
}

// Once both Orion trajectory and Moon orbit are loaded, compute precise event times
// and emit them so App.vue can override the static estimates.
watch([orionTrajTimed, moonOrbitTimed], ([orionRows, moonRows]) => {
  if (!orionRows?.length || !moonRows?.length) return
  const { flybyMs, soiMs, entryMs } = deriveEventTimes(orionRows, moonRows)
  emit('computed-events', { flybyMs, soiMs, entryMs })
})

// Rebuild 3D event markers when trajectory loads or when computed event times arrive
watch([orionTrajTimed, () => props.events], ([timed, events]) => {
  disposeTrajectory(eventsMarkersRoot)
  eventsMarkersRoot = null
  if (!timed?.length || !events?.length || !scene) return
  eventsMarkersRoot = buildEventMarkers(events, timed)
  scene.add(eventsMarkersRoot)
})

async function loadFullMissionTrajectory() {
  trajError.value = null
  trajStatus.value = 'Trajectory: loading Horizons…'
  try {
    const fineEnd = new Date(ARTEMIS_II_MISSION.trajectoryStartUtc.getTime() + TRAJ_FINE_STEP_MS)

    // Fetch both segments in parallel: fine (15 min) near Earth + coarse (1 h) for the rest
    const [fineRows, coarseRows] = await Promise.all([
      fetchTrajectoryArc(HORIZONS.ARTEMIS_II_ORION, ARTEMIS_II_MISSION.trajectoryStartUtc, fineEnd, TRAJ_FINE_STEP),
      fetchTrajectoryArc(HORIZONS.ARTEMIS_II_ORION, fineEnd, ARTEMIS_II_MISSION.trajectoryEndUtc, TRAJ_COARSE_STEP),
    ])

    // Assign correct timeMs using the actual step of each segment (not uniform across the whole arc)
    const FINE_STEP_MS   = 15 * 60 * 1000
    const COARSE_STEP_MS = 60 * 60 * 1000
    const fineTimed   = assignSampleTimes(fineRows, ARTEMIS_II_MISSION.trajectoryStartUtc, FINE_STEP_MS)
    // coarseRows[0] == fineEnd, overlaps with fineTimed's last point → skip index 0
    // coarseRows[1] is fineEnd + 1 h, so offset i+1 to get the right absolute timeMs
    const coarseTimed = coarseRows.slice(1).map((r, i) => ({
      ...r,
      timeMs: fineEnd.getTime() + (i + 1) * COARSE_STEP_MS,
    }))

    const mergedTimed = [...fineTimed, ...coarseTimed]
    const mergedRows  = [...fineRows, ...coarseRows.slice(1)]

    orionTrajTimed.value = mergedTimed

    const next = buildTrajectoryGroup(mergedRows)
    if (!next) {
      trajStatus.value = 'Trajectory: not enough points'
      trajError.value = 'Ephemeris received but path invalid (insufficient points).'
      return
    }
    if (scene) {
      disposeTrajectory(trajectoryRoot)
      trajectoryRoot = next
      scene.add(trajectoryRoot)
      trajStatus.value = `Trajectory: polyline (${mergedRows.length} pts — ${fineRows.length}×15 min + ${coarseRows.length - 1}×1 h)`
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[Artemis] Horizons trajectory — full error:', e)
    console.error('[Artemis] Message:', msg)
    trajError.value = msg
    trajStatus.value = 'Trajectory: failed (see detail below)'
  }
}

function animate() {
  frameId = requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()

  const moon = moonRow.value
  const orion = orionRow.value

  if (moon && moonMesh) moonMesh.position.copy(rowToSceneVector(moon))
  if (orion && orionGroup) {
    const p = rowToSceneVector(orion)
    orionGroup.position.copy(p)
    const fwd = velocitySceneDirection(orion)
    orionGroup.lookAt(p.clone().add(fwd))
  }

  if (earthMesh) {
    const tRot = props.timelineLive ? Date.now() : props.timelineAt.getTime()
    earthMesh.rotation.y = (tRot / 1000) * ((2 * Math.PI) / 86164.091)
  }
  if (moonMesh) {
    moonMesh.rotation.y = elapsed * 0.04
  }

  controls.update()
  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer || !camera || !canvasRef.value) return
  const el = canvasRef.value
  const w = el.clientWidth || window.innerWidth
  const h = el.clientHeight || window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

onMounted(async () => {
  // nextTick: next Vue cycle; rAF: wait for browser layout
  await nextTick()
  await new Promise((r) => requestAnimationFrame(r))

  clock = new THREE.Clock()
  const canvas = canvasRef.value
  const w = canvas.clientWidth || window.innerWidth
  const h = canvas.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05080f)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 800)
  camera.position.set(2.2, 1.6, 5.2)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // false = do not override canvas CSS (display size stays CSS-driven)
  renderer.setSize(w, h, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 0.06
  controls.maxDistance = 180
  controls.target.set(0, 0, 0)

  const sun = new THREE.DirectionalLight(0xffffff, 2.1)
  sun.position.set(18, 12, 14)
  scene.add(sun)
  scene.add(new THREE.AmbientLight(0x334466, 0.35))

  scene.add(createStarfield())

  // Start render loop immediately — stars show while textures and ephemeris load in background.
  window.addEventListener('resize', onResize)
  animate()

  const earthRadiusScene = EARTH_R_KM * SCENE_PER_KM * BODY_RADIUS_MUL
  const moonRadiusTrue = MOON_R_KM * SCENE_PER_KM * BODY_RADIUS_MUL
  const moonRadiusScene = Math.max(moonRadiusTrue, MOON_DISPLAY_RADIUS_MIN)

  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')

  try {
    const [texEarth, texMoon] = await Promise.all([
      loader.loadAsync(TEX_EARTH),
      loader.loadAsync(TEX_MOON),
    ])
    texEarth.colorSpace = THREE.SRGBColorSpace
    texMoon.colorSpace = THREE.SRGBColorSpace
    texEarth.anisotropy = renderer.capabilities.getMaxAnisotropy()
    texMoon.anisotropy = renderer.capabilities.getMaxAnisotropy()

    earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadiusScene, 64, 64),
      new THREE.MeshStandardMaterial({
        map: texEarth,
        roughness: 0.85,
        metalness: 0.05,
      }),
    )
    scene.add(earthMesh)

    moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(moonRadiusScene, 48, 48),
      new THREE.MeshStandardMaterial({
        map: texMoon,
        roughness: 0.95,
        metalness: 0,
      }),
    )
    scene.add(moonMesh)
  } catch (e) {
    textureError.value = 'Textures: network error (scene uses fallback solid colors).'
    console.error(e)
    earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadiusScene, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x2266aa, roughness: 0.8, metalness: 0.1 }),
    )
    scene.add(earthMesh)
    moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(moonRadiusScene, 40, 40),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1, metalness: 0 }),
    )
    scene.add(moonMesh)
  } finally {
    loading.value = false
  }

  orionGroup = createOrion()
  scene.add(orionGroup)

  void refreshInstantStates()
  void loadFullMissionTrajectory()
  void loadMoonOrbit()
  pollTimer = window.setInterval(refreshInstantStates, 90_000)

  function restartLivePositionTimer() {
    clearInterval(livePositionTimer)
    livePositionTimer = 0
    if (!props.timelineLive) return
    if (!orionTrajTimed.value?.length || !moonOrbitTimed.value?.length) return
    livePositionTimer = window.setInterval(() => {
      if (props.timelineLive) applyScrubbedState(new Date())
    }, 1000)
  }

  watch(
    [
      () => props.timelineLive,
      () => props.timelineAt.getTime(),
      orionTrajTimed,
      moonOrbitTimed,
    ],
    () => {
      clearInterval(livePositionTimer)
      livePositionTimer = 0

      if (!props.timelineLive && orionTrajTimed.value?.length && moonOrbitTimed.value?.length) {
        applyScrubbedState(props.timelineAt)
      }
      if (props.timelineLive) {
        void refreshInstantStates()
        restartLivePositionTimer()
      }
    },
  )
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.clearInterval(pollTimer)
  window.clearInterval(livePositionTimer)
  window.removeEventListener('resize', onResize)
  disposeTrajectory(trajectoryRoot)
  trajectoryRoot = null
  disposeTrajectory(moonOrbitRoot)
  moonOrbitRoot = null
  disposeTrajectory(moonTrailRoot)
  moonTrailRoot = null
  disposeTrajectory(eventsMarkersRoot)
  eventsMarkersRoot = null
  controls?.dispose()
  renderer?.dispose()
  scene?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
    }
  })
})
</script>

<template>
  <div class="wrap">
    <canvas ref="canvasRef" class="canvas" />
    <div v-if="loading" class="overlay">Loading textures…</div>
    <div v-else-if="textureError" class="overlay soft">{{ textureError }}</div>
    <div
      v-if="!loading"
      class="telemetry-hud ds-panel ds-panel--glass"
      aria-label="Orion instantaneous telemetry"
      aria-live="polite"
    >
      <dl class="telemetry-hud__dl">
        <div class="telemetry-hud__row">
          <dt>Distance to Earth center</dt>
          <dd>{{ telemetry.distEarth }}</dd>
        </div>
        <div class="telemetry-hud__row">
          <dt>Distance to Moon center</dt>
          <dd>{{ telemetry.distMoon }}</dd>
        </div>
        <div class="telemetry-hud__row">
          <dt>Speed (state vector)</dt>
          <dd>{{ telemetry.speed }}</dd>
        </div>
      </dl>
      <p v-if="ephemLoading" class="telemetry-hud__status ds-text-caption">Loading ephemeris…</p>
      <p v-else-if="ephemError" class="telemetry-hud__status ds-text-caption ds-text-danger">{{ ephemError }}</p>
    </div>
    <TuileInfos
      :telemetry="telemetry"
      :ephem-loading="ephemLoading"
      :ephem-error="ephemError"
      :ephem-updated="ephemUpdated"
      :traj-status="trajStatus"
      :traj-error="trajError"
      :moon-display-radius-min="MOON_DISPLAY_RADIUS_MIN"
      :mission-step="missionStep"
      :mission-spline-start-label="missionSplineStartLabel"
      :mission-spline-end-label="missionSplineEndLabel"
      :mission-launch-label="missionLaunchLabel"
    />
  </div>
</template>

<style scoped>
.wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ds-color-scrim-light);
  font-family: var(--ds-font-family-sans);
  font-size: var(--ds-font-size-xl);
  color: var(--ds-color-text-primary);
  pointer-events: none;
}

.overlay.soft {
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--ds-space-2);
  font-size: var(--ds-font-size-base);
  color: var(--ds-color-text-secondary);
  background: transparent;
}

.telemetry-hud {
  position: absolute;
  top: var(--ds-space-4);
  left: var(--ds-space-4);
  z-index: 2;
  max-width: min(22rem, calc(100% - 2 * var(--ds-space-4)));
  padding: var(--ds-space-3);
  font-size: var(--ds-font-size-sm);
  pointer-events: none;
}

.telemetry-hud__dl {
  margin: 0;
}

.telemetry-hud__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--ds-space-1) var(--ds-space-3);
  align-items: baseline;
}

.telemetry-hud__row + .telemetry-hud__row {
  margin-top: var(--ds-space-2);
}

.telemetry-hud__dl dt {
  margin: 0;
  color: var(--ds-color-text-secondary);
  font-weight: var(--ds-font-weight-normal);
}

.telemetry-hud__dl dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--ds-color-text-primary);
}

.telemetry-hud__status {
  margin: var(--ds-space-2) 0 0;
  padding-top: var(--ds-space-2);
  border-top: 1px solid var(--ds-color-border-subtle);
}
</style>
