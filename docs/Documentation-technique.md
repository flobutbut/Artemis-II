# Documentation technique

## Stack

- **Vue** 3 (Composition API, `<script setup>`)
- **Vite** 6
- **three** r170 — scène WebGL, `OrbitControls`
- **Design system** : `src/styles/tokens.css` + `src/styles/ui.css` (voir `Documentation-design-system.md`)

## Structure

- `src/App.vue` — layout colonne + zone scène + état `timelineLive` / `timelineAt` partagé avec la scène et `MissionTimeline.vue`
- `src/components/MissionTimeline.vue` — curseur temps mission (OEM), `v-model:live` + `v-model:at`, bouton Live (`SourcesButton` ghost)
- `src/components/AppHeader.vue` — insigne mission, titre, bouton « Sources » (`SourcesButton.vue`)
- `public/artemis-ii-patch.svg` — patch Artemis II (copie du fichier « Artemis II patch » sur [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Artemis_II_patch.svg), œuvre NASA / domaine public)
- `src/components/SourcesModal.vue` — modale (Teleport) listant éphémérides, liens NASA/three.js, usage médias
- `src/components/AppFooter.vue` — crédits textures, AROW, API Horizons
- `src/components/TuileInfos.vue` — tuile HUD (télémétrie, trajectoire, aide)
- `src/lib/horizons.js` — client Horizons (parse SOE, dates UTC, conversion écliptique J2000 → Three.js) ; `withUniformSampleTimes` / `interpolateTimedRows` pour le scrub timeline
- `src/components/ArtemisScene.vue` — canvas Three.js, données temps réel, trajectoire par segments
- Proxy `/jpl-horizons` : `vite.config.js` (dev + preview) et `netlify.toml` (prod) vers `https://ssd.jpl.nasa.gov/api/horizons.api` (pas de CORS côté JPL)
- Textures : chargement distant depuis `threejs.org` (exemples three.js, MIT), `TextureLoader` + `crossOrigin: anonymous`

## Échelle

Distances et vitesses affichées dans le HUD sont **dérivées** de la position 3D avec un facteur d’échelle arbitraire vers des ordres de grandeur « km » — **à titre démonstratif** uniquement.

## Déploiement

`npm run build` produit le dossier `dist/` (statique, hébergeable sur Netlify, GitHub Pages, etc.).
