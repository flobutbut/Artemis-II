# Project status

| Item              | Status |
| ----------------- | ------ |
| Earth/Moon 3D scene | OK (three.js textures); top-left HUD: Earth / Moon distances + speed (Horizons state vector) |
| Orion mesh (trajectory scene) | Stylized procedural marker |
| Ship tab media    | Bundled JPEGs in `public/ship/` |
| Crew tab media    | Bundled JPEGs in `public/crew/` (group + four portraits) |
| Mission data      | JPL Horizons (-1024, 301), ~90 s polling + trajectory arc |
| Side tile         | Flight updates + NASA Live + JPL (RSS proxy) ; masquer / réafficher ; **≤600px** : **fermée par défaut**, ouverte = **modale** (`Teleport`, scrim, `z-index` modale) |
| Header            | Patch + onglets centrés (ghost) ; **≤600px** : une ligne marque + **burger** à droite, onglets dans panneau téléporté |
| Timeline          | `MissionTimeline.vue` above footer; live vs scrub + cached interpolation ; **≤600px** masque l’heure ISO ; **≤380px** masque le libellé « Live » (point conservé) |
| Footer            | Crédits + bouton **Sources** (droite) + modal ; **≤600px** : padding et typo réduits (tokens) |
| Vite build        | Validate in CI / locally |
| GitHub Pages      | Deploy via `.github/workflows/deploy-pages.yml` (enable Pages → GitHub Actions). Static hosting: JPL + RSS proxies not available (use Netlify for full API) |

Last updated: 2026-04-04.
