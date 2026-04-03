/**
 * Editorial content for in-app mission views (Crew, Ship, Artemis mission).
 * Summaries align with public NASA Artemis II materials; dates are illustrative for a ~10-day profile.
 * Official reference: https://www.nasa.gov/artemis-ii/
 *
 * Crew images: files in `public/crew/` (portraits originally from Wikimedia Commons / NASA; group photo NASA).
 * Ship tab: files in `public/ship/` (NASA Image Library originals).
 */

export const CREW_GROUP_PHOTO = {
  src: '/crew/group-artemis-ii.jpg',
  alt: 'Artemis II crew official portrait: Reid Wiseman, Victor Glover, Christina Koch, Jeremy Hansen',
  credit: 'NASA / Josh Valcarcel',
  href: 'https://images.nasa.gov/details/jsc2023e016432_alt2',
}

export const CREW_MEMBERS = [
  {
    name: 'Reid Wiseman',
    role: 'Commander',
    agency: 'NASA',
    note: 'U.S. Navy test pilot; prior long-duration stay on the International Space Station (Expedition 41).',
    portrait: {
      src: '/crew/portrait-wiseman.jpg',
      alt: 'Official portrait of NASA astronaut Reid Wiseman',
      credit: 'NASA / Johnson Space Center (Wikimedia Commons)',
      href: 'https://en.wikipedia.org/wiki/Reid_Wiseman',
      commonsHref: 'https://commons.wikimedia.org/wiki/File:Jsc2023e0016434_alt.jpg',
    },
  },
  {
    name: 'Victor Glover',
    role: 'Pilot',
    agency: 'NASA',
    note: 'U.S. Navy aviator and test pilot; first Black astronaut on a lunar-class mission.',
    portrait: {
      src: '/crew/portrait-glover.jpg',
      alt: 'Official portrait of NASA astronaut Victor Glover',
      credit: 'NASA / Johnson Space Center (Wikimedia Commons)',
      href: 'https://en.wikipedia.org/wiki/Victor_Glover',
      commonsHref: 'https://commons.wikimedia.org/wiki/File:Jsc2023e0016433_alt.jpg',
    },
  },
  {
    name: 'Christina Hammock Koch',
    role: 'Mission Specialist',
    agency: 'NASA',
    note: 'Electrical engineer; first woman on a lunar mission under the Artemis program.',
    portrait: {
      src: '/crew/portrait-koch.jpg',
      alt: 'Official portrait of NASA astronaut Christina Koch',
      credit: 'NASA / Johnson Space Center (Wikimedia Commons)',
      href: 'https://en.wikipedia.org/wiki/Christina_Koch',
      commonsHref: 'https://commons.wikimedia.org/wiki/File:Jsc2023e0016435_alt.jpg',
    },
  },
  {
    name: 'Jeremy Hansen',
    role: 'Mission Specialist',
    agency: 'Canadian Space Agency (CSA)',
    note: 'Fighter pilot; first Canadian on a lunar mission.',
    portrait: {
      src: '/crew/portrait-hansen.jpg',
      alt: 'Official portrait of CSA astronaut Jeremy Hansen',
      credit: 'NASA / Johnson Space Center (Wikimedia Commons)',
      href: 'https://en.wikipedia.org/wiki/Jeremy_Hansen',
      commonsHref: 'https://commons.wikimedia.org/wiki/File:Jsc2023e0016436_alt2.jpg',
    },
  },
]

export const MISSION_OBJECTIVES = [
  'First crewed flight of the Space Launch System (SLS) and Orion on an integrated deep-space mission.',
  'Demonstrate Orion life support, avionics, and crew systems with humans beyond low Earth orbit.',
  'Validate communication, navigation, and tracking through NASA’s Deep Space Network.',
  'Exercise rendezvous / proximity operations and manual handling of Orion in space (as planned for the mission).',
  'Gather operational experience to reduce risk for Artemis III and later lunar surface missions.',
]

export const MISSION_HIGH_LEVEL = {
  type: 'Crewed lunar flyby (no landing)',
  crewSize: 4,
  nominalDuration: '~10 days',
  launchSite: 'Kennedy Space Center, Launch Complex 39B, Florida',
  vehicles: 'Space Launch System (SLS) · Orion spacecraft',
  destinationProfile: 'Free-return trajectory around the Moon; Earth return and Pacific splashdown.',
}

/** Approximate flight phases for context (not real-time flight ops). */
export const MISSION_PHASES = [
  { phase: 'Launch & ascent', window: 'Flight Day 0', detail: 'SLS lifts off; Orion separates from the core stage and departs Earth on a lunar trajectory.' },
  { phase: 'Translunar coast', window: 'Flight Days 1–3', detail: 'Crew and ground teams checkout Orion in deep space; trajectory toward the Moon.' },
  { phase: 'Lunar flyby', window: 'Flight Days 4–6 (nominal)', detail: 'Closest approach to the Moon; views of far side; free-return geometry back toward Earth.' },
  { phase: 'Return coast', window: 'Flight Days 6–9', detail: 'Return leg; continued system checks and crew operations.' },
  { phase: 'Re-entry & splashdown', window: 'Flight Day ~10', detail: 'High-energy atmospheric entry; parachutes; recovery in the Pacific.' },
]

export const SHIP_SYSTEMS = [
  {
    title: 'Orion spacecraft',
    summary:
      'NASA’s deep-space crew vehicle: crew module, European Service Module (power, propulsion, thermal), heat shield, and launch abort system stack for ascent.',
    href: 'https://www.nasa.gov/humans-in-space/orion-spacecraft/',
    shipPhoto: {
      src: '/ship/orion-pad.jpg',
      alt: 'Wide view of Artemis I Space Launch System and Orion spacecraft at Launch Pad 39B at sunrise, Kennedy Space Center',
      credit: 'NASA / Ben Smegelsky',
      href: 'https://images.nasa.gov/details/KSC-20220411-PH-JBS01_0004',
    },
  },
  {
    title: 'Space Launch System (SLS)',
    summary:
      'Heavy-lift rocket in a crew configuration for Artemis II: twin solid rocket boosters, core stage (RS-25 engines), and upper stage stack to send Orion toward the Moon.',
    href: 'https://www.nasa.gov/exploration/systems/sls/',
    shipPhoto: {
      src: '/ship/sls-rollout.jpg',
      alt: 'Artemis I fully stacked SLS with Orion rolling out at Kennedy; Vehicle Assembly Building and countdown clock in the background',
      credit: 'NASA / Ben Smegelsky',
      href: 'https://images.nasa.gov/details/KSC-20220816-PH-JBS01_0144',
    },
  },
  {
    title: 'Upper stage (ICPS)',
    summary:
      'Interim Cryogenic Propulsion Stage performs in-space burns (e.g. translunar injection) after core stage separation.',
    href: 'https://www.nasa.gov/sls/',
    shipPhoto: {
      src: '/ship/icps-vab.jpg',
      alt: 'ICPS integration with launch vehicle stage adapter atop the SLS core stage inside the Vehicle Assembly Building high bay',
      credit: 'NASA / Kim Shiflett',
      href: 'https://images.nasa.gov/details/KSC-20210705-PH-KLS01_0097',
    },
  },
  {
    title: 'Ground systems',
    summary:
      'Mobile Launcher, Vehicle Assembly Building, and Launch Complex 39B at Kennedy Space Center integrate, fuel, and launch the vehicle.',
    href: 'https://www.nasa.gov/kennedy/ground-systems-development-and-integration-program/',
    shipPhoto: {
      src: '/ship/mobile-launcher-pad.jpg',
      alt: 'Aerial wide view of Mobile Launcher 1 on Launch Pad 39B at Kennedy Space Center',
      credit: 'NASA / Frank Michaux',
      href: 'https://images.nasa.gov/details/KSC-20190628-PH_FWM01_0146',
    },
  },
]
