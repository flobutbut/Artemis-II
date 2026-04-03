# Design system (interface uniquement)

Le rendu WebGL (scène Three.js) n’utilise pas ces tokens ; ils s’appliquent au **chrome HTML** (header, footer, tuile, modale, overlays texte sur le canvas).

## Fichiers

| Fichier | Rôle |
|--------|------|
| `src/styles/tokens.css` | Variables `--ds-*` (couleurs, typo, espacements, rayons, ombres, z-index, mouvement) + alias `--bg`, `--panel`, `--text`, `--muted`, `--accent` |
| `src/styles/ui.css` | Classes `.ds-btn`, `.ds-link`, `.ds-panel`, `.ds-modal*`, titres, typo utilitaire, focus |
| `src/style.css` | Import tokens + ui, reset minimal `#app` |

## Couleurs (extraits)

- **Surfaces** : `--ds-color-bg-app`, `--ds-color-surface-base|raised|overlay`, `--ds-color-scrim`
- **Texte** : `--ds-color-text-primary|secondary|accent|code|danger`
- **Bordures** : `--ds-color-border-subtle|default|strong|interactive`
- **Accent** : `--ds-color-accent`, `--ds-color-accent-subtle|hover|…`

## Typographie

- Familles : `--ds-font-family-sans`, `--ds-font-family-mono`
- Échelles : `--ds-font-size-2xs` … `--ds-font-size-2xl` (tailles en **px**, pas en rem)
- Poids : `--ds-font-weight-medium`, `--ds-font-weight-semibold`

## Composants (classes)

- **Boutons** : `.ds-btn` + `.ds-btn--secondary` | `--ghost` | `--icon` ; `.ds-focusable` pour l’anneau focus
- **`SourcesButton.vue`** : prop `variant` = `primary` | `secondary` | `ghost` (défaut `secondary`) ; le header utilise `ghost` pour « Sources »
- **Liens** : `.ds-link`
- **Panneaux** : `.ds-panel` + `.ds-panel--glass` (tuile HUD)
- **Modale** : `.ds-modal-backdrop`, `.ds-modal`, `.ds-modal__header`, `.ds-modal__title`, `.ds-modal__body`
- **Titres** : `.ds-heading-section`, `.ds-heading-block`
- **Texte** : `.ds-text-caption`, `.ds-text-overline`, `.ds-text-danger`

## Évolutions

Pour un nouveau bouton ou une nouvelle surface, préférer l’ajout d’un **token** sémantique puis d’une **variante** `.ds-btn--*` plutôt que des couleurs en dur dans un composant.
