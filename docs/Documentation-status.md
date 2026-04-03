# État du projet

| Élément            | Statut                          |
| ------------------ | ------------------------------- |
| Scène 3D Terre/Lune | OK (textures three.js)         |
| Maillage Orion     | Stylisé procédural              |
| Données mission    | JPL Horizons (-1024, 301), polling ~90 s + arc traj. |
| Tuile latérale     | Texte source Horizons + mesures / actu / traj. / aide scène (header allégé). |
| Header             | Patch Artemis II (`public/artemis-ii-patch.svg`) + `SourcesButton.vue`. |
| Timeline           | `MissionTimeline.vue` au-dessus du footer ; live vs scrub + interpolation caches. |
| Build Vite         | À valider en CI / machine locale |

Dernière mise à jour : avril 2026.
