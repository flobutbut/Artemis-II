# Project status

| Item              | Status |
| ----------------- | ------ |
| Earth/Moon 3D scene | OK (three.js textures) |
| Orion mesh (trajectory scene) | Stylized procedural marker |
| Ship tab media    | Bundled JPEGs in `public/ship/` |
| Crew tab media    | Bundled JPEGs in `public/crew/` (group + four portraits) |
| Mission data      | JPL Horizons (-1024, 301), ~90 s polling + trajectory arc |
| Side tile         | Flight updates (default) + NASA Live + JPL data (Missions blog RSS via proxied path under `BASE_URL`; Horizons in last tab) |
| Header            | Patch + centered tabs + `SourcesButton` |
| Timeline          | `MissionTimeline.vue` above footer; live vs scrub + cached interpolation |
| Vite build        | Validate in CI / locally |
| GitHub Pages      | Deploy via `.github/workflows/deploy-pages.yml` (enable Pages → GitHub Actions). Static hosting: JPL + RSS proxies not available (use Netlify for full API) |

Last updated: 2026-04-03.
