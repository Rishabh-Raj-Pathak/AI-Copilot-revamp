# Figma import log — HyprEarn Design System

## File / nodes inspected

| When | URL / node | Canvas |
| ---- | ----------- | ------ |
| 2026-05-12 | `…?node-id=11-1818` | **`components`** |
| 2026-05-12 | `…?node-id=0-1` | **`styles`** |

**File key:** `uO8ilwd7zWauZldkY3o4OT`

## MCP tools used

| Tool | Result |
| ----- | ------ |
| `get_metadata` (`11:1818`, `0:1`) | Success — structure, variant names, and **text labels with HEX values** on the styles canvas. |
| `get_variable_defs` | **Failed** — Figma desktop required a selected layer. |
| `get_design_context` | **Failed** — same selection requirement. |
| `search_design_system` | Partial — library variable **names** for radius (numeric payload not returned). |

## Tokens from **`styles`** (`0:1`) — applied in code

### Core & semantic colors (HEX from swatch labels)

- **Amber (primary):** `#F2B500`
- **Aquamarine (accent):** `#00F3B6`
- **Semantic red / destructive:** `#D53D3D`
- **Semantic green / success:** `#269755`
- **Neutral ramp:** `#000000` → `#0f0f0f` → `#242424` → `#313131` → … → `#BFBFBF` (muted text) → … → `#FFFFFF`
- **Raw ramp** exposed as `--palette-*` in `design-tokens.css` and `rawPalette` in `tokens/colors.ts`.

### Spacing (named steps → px)

Documented in `tokens/spacing.ts`: `none`, `xxxs` (2) … `13xl` (160). Mapped to **Tailwind spacing keys** where they align at 16px rem root.

### Corner radius (named steps → px)

Implemented as `--ds-radius-none` … `--ds-radius-3xl`, `full`; Tailwind `rounded-xs` … `rounded-4xl` mapped to Figma ladder. **24px** (Figma `3xl`) → utility **`rounded-ds-3xl`** (no `rounded-5xl` in default theme).

### Grid

- Desktop **1280px**, tablet **834px**, mobile **402px** — documented in README for layout max-widths.

### Typography

- **Onest**; weights **400 / 600 / 700** called out in Figma — `index.html` now loads **400, 500, 600, 700**.

## Tokens from **`components`** (`11:1818`)

- Component matrices (buttons, inputs, tabs, etc.) — see README component mapping.
- Button frame heights → `--spacing-btn-*`.

## Implementation decisions

- **Semantic colors** reference **hex/sRGB** via CSS variables (with `--palette-*` for ramps) after styles canvas import; easier to diff against Figma labels than prior OKLCH-only guesses.
- **`info` semantic:** not on styles color page — single blue `#4F8AD8` until design adds a swatch.
- **Tailwind v4 CSS-first** theme in `design-tokens.css`; `tailwind.config.js` remains a stub.

## TODOs

- [ ] Re-run **`get_variable_defs`** / **`get_design_context`** with a **selected** Figma layer for shadow specs and text-style exact sizes.
- [ ] Replace **`info`** with a Figma swatch when available.
- [ ] Light theme variables when published.
- [ ] Migrate terminal hardcoded colors to semantic tokens.
