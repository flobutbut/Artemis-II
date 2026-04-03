# Design system (HTML UI only)

WebGL rendering (Three.js scene) does not use these tokens; they apply to **HTML chrome** (header, footer, tile, modal, text overlays on the canvas).

## Files

| File | Role |
|------|------|
| `src/styles/tokens.css` | `--ds-*` variables (colors, type, spacing, radii, shadows, z-index, motion, scrollbars) + legacy aliases `--bg`, `--panel`, `--text`, `--muted`, `--accent` |
| `src/styles/ui.css` | Classes `.ds-btn`, `.ds-link`, `.ds-panel`, `.ds-modal*`, headings, utility type, focus |
| `src/style.css` | Imports tokens + ui, minimal `#app` reset, barres de défilement globales (Firefox + WebKit) |

## Colors (excerpt)

- **Surfaces**: `--ds-color-bg-app`, `--ds-color-surface-base|raised|overlay`, `--ds-color-scrim`
- **Text**: `--ds-color-text-primary|secondary|accent|code|danger` (secondary / tertiary use `--ds-palette-neutral-500|600`)
- **Borders**: `--ds-color-border-subtle|default|strong|interactive`
- **Scrollbars** (zones `overflow: auto|scroll`) : `--ds-scrollbar-width`, `--ds-color-scrollbar-track`, `--ds-color-scrollbar-thumb`, `--ds-color-scrollbar-thumb-hover`
- **Accent**: `--ds-color-accent`, `--ds-color-accent-subtle|hover|…`
- **Neutral** (generic chrome): `--ds-palette-neutral-400` … `--ds-palette-neutral-700`, `--ds-color-neutral-border|border-hover|fill|fill-muted|ring`
- **Red** (generic emphasis / alert): `--ds-palette-red-100` … `--ds-palette-red-600`, `--ds-color-red-border|border-hover|text|text-hover|fill|ring`, `--ds-shadow-red-soft`

## Typography

- Families: `--ds-font-family-sans`, `--ds-font-family-mono`
- Scales: `--ds-font-size-2xs` … `--ds-font-size-2xl` (sizes in **px**, not rem)
- Weights: `--ds-font-weight-regular`, `--ds-font-weight-medium`, `--ds-font-weight-semibold` (onglets `DsTabs` : `regular` ; légendes `.ds-text-caption` : `regular`)

## Components (classes)

- **Buttons**: `.ds-btn` + `.ds-btn--secondary` | `--ghost` | `--icon`; `.ds-focusable` for focus ring
- **`SourcesButton.vue`**: `variant` prop = `primary` | `secondary` | `ghost` (default `secondary`); header uses `ghost` for “Sources”
- **`LiveModeButton.vue`**: timeline control; prop `live` — generic `--ds-color-red-*` when on, `--ds-color-neutral-*` when idle; uppercase “LIVE” with leading dot
- **`DsTabs.vue`**: `v-model` string id + `tabs: { id, label }[]`; **ghost** : `ds-tabs__ghost-fill` + `ds-tabs__ghost-stack` (label + `ds-tabs__ghost-line`) ; trait actif en `absolute` (`bottom: -var(--ds-space-6)`) = bas du bouton, largeur du texte ; padding tab conservé ; prop `variant`: `default` | `ghost`
- **Links**: `.ds-link`
- **Panels**: `.ds-panel` + `.ds-panel--glass` (HUD tile)
- **Modal**: `.ds-modal-backdrop`, `.ds-modal`, `.ds-modal__header`, `.ds-modal__title`, `.ds-modal__body`
- **Headings**: `.ds-heading-section`, `.ds-heading-block`
- **Text**: `.ds-text-caption`, `.ds-text-overline`, `.ds-text-danger`

## Evolution

For a new button or surface, prefer adding a **semantic token** then a `.ds-btn--*` variant rather than hard-coded colors in a component.
