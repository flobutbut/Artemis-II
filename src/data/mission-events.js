/**
 * Key Artemis II mission events within the Horizons OEM window.
 * OEM window: 2026-04-02T01:59:00Z → 2026-04-10T23:54:00Z
 * (Orion trajectory data begins after ICPS separation ~3 h 24 min post-launch.)
 */
export const MISSION_EVENTS = [
  {
    id: 'orion-sep',
    timeMs: Date.UTC(2026, 3, 2, 1, 59, 0),
    label: 'Orion / ICPS Separation',
    description:
      'Orion separates from the Interim Cryogenic Propulsion Stage and begins independent free-flight toward the Moon.',
    type: 'milestone',
  },
  {
    id: 'mcc1',
    timeMs: Date.UTC(2026, 3, 3, 6, 0, 0),
    label: 'Mid-Course Correction 1',
    description:
      'First MCC burn refines the free-return lunar trajectory. Small thruster firing of a few minutes.',
    type: 'burn',
  },
  {
    id: 'lunar-soi',
    timeMs: Date.UTC(2026, 3, 5, 12, 0, 0),
    label: 'Lunar Sphere of Influence',
    description:
      "Orion enters the Moon's gravitational sphere of influence (~66,000 km from the surface). Lunar gravity becomes dominant.",
    type: 'milestone',
  },
  {
    id: 'lunar-flyby',
    timeMs: Date.UTC(2026, 3, 6, 8, 0, 0),
    label: 'Closest Lunar Approach',
    description:
      'Orion reaches its closest approach (~8,900 km from the Moon) — the farthest humans from Earth since Apollo 17 in 1972.',
    type: 'flyby',
  },
  {
    id: 'mcc3',
    timeMs: Date.UTC(2026, 3, 9, 8, 0, 0),
    label: 'Return Correction Burn',
    description:
      'MCC-3 trajectory correction burn to precisely target the re-entry corridor for Pacific Ocean splashdown.',
    type: 'burn',
  },
  {
    id: 'entry',
    timeMs: Date.UTC(2026, 3, 10, 22, 40, 0),
    label: 'Entry Interface',
    description:
      "Orion enters Earth's atmosphere at 122 km altitude, beginning its skip-entry hypersonic re-entry at ~11 km/s.",
    type: 'reentry',
  },
  {
    id: 'splashdown',
    timeMs: Date.UTC(2026, 3, 10, 23, 54, 0),
    label: 'Splashdown',
    description:
      'Orion splashes down in the Pacific Ocean off the coast of California. End of mission. Duration: ~10 days.',
    type: 'landing',
  },
]
