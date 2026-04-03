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
})

/** Textures : exemples officiels three.js (licence MIT du dépôt). */
const TEX_EARTH = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
const TEX_MOON = 'https://threejs.org/examples/textures/planets/moon_1024.jpg'

/** Physique (WGS84 / IAU) — Terre et trajectoire : même échelle que Horizons. Lune / Orion : taille d'affichage minimale pour les voir (positions inchangées). */
const EARTH_R_KM = 6371.01
const MOON_R_KM = 1737.4
const SCENE_PER_KM = 1 / 170000
const BODY_RADIUS_MUL = 1
/** Rayon Lune en scène : au moins ce minimum (la position reste celle de Horizons). */
const MOON_DISPLAY_RADIUS_MIN = MOON_R_KM * SCENE_PER_KM * 2  // ×2 l'échelle réelle
const canvasRef = ref(null)
const loading = ref(true)
const textureError = ref(null)
const ephemError = ref(null)
const ephemLoading = ref(true)
const ephemUpdated = ref('—')
const trajStatus = ref('Trajectoire : chargement…')
const trajError = ref(null)

const telemetry = shallowRef({
  distEarth: '—',
  distMoon: '—',
  speed: '—',
})

const orionRow = shallowRef(null)
const moonRow = shallowRef(null)
/** Échantillons Horizons avec `timeMs` pour lecture scrub (Orion = arc mission, Lune = orbite locale). */
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
let orbitTargetInitialized = false

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

  /* Repère visible (positions Horizons à l'échelle ; le maillage est volontairement exagéré). */
  g.scale.setScalar(0.014)
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
 * Tube le long de la trajectoire — segments droits entre échantillons Horizons (pas de Catmull-Rom :
 * avec un pas ~3 h, la Catmull-Rom surdéforme et fait des boucles hors de la trajectoire réelle).
 */
/** Un seul TubeGeometry sur tout un CurvePath casse souvent (repères de Frenet aux jonctions) → un tube par segment. */
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

  // Ligne continue sur tous les points — simple, robuste, aucun problème de Frenet frame.
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

  console.log('[Artemis] Trajectoire construite :', pts.length, 'points, premier:', pts[0], 'dernier:', pts[pts.length - 1])
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

    // Centrer l'orbite caméra sur le milieu Terre–Lune, une seule fois au premier chargement
    if (!orbitTargetInitialized && controls) {
      const moonPos = rowToSceneVector(moon)
      // Terre est toujours à l'origine (0,0,0) dans le repère Horizons géocentrique
      controls.target.set(moonPos.x / 2, moonPos.y / 2, moonPos.z / 2)
      controls.update()
      orbitTargetInitialized = true
    }

    applyTelemetryFromRows(moon, orion)
  } catch (e) {
    console.error('[Artemis] État instantané Horizons — erreur :', e)
    ephemError.value = e instanceof Error ? e.message : String(e)
  } finally {
    ephemLoading.value = false
  }
}

/** Spline mission complète : décollage → fin d'éphéméride (Horizons). */
const MISSION_TRAJ_STEP = '1 h'

function missionDateLabel(d) {
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

const missionLaunchLabel = missionDateLabel(ARTEMIS_II_MISSION.launchUtc)
const missionSplineStartLabel = missionDateLabel(ARTEMIS_II_MISSION.trajectoryStartUtc)
const missionSplineEndLabel = missionDateLabel(ARTEMIS_II_MISSION.trajectoryEndUtc)
const missionStep = MISSION_TRAJ_STEP

async function loadMoonOrbit() {
  // Un mois sidéral (~27.3 j) centré sur la mission, pas 6h → ~110 points
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
    line.computeLineDistances()   // requis pour LineDashedMaterial
    line.frustumCulled = false
    line.renderOrder = 5

    moonOrbitRoot = line
    scene.add(moonOrbitRoot)

    // Trainée initiale au temps réel
    buildMoonTrail(Date.now())
  } catch (e) {
    console.warn('[Artemis] Orbite lunaire :', e)
  }
}

/**
 * Reconstruit la trainée de la Lune centrée sur `nowMs`.
 * Appelé au chargement ET à chaque mise à jour de moonRow (live ou timeline scrub).
 */
function buildMoonTrail(nowMs) {
  disposeTrajectory(moonTrailRoot)
  moonTrailRoot = null

  const timed = moonOrbitTimed.value
  if (!timed?.length || !scene) return

  const trailMs = 3 * 24 * 3600 * 1000
  const trailRows = timed.filter((r) => r.timeMs <= nowMs && r.timeMs >= nowMs - trailMs)
  // Premier point futur pour que la tête de trainée colle à la position interpolée
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

// Resynchronise la trainée à chaque changement de moonRow :
// — live : poll 90 s avec timeMs = Date.now()
// — timeline scrub : interpolateTimedRows assigne row.timeMs au temps simulé
watch(moonRow, (row) => {
  if (!row) return
  buildMoonTrail(typeof row.timeMs === 'number' ? row.timeMs : Date.now())
})

async function loadFullMissionTrajectory() {
  trajError.value = null
  trajStatus.value = 'Trajectoire : chargement Horizons…'
  try {
    const rows = await fetchTrajectoryArc(
      HORIZONS.ARTEMIS_II_ORION,
      ARTEMIS_II_MISSION.trajectoryStartUtc,
      ARTEMIS_II_MISSION.trajectoryEndUtc,
      MISSION_TRAJ_STEP,
    )
    orionTrajTimed.value = withUniformSampleTimes(
      rows,
      ARTEMIS_II_MISSION.trajectoryStartUtc,
      ARTEMIS_II_MISSION.trajectoryEndUtc,
    )
    const next = buildTrajectoryGroup(rows)
    if (!next) {
      trajStatus.value = 'Trajectoire : pas assez de points'
      trajError.value = 'Éphéméride reçue mais spline invalide (points insuffisants).'
      return
    }
    if (scene) {
      disposeTrajectory(trajectoryRoot)
      trajectoryRoot = next
      scene.add(trajectoryRoot)
      trajStatus.value = `Trajectoire : spline (${rows.length} échantillons Horizons)`
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[Artemis] Trajectoire Horizons — erreur complète :', e)
    console.error('[Artemis] Message :', msg)
    trajError.value = msg
    trajStatus.value = 'Trajectoire : échec (voir détail ci-dessous)'
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
  // nextTick attend le prochain cycle Vue, rAF attend que le navigateur ait terminé le layout
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
  // false = ne pas écraser le style CSS du canvas (la taille affichée reste pilotée par le CSS)
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

  // Démarrer la boucle de rendu immédiatement — la scène affiche déjà les étoiles
  // pendant que les textures et les éphémérides chargent en arrière-plan.
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
    textureError.value = 'Textures : échec réseau (la scène utilise des couleurs de secours).'
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

  watch(
    [
      () => props.timelineLive,
      () => props.timelineAt.getTime(),
      orionTrajTimed,
      moonOrbitTimed,
    ],
    () => {
      if (!props.timelineLive && orionTrajTimed.value?.length && moonOrbitTimed.value?.length) {
        applyScrubbedState(props.timelineAt)
      }
      if (props.timelineLive) {
        void refreshInstantStates()
      }
    },
  )
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.clearInterval(pollTimer)
  window.removeEventListener('resize', onResize)
  disposeTrajectory(trajectoryRoot)
  trajectoryRoot = null
  disposeTrajectory(moonOrbitRoot)
  moonOrbitRoot = null
  disposeTrajectory(moonTrailRoot)
  moonTrailRoot = null
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
    <div v-if="loading" class="overlay">Chargement des textures…</div>
    <div v-else-if="textureError" class="overlay soft">{{ textureError }}</div>
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
</style>
