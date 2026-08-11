# HyprEarn AI Copilot — working notes

Vite + React 19 + Tailwind **v4** (CSS-first; `tailwind.config.js` is an empty
stub — theme lives in `src/styles/design-tokens.css`).

## Typography on trading surfaces

Applies to `src/components/terminal/**` and `src/components/trade/**`. Full
reference: [`src/design-system/TYPE-SCALE.md`](src/design-system/TYPE-SCALE.md).

| Role | Class | Size | Weight |
|---|---|---|---|
| Anchor / pair title | `text-anchor` | 18px | 500 — **once per screen** |
| Control / tab / button | `text-control` | 13px | 400 (+`font-medium` active) |
| **Base data & labels** | **`text-data`** | **12px** | 400 |
| Dense numeric cell | `text-micro` | 11px | 400 |
| Eyebrow / table header | `ds-eyebrow` | 11px | 500, UPPERCASE, +0.04em |
| Meta / badge | `text-meta` | 10px | 400 |

Ink ladder — emphasis comes from colour, not weight:
`text-ink` (#fff) · `text-ink-muted` (#bfbfbf) · `text-ink-subtle` (#8f8f8f) ·
`text-ink-faint` (#757575).

**Never write, on a trading surface:**

- `text-[Npx]` — any arbitrary font size
- `text-xs` / `text-sm` / `text-base` / `text-lg` — stock sizes are not the scale
- `font-semibold` / `font-bold` — weight is capped at **500**; use the ink ladder
- `tracking-*` or `uppercase` beside `ds-eyebrow` — already in the class
- `tabular-nums` — inherited from `[data-type-scale="terminal"]` on `<body>`
- `.ds-text-*` — frozen legacy marketing scale, `src/components/ui/` only
- raw grey hexes (`text-[#bfbfbf]` etc.) — use the ink ladder

ESLint enforces the first three. Exempt: the brand wordmark (a logo lockup).

## Conventions

- Files use **CRLF** line endings — multi-line string matching needs `\r\n`.
- `cn()` in `src/lib/utils.js` is a plain join, **not** `twMerge`. Real `twMerge`
  is only in `src/delta-neutral/components/ui/utils.ts`, where it would silently
  drop unknown `text-*` classes.
- `src/delta-neutral/styles/theme.css` is imported **app-wide**, not scoped to
  its subtree, and sets bare `button`/`label`/`input`/`h1`–`h4` to 16–24px in
  `@layer base`. Trading pages neutralise this via `[data-type-scale="terminal"]`.
- Verify with `npx vite build` and `npx eslint <files>`. Two pre-existing
  `react-hooks/set-state-in-effect` errors (`DetailsPanel.jsx`,
  `CopilotStrategySelector.jsx`) are unrelated to any current work.
