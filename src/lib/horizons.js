/**
 * NASA/JPL Horizons On-Line Ephemeris (https://ssd.jpl.nasa.gov/)
 * Geometric vectors, ecliptic J2000 frame, Earth center (BODY CENTER, code 500).
 * Requests go through /jpl-horizons (Vite / Netlify proxy) because the API is not CORS-open.
 */

export const HORIZONS = {
  MOON: "'301'",
  ARTEMIS_II_ORION: "'-1024'",
  EARTH_CENTER: "'500'",
}

/**
 * Artemis II (Horizons −1024): nominal NASA launch vs OEM window actually covered.
 * JSC segments start after ICPS separation (~3h24 after launch) and end at the last OEM file
 * listed on the Horizons target page (~10 Apr 2026 UTC).
 */
export const ARTEMIS_II_MISSION = {
  launchUtc: new Date('2026-04-01T22:35:12.000Z'),
  trajectoryStartUtc: new Date('2026-04-02T01:59:00.000Z'),
  trajectoryEndUtc: new Date('2026-04-10T23:54:00.000Z'),
}

function horizonsUrl() {
  const b = import.meta.env.BASE_URL ?? '/'
  const base = b.endsWith('/') ? b : `${b}/`
  return `${base}jpl-horizons`
}

function toHorizonsCalendarUtc(date) {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  const y = d.getUTCFullYear()
  const mon = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][d.getUTCMonth()]
  const day = pad(d.getUTCDate())
  const h = pad(d.getUTCHours())
  const m = pad(d.getUTCMinutes())
  const s = pad(d.getUTCSeconds())
  return `${y}-${mon}-${day} ${h}:${m}:${s}`
}

/**
 * Ecliptic J2000 (km) → Three.js (Y up); same convention for all bodies.
 */
export function eclipticKmToThree(x, y, z, scale) {
  return { x: x * scale, y: z * scale, z: -y * scale }
}

export function parseHorizonsVectorBlock(resultText) {
  const start = resultText.indexOf('$$SOE')
  const end = resultText.indexOf('$$EOE')
  if (start < 0 || end < 0) {
    const err = resultText.match(/No ephemeris|error|ERROR[^\n]*/i)
    throw new Error(err ? err[0].slice(0, 200) : 'SOE block not found (Horizons)')
  }
  const block = resultText.slice(start + 5, end)
  const lines = block.split(/\r?\n/).map((l) => l.trim())

  const num = (line, key) => {
    const re = new RegExp(`${key}\\s*=\\s*([\\d.E+-]+)`, 'i')
    const m = re.exec(line)
    return m ? Number(m[1]) : NaN
  }

  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || !/=\s*A\.D\./.test(line)) continue
    const l1 = lines[i + 1] || ''
    const l2 = lines[i + 2] || ''
    const l3 = lines[i + 3] || ''
    if (!l1.includes('X') || !l2.includes('VX')) continue

    rows.push({
      label: line,
      x: num(l1, 'X'),
      y: num(l1, 'Y'),
      z: num(l1, 'Z'),
      vx: num(l2, 'VX'),
      vy: num(l2, 'VY'),
      vz: num(l2, 'VZ'),
      rg: num(l3, 'RG'),
      rr: num(l3, 'RR'),
    })
    i += 3
  }
  if (!rows.length) throw new Error('No state vectors parsed in SOE block')
  return rows
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fetchHorizonsVectors({
  command,
  startTime,
  stopTime,
  stepSize = '1 min',
}) {
  const params = new URLSearchParams({
    format: 'json',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    OBJ_DATA: 'NO',
    COMMAND: command,
    CENTER: HORIZONS.EARTH_CENTER,
    START_TIME: `'${startTime}'`,
    STOP_TIME: `'${stopTime}'`,
    STEP_SIZE: `'${stepSize}'`,
    OUT_UNITS: 'KM-S',
  })
  const url = `${horizonsUrl()}?${params.toString()}`

  // Retry on 503 (Horizons busy): 3 attempts, increasing delay
  let lastErr
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(1500 * attempt)
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      lastErr = e
      continue
    }
    if (res.status === 503 || res.status === 429) {
      lastErr = new Error(`Horizons HTTP ${res.status}`)
      continue
    }
    if (!res.ok) throw new Error(`Horizons HTTP ${res.status}`)
    const data = await res.json()
    if (data?.error) throw new Error(String(data.error).replace(/;/g, '\n').slice(0, 400))
    const text = data?.result
    if (typeof text !== 'string') throw new Error('Invalid Horizons JSON response')
    return parseHorizonsVectorBlock(text)
  }
  throw lastErr ?? new Error('Horizons unavailable (3 attempts)')
}

/** Latest state near the requested instant (wider window to absorb OEM gaps). */
export async function fetchLatestState(command, when = new Date()) {
  // 30 min window centered on "now" to bridge gaps between OEM epochs
  const startDate = new Date(when.getTime() - 15 * 60 * 1000)
  const endDate = new Date(when.getTime() + 15 * 60 * 1000)
  const start = toHorizonsCalendarUtc(startDate)
  const stop = toHorizonsCalendarUtc(endDate)
  const rows = await fetchHorizonsVectors({
    command,
    startTime: start,
    stopTime: stop,
    stepSize: '5 min',
  })
  if (!rows.length)
    throw new Error(`No Horizons state for ${command} around ${when.toISOString()}`)
  // Last row is closest to "now" (centered window)
  return rows[rows.length - 1]
}

/** Trajectory arc in one request. */
export async function fetchTrajectoryArc(command, startDate, stopDate, stepSize = '6 h') {
  return fetchHorizonsVectors({
    command,
    startTime: toHorizonsCalendarUtc(startDate),
    stopTime: toHorizonsCalendarUtc(stopDate),
    stepSize,
  })
}

export function distanceKm(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function speedKmS(row) {
  if (!row) return NaN
  return Math.sqrt(row.vx ** 2 + row.vy ** 2 + row.vz ** 2)
}

/**
 * Attach a `timeMs` to each ephemeris row, uniform spacing between start and end
 * (matches fixed Horizons step over the requested window).
 */
export function withUniformSampleTimes(rows, startDate, endDate) {
  const n = rows.length
  if (!n) return []
  const t0 = startDate.getTime()
  const t1 = endDate.getTime()
  return rows.map((r, i) => ({
    ...r,
    timeMs: t0 + (n === 1 ? 0 : (i / (n - 1)) * (t1 - t0)),
  }))
}

/** Linear interpolation of position / velocity between two Horizons samples. */
export function interpolateTimedRows(rows, timeMs) {
  if (!rows?.length) return null
  const t0 = rows[0].timeMs
  const t1 = rows[rows.length - 1].timeMs
  const t = Math.min(Math.max(timeMs, t0), t1)
  let i = 0
  while (i < rows.length - 1 && rows[i + 1].timeMs < t) i += 1
  const a = rows[i]
  const b = rows[Math.min(i + 1, rows.length - 1)]
  if (!b || a === b || b.timeMs <= a.timeMs) {
    return {
      x: a.x,
      y: a.y,
      z: a.z,
      vx: a.vx,
      vy: a.vy,
      vz: a.vz,
      rg: a.rg,
      rr: a.rr,
      label: a.label,
      timeMs: t,
    }
  }
  const u = (t - a.timeMs) / (b.timeMs - a.timeMs)
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    z: a.z + (b.z - a.z) * u,
    vx: a.vx + (b.vx - a.vx) * u,
    vy: a.vy + (b.vy - a.vy) * u,
    vz: a.vz + (b.vz - a.vz) * u,
    rg: a.rg + (b.rg - a.rg) * u,
    rr: a.rr + (b.rr - a.rr) * u,
    label: a.label,
    timeMs: t,
  }
}
