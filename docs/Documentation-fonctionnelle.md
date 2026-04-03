# Functional documentation

## Goal

Provide a **main view** of the **Earth — Moon — Orion** system with camera navigation (orbit, zoom).

## Behavior

- **Positions** of the Moon and Orion (Artemis II, Horizons id **-1024**) and Orion **speed**: states from **JPL Horizons** (geometric vectors, Earth center, ecliptic J2000 frame, DE441).
- **Displayed trajectory**: **straight segments** between Horizons samples (avoids Catmull-Rom-style “loop” distortion at ~3 h steps). Mission arc **−1024** (post–ICPS → end of OEM).
- **Moon**: Horizons position; **display radius** floor for visibility (center unchanged).
- **Orion**: enlarged mesh (visual marker), Horizons position.
- **Header**: title “Artemis II”, **centered tabs** (Trajectory · Crew · Ship · Mission), and **Sources**. On **Trajectory**, the **side tile** has three tabs (first by default: **Flight updates**): **Flight updates** (NASA **Missions** blog RSS `https://www.nasa.gov/blogs/missions/feed/` — flight-day / “Flight Update” posts for **Artemis II** only, filtered by title; e.g. crew timeline, burns, spacecraft systems; not raw onboard telemetry; each item links to the blog post; footer links to the RSS URL), **NASA Live** (YouTube embed `https://www.youtube.com/watch?v=6RwfNBtepa4` + link to open on YouTube), and **JPL data** (tab label; measurements, refresh, trajectory text, 3D legend — data from **JPL Horizons**).
- **Trajectory**: 3D scene, HUD tile, and bottom mission timeline (unchanged).
- **Crew / Ship / Artemis mission**: scrollable info panels (summaries + NASA links; content in `src/data/mission-info.js`). **Crew**: photo d’équipe (bloc 16:9, **crédit en overlay** en bas) puis **grille** de fiches astronautes (portraits + texte). Images **local** (`public/crew/*.jpg`); crédits NASA Image Library, Wikipedia, Commons selon le cas. **Ship**: each system card includes a **NASA photo** (bundled under `public/ship/`) with credit and link to the Image Library detail page; wide contextual shots; **contain** within a capped height. Timeline is hidden outside Trajectory.
- **Timeline** (above footer): “ghost” bar (no panel) over the Horizons OEM window; **Live** tracks current time (clamped to the window); drag or click the track to **scrub**; **Live** button returns to API instant states. In scrub mode, Moon / Orion / telemetry are **interpolated** between loaded samples.
- Side panel (**JPL data** tab): distances and speed from **Horizons** (km / km/s).
- Loading message while textures download; fallback to solid spheres if the network fails.

## Limitations

- **Earth**: display radius = Horizons scale (consistent with trajectory). **Moon**: display radius with floor for visibility; **HUD distances** in Horizons km.
- **Earth texture rotation**: rough sidereal approximation, not rigorously ITRF-aligned.
- Horizons ephemerides are **models**; for operational mission / telemetry detail, see **NASA AROW**.
