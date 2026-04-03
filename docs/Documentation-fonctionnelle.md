# Documentation fonctionnelle

## Objectif

Offrir une **vue principale** du système **Terre — Lune — Orion** avec navigation caméra (orbite, zoom).

## Comportement

- **Positions** de la Lune et d’Orion (Artemis II, identifiant Horizons **-1024**) et **vitesse** d’Orion : états issus de **JPL Horizons** (vecteurs géométriques, centre Terre, repère écliptique J2000, DE441).
- **Trajectoire affichée** : **segments droits** entre les échantillons Horizons (évite la surdéformation type « boucles » d’une Catmull-Rom avec un pas ~3 h). Arc mission **−1024** (post–ICPS → fin OEM).
- **Lune** : position Horizons ; **rayon** d’affichage plancher pour la visibilité (sans déplacer le centre).
- **Orion** : maillage volontairement agrandi (repère visuel), position Horizons.
- **En-tête** : titre « Artemis II » et accès **Sources** ; le détail des éphémérides et la lecture de la scène sont regroupés dans la **tuile** (sections : source Horizons, mesures, actualisation, trajectoire, aide scène 3D).
- **Chronologie** (au-dessus du pied de page) : barre « ghost » (sans panneau) sur la fenêtre OEM Horizons ; **Live** suit l’heure actuelle (bornée à la fenêtre) ; glisser ou cliquer sur la piste pour **scrub** ; bouton **Live** pour repasser sur l’instantané API. En lecture, Lune / Orion / télémétrie sont **interpolés** entre les échantillons chargés.
- Panneau latéral : distances et vitesse d’après **Horizons** (km / km/s).
- Message de chargement pendant le téléchargement des textures ; repli sur sphères unies si échec réseau.

## Limites

- **Terre** : rayon d’affichage = échelle Horizons (cohérent avec la trajectoire). **Lune** : rayon d’affichage avec plancher pour la visibilité ; **distances** HUD en km Horizons.
- **Rotation** de la texture Terre : approximation (sideral) non alignée rigoureusement sur l’ITRF.
- Les éphémérides Horizons sont des **modèles** ; pour le détail mission / télémétrie opérationnelle, voir **NASA AROW**.
