# Functional documentation

## Goal

Provide a **main view** of the **Earth — Moon — Orion** system with camera navigation (orbit, zoom).

## Behavior

- **Positions** of the Moon and Orion (Artemis II, Horizons id **-1024**) and Orion **speed**: states from **JPL Horizons** (geometric vectors, Earth center, ecliptic J2000 frame, DE441).
- **Displayed trajectory**: **straight segments** between Horizons samples (avoids Catmull-Rom-style “loop” distortion at ~3 h steps). Mission arc **−1024** (post–ICPS → end of OEM).
- **Moon**: Horizons position; **display radius** floor for visibility (center unchanged).
- **Orion**: enlarged mesh (visual marker), Horizons position.
- **Header**: title “Artemis II”, **centered tabs** (Trajectory · Crew · Ship · Mission) sur vue large. **Sources** (modal crédits / liens) est dans le **pied de page**, à droite des mentions légales et liens. Sur **écrans étroits (≤600px)** : **une seule rangée** (marque à gauche, **menu burger** à droite) ; les sections s’ouvrent dans un **panneau** (liste d’onglets) avec fond cliquable pour fermer. Barre un peu plus haute ; **titre et patch** reprennent la **même échelle** qu’en vue large (`--ds-font-size-2xl`, `--ds-size-logo`). On **Trajectory**, the **side tile** has three tabs (first by default: **Flight updates**); **chevron-right icon** to the right of the tab row **hides** the tile (YouTube embed unmounted); a **compact glass button** (chevron left) top-right **restores** it. On **narrow viewports (≤600px)** the tile starts **closed**; when opened it covers the UI as a **modal** (backdrop, centered panel, Escape to close). Tabs — **Flight updates** (NASA **Missions** blog RSS `https://www.nasa.gov/blogs/missions/feed/` — flight-day / “Flight Update” posts for **Artemis II** only, filtered by title; e.g. crew timeline, burns, spacecraft systems; not raw onboard telemetry; each item links to the blog post; footer links to the RSS URL), **NASA Live** (YouTube embed `https://www.youtube.com/watch?v=6RwfNBtepa4` + link to open on YouTube), and **JPL data** (tab label; measurements, refresh, trajectory text, 3D legend — data from **JPL Horizons**).
- **Trajectory**: 3D scene, HUD tile, and bottom mission timeline (unchanged).
- **Crew / Ship / Artemis mission**: scrollable info panels (summaries + NASA links; content in `src/data/mission-info.js`). **Crew**: photo d’équipe (bloc 16:9, **crédit en overlay** en bas) puis **grille** de fiches astronautes (portraits + texte). Images **local** (`public/crew/*.jpg`); crédits NASA Image Library, Wikipedia, Commons selon le cas. **Ship**: each system card includes a **NASA photo** (bundled under `public/ship/`) with credit and link to the Image Library detail page; wide contextual shots; **contain** within a capped height. Timeline is hidden outside Trajectory.
- **Timeline** (above footer): “ghost” bar (no panel) over the Horizons OEM window; **Live** tracks current time (clamped to the window); drag or click the track to **scrub**; **Live** button returns to API instant states. In scrub mode, Moon / Orion / telemetry are **interpolated** between loaded samples. **≤600px** : la date/heure textuelle à côté du curseur est masquée pour libérer la piste. **≤380px** : seul l’indicateur (point) du bouton Live reste visible.
- Side panel (**JPL data** tab): distances and speed from **Horizons** (km / km/s).
- Loading message while textures download; fallback to solid spheres if the network fails.

## Limitations

- **Earth**: display radius = Horizons scale (consistent with trajectory). **Moon**: display radius with floor for visibility; **HUD distances** in Horizons km.
- **Earth texture rotation**: rough sidereal approximation, not rigorously ITRF-aligned.
- Horizons ephemerides are **models**; for operational mission / telemetry detail, see **NASA AROW**.
