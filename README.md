# Artemis II — Earth · Moon · Orion view

**Vue 3** + **Vite** + **Three.js** app: **Orion (Artemis II)** and **Moon** positions via the **JPL Horizons API** (NASA/JPL), with a stylized 3D Orion model.

## Requirements

- **Node.js** 18+
- **npm** or **Yarn**

## Environment (optional)

- Copy **`.env.example`** to **`.env`** and set **`GITHUB_TOKEN`** if a tool or script needs a [GitHub personal access token](https://github.com/settings/tokens) (e.g. `gh` CLI). Do **not** use a `VITE_` prefix for secrets: they would be embedded in the client bundle.

## Commands

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Ephemerides

- Source: [Horizons On-Line Ephemeris System](https://ssd.jpl.nasa.gov/horizons/) (`horizons.api` API).
- Orion / Artemis II target: **`-1024`**; Moon: **`301`**; center: **Earth (body code `500`)**.
- In **development** and **`vite preview`**, requests go through the **proxy** in `vite.config.js` (`/jpl-horizons` → `ssd.jpl.nasa.gov`).
- **Netlify** deployment: see `netlify.toml` (same path). Other hosts: provide an equivalent proxy (the JPL API does not send permissive CORS headers).

## Visuals and rights

- **Earth / Moon textures**: sample files from the [three.js](https://github.com/mrdoob/three.js) project (`examples/textures/planets/`), loaded from `threejs.org` — **MIT** license (see the three.js repo).
- **Orion**: procedural geometry in code (no embedded NASA mesh).
- **Stars**: procedurally generated points.

Live mission tracking: [NASA AROW — trackartemis](https://www.nasa.gov/trackartemis).

## GitHub Pages

After pushing to `main`, enable **Settings → Pages → Source: GitHub Actions**. The workflow `.github/workflows/deploy-pages.yml` publishes `dist/`. GitHub Pages does not provide the JPL/NASA **proxies** used on Netlify; for live ephemeris and the Missions RSS in production, prefer Netlify or another host with URL rewrites (see `docs/Documentation-technique.md` → Deployment).

## Project documentation

See the `docs/` folder:

- `Documentation-technique.md`
- `Documentation-fonctionnelle.md`
- `Documentation-status.md`
- `Documentation-design-system.md`
