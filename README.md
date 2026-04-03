# Artemis II — vue Terre · Lune · Orion

Application **Vue 3** + **Vite** + **Three.js** : positions **Orion (Artemis II)** et **Lune** via l’**API JPL Horizons** (NASA/JPL), modèle 3D stylisé d’Orion.

## Prérequis

- **Node.js** 18+
- **npm** ou **Yarn**

## Commandes

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run preview
```

## Éphémérides

- Source : [Horizons On-Line Ephemeris System](https://ssd.jpl.nasa.gov/horizons/) (API `horizons.api`).
- Cible Orion / Artemis II : **`-1024`** ; Lune : **`301`** ; centre : **Terre (code `500`, corps)**.
- En **développement** et **`vite preview`**, les requêtes passent par le **proxy** défini dans `vite.config.js` (`/jpl-horizons` → `ssd.jpl.nasa.gov`).
- Déploiement **Netlify** : voir `netlify.toml` (même chemin). Autre hébergeur : prévoir un proxy équivalent (l’API JPL ne renvoie pas d’en-têtes CORS ouverts).

## Visuels et droits

- **Textures Terre / Lune** : fichiers d’exemple du projet [three.js](https://github.com/mrdoob/three.js) (`examples/textures/planets/`), chargés depuis `threejs.org` — licence **MIT** (voir le dépôt three.js).
- **Orion** : géométrie procédurale dans le code (pas de maillage NASA embarqué).
- **Étoiles** : points générés en code.

Suivi mission réel : [NASA AROW — trackartemis](https://www.nasa.gov/trackartemis).

## Documentation projet

Voir le dossier `docs/` :

- `Documentation-technique.md`
- `Documentation-fonctionnelle.md`
- `Documentation-status.md`
