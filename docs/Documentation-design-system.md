# Design system (HTML UI only)

WebGL rendering (Three.js scene) does not use these tokens; they apply to **HTML chrome** (header, footer, tile, modal, text overlays on the canvas).

## Files

| File | Role |
|------|------|
| `src/styles/tokens.css` | `--ds-*` variables (colors, type, spacing, radii, shadows, z-index, motion) + legacy aliases `--bg`, `--panel`, `--text`, `--muted`, `--accent` |
| `src/styles/ui.css` | Classes `.ds-btn`, `.ds-link`, `.ds-panel`, `.ds-modal*`, headings, utility type, focus |
| `src/style.css` | Imports tokens + ui, minimal `#app` reset |

## Colors (excerpt)

- **Surfaces**: `--ds-color-bg-app`, `--ds-color-surface-base|raised|overlay`, `--ds-color-scrim`
- **Text**: `--ds-color-text-primary|secondary|accent|code|danger`
- **Borders**: `--ds-color-border-subtle|default|strong|interactive`
- **Accent**: `--ds-color-accent`, `--ds-color-accent-subtle|hover|…`

## Typography

- Families: `--ds-font-family-sans`, `--ds-font-family-mono`
- Scales: `--ds-font-size-2xs` … `--ds-font-size-2xl` (sizes in **px**, not rem)
- Weights: `--ds-font-weight-medium`, `--ds-font-weight-semibold`

## Components (classes)

- **Buttons**: `.ds-btn` + `.ds-btn--secondary` | `--ghost` | `--icon`; `.ds-focusable` for focus ring
- **`SourcesButton.vue`**: `variant` prop = `primary` | `secondary` | `ghost` (default `secondary`); header uses `ghost` for “Sources”
- **Links**: `.ds-link`
- **Panels**: `.ds-panel` + `.ds-panel--glass` (HUD tile)
- **Modal**: `.ds-modal-backdrop`, `.ds-modal`, `.ds-modal__header`, `.ds-modal__title`, `.ds-modal__body`
- **Headings**: `.ds-heading-section`, `.ds-heading-block`
- **Text**: `.ds-text-caption`, `.ds-text-overline`, `.ds-text-danger`

## Evolution

For a new button or surface, prefer adding a **semantic token** then a `.ds-btn--*` variant rather than hard-coded colors in a component.
