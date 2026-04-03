# Technical documentation

## Stack

- **Vue** 3 (Composition API, `<script setup>`)
- **Vite** 6
- **three** r170 — WebGL scene, `OrbitControls`
- **Design system**: `src/styles/tokens.css` + `src/styles/ui.css` (see `Documentation-design-system.md`)

## Structure

- `src/App.vue` — column layout + scene area + shared `timelineLive` / `timelineAt` with the scene and `MissionTimeline.vue`
- `src/components/MissionTimeline.vue` — mission time cursor (OEM), `v-model:live` + `v-model:at`, Live button (`SourcesButton` ghost)
- `src/components/AppHeader.vue` — mission patch, title, “Sources” button (`SourcesButton.vue`)
- `public/artemis-ii-patch.svg` — Artemis II patch (copy of “Artemis II patch” on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Artemis_II_patch.svg), NASA work / public domain)
- `src/components/SourcesModal.vue` — modal (Teleport) listing ephemerides, NASA/three.js links, media usage
- `src/components/AppFooter.vue` — texture credits, AROW, Horizons API
- `src/components/TuileInfos.vue` — HUD tile (telemetry, trajectory, help)
- `src/lib/horizons.js` — Horizons client (SOE parse, UTC dates, ecliptic J2000 → Three.js); `withUniformSampleTimes` / `interpolateTimedRows` for timeline scrub
- `src/components/ArtemisScene.vue` — Three.js canvas, live data, segment polyline trajectory
- Proxy `/jpl-horizons`: `vite.config.js` (dev + preview) and `netlify.toml` (prod) → `https://ssd.jpl.nasa.gov/api/horizons.api` (no open CORS from JPL)
- Textures: remote load from `threejs.org` (three.js examples, MIT), `TextureLoader` + `crossOrigin: anonymous`

## Scale

Distances and speeds shown in the HUD are **derived** from 3D position with an arbitrary scale factor toward “km” orders of magnitude — **demonstration only**.

## Deployment

`npm run build` outputs the `dist/` folder (static, suitable for Netlify, GitHub Pages, etc.).
