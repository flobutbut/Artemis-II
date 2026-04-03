# Technical documentation

## Stack

- **Vue** 3 (Composition API, `<script setup>`)
- **Vite** 6
- **three** r170 — WebGL scene, `OrbitControls`
- **Design system**: `src/styles/tokens.css` + `src/styles/ui.css` (see `Documentation-design-system.md`)

## Structure

- `src/App.vue` — column layout + `mainTab` (trajectory vs info views) + scene area + shared `timelineLive` / `timelineAt` with `MissionTimeline.vue`
- `src/components/DsTabs.vue` — reusable tablist (design tokens); `variant` `default` | `ghost`; optional `ariaLabel` for nested tablists (e.g. `TuileInfos`)
- `src/components/MissionInfoPanel.vue` — Crew / Ship / Artemis mission copy (data from `src/data/mission-info.js`); **Crew & Ship photos** served from `public/crew/*.jpg` and `public/ship/*.jpg` (bundled copies; attribution links still point to NASA Image Library / Wikipedia / Commons)
- `src/data/mission-info.js` — editorial summaries + NASA links; `portrait` / `shipPhoto` use **root-relative** paths (`/crew/…`, `/ship/…`) plus alt, credit, external detail links
- `src/components/MissionTimeline.vue` — mission time cursor (OEM), `v-model:live` + `v-model:at`, `LiveModeButton`
- `src/components/LiveModeButton.vue` — bordered LIVE toggle (dot + caps); uses generic `--ds-color-red-*` / `--ds-color-neutral-*` tokens
- `src/components/AppHeader.vue` — mission patch, title, `bar-center` en `align-self: stretch` + `DsTabs` ghost `height: 100%` pour ancrer le soulignement en bas de la barre ; “Sources” (`SourcesButton.vue`)
- `public/artemis-ii-patch.svg` — Artemis II patch (copy of “Artemis II patch” on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Artemis_II_patch.svg), NASA work / public domain)
- `public/crew/*.jpg` — group + astronaut portraits (Wikimedia Commons + NASA); **resized for UI** (~768 px longest edge on portraits, ~1440 px on group) via `sips -Z` so cards don’t downscale 4k sources
- `public/ship/*.jpg` — Ship tab photos (NASA); **max 1280 px** longest edge
- `src/components/SourcesModal.vue` — modal (Teleport) listing ephemerides, NASA/three.js links, media usage
- `src/components/AppFooter.vue` — texture credits, AROW, Horizons API
- `src/components/TuileInfos.vue` — Trajectory HUD tile: `DsTabs` → **Flight updates** (default tab; NASA Missions blog RSS, Artemis II title filter, fetched on first open) | **NASA Live** (YouTube iframe embed id `6RwfNBtepa4`, mounted only when tab active) | **JPL data** (Horizons measurements / trajectory copy; tab label shortened from full “JPL Horizons” name)
- `src/lib/nasa-missions-blog-feed.js` — fetch `/nasa-missions-blog-feed`, `DOMParser` RSS → items whose title matches `Artemis II` → `{ title, link, pubDate }[]`
- `src/lib/horizons.js` — Horizons client (SOE parse, UTC dates, ecliptic J2000 → Three.js); `withUniformSampleTimes` / `interpolateTimedRows` for timeline scrub
- `src/components/ArtemisScene.vue` — Three.js canvas, live data, segment polyline trajectory
- Proxy `/jpl-horizons`: `vite.config.js` (dev + preview) and `netlify.toml` (prod) → `https://ssd.jpl.nasa.gov/api/horizons.api` (no open CORS from JPL)
- Proxy `/nasa-missions-blog-feed` → `https://www.nasa.gov/blogs/missions/feed/` (RSS XML; browser fetch same-origin)
- Textures: remote load from `threejs.org` (three.js examples, MIT), `TextureLoader` + `crossOrigin: anonymous`

## Scale

Distances and speeds shown in the HUD are **derived** from 3D position with an arbitrary scale factor toward “km” orders of magnitude — **demonstration only**.

## Deployment

`npm run build` outputs the `dist/` folder (static, suitable for Netlify, GitHub Pages, etc.).
