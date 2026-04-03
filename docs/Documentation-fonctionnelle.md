# Functional documentation

## Goal

Provide a **main view** of the **Earth — Moon — Orion** system with camera navigation (orbit, zoom).

## Behavior

- **Positions** of the Moon and Orion (Artemis II, Horizons id **-1024**) and Orion **speed**: states from **JPL Horizons** (geometric vectors, Earth center, ecliptic J2000 frame, DE441).
- **Displayed trajectory**: **straight segments** between Horizons samples (avoids Catmull-Rom-style “loop” distortion at ~3 h steps). Mission arc **−1024** (post–ICPS → end of OEM).
- **Moon**: Horizons position; **display radius** floor for visibility (center unchanged).
- **Orion**: enlarged mesh (visual marker), Horizons position.
- **Header**: title “Artemis II” and **Sources**; ephemeris detail and scene legend are in the **side tile** (sections: Horizons source, measurements, refresh, trajectory, 3D scene help).
- **Timeline** (above footer): “ghost” bar (no panel) over the Horizons OEM window; **Live** tracks current time (clamped to the window); drag or click the track to **scrub**; **Live** button returns to API instant states. In scrub mode, Moon / Orion / telemetry are **interpolated** between loaded samples.
- Side panel: distances and speed from **Horizons** (km / km/s).
- Loading message while textures download; fallback to solid spheres if the network fails.

## Limitations

- **Earth**: display radius = Horizons scale (consistent with trajectory). **Moon**: display radius with floor for visibility; **HUD distances** in Horizons km.
- **Earth texture rotation**: rough sidereal approximation, not rigorously ITRF-aligned.
- Horizons ephemerides are **models**; for operational mission / telemetry detail, see **NASA AROW**.
