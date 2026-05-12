# HyprEarn design system (code)

This package mirrors the **HyprEarn Design System** Figma file using **Tailwind CSS v4**, **CSS variables**, and **reusable UI primitives** under `src/components/ui/`.

**Figma canvases**

| Canvas (node)   | Purpose |
| --------------- | ------- |
| **`styles` (`0:1`)** | Typography, spacing scale, corner radius, color ramps, grid breakpoints, drop shadow reference. |
| **`components` (`11:1818`)** | Component symbols (buttons, inputs, tabs, …). |

## Stack notes

- **Framework:** Vite + React (`.jsx` app code).
- **Tailwind:** v4 via `@tailwindcss/vite` — theme extension lives in `src/styles/design-tokens.css` (`@theme inline`), not in a large `tailwind.config` tree.
- **TypeScript:** Token modules are `.ts` for typed exports; components stay `.jsx` to match the repo.

## Token categories

| Category   | Source in repo                         | Tailwind usage examples                          |
| ---------- | -------------------------------------- | ------------------------------------------------ |
| Colors     | `--ds-*` → `@theme` `--color-*`        | `bg-background`, `text-muted-foreground`, `border-border` |
| Typography | `--ds-text-*` + `.ds-text-*` classes   | `ds-text-heading-2`, `ds-text-body-sm`           |
| Spacing    | Figma named steps (`xxxs` … `13xl`) ↔ Tailwind `spacing-*` (see `tokens/spacing.ts`) | `p-4` (= 16px = Figma `xl`), `gap-2.5` (= 10px = Figma `md`) |
| Radius     | Figma corner ladder → `--ds-radius-*` + Tailwind `rounded-*` (see table below) | `rounded-md` (= 6px), `rounded-ds-3xl` (= 24px) |
| Shadows    | `--ds-shadow-*` / `--shadow-ds-*`     | `shadow-ds-sm`, `shadow-ds-md`                 |
| Z-index    | Tailwind defaults                      | `z-50` on toast viewport                         |

## Figma → code mapping (semantic)

| Figma naming / pattern | Code token / API |
| ---------------------- | ---------------- |
| `style=primary` buttons | `Button` `variant="default"` |
| `style=outline` | `variant="outline"` |
| `style=link` | `variant="link"` |
| `button / destructive` | `variant="destructive"` |
| Sizes `xs`–`lg` + icon-only | `Button` `size` + `icon` |
| `chip` styles brand / neutral / positive / negative | `Badge` `variant` (`brand`, `neutral`, `success`, `destructive`) |
| `input-field` states | `Input` / `Textarea` / `Select` + `error`, `disabled` |
| `checkbox`, `radio-button` | `Checkbox`, `Radio` (native, `accent-color`) |
| `Toggle` | `Switch` |
| `tab` sizes lg/sm | `TabsTrigger` `size` |
| `toast` types | `Toast` `variant` |
| `nav-bar`, `nav-item` | `Navbar`, `NavbarItem` |
| `sidebar` | `Sidebar` |
| `dropdown`, `dropdown-list` | `Dropdown`, `DropdownItem` |
| Global variables `radius/*` (library) | Same px ladder as **Corner Radius** on `styles`; implementation uses `--ds-radius-*` + `@theme` `rounded-*` mapping. |
| Terminal Copilot «View Thesis» | CSS `--ds-terminal-view-thesis-*` + `.ds-terminal-view-thesis-button`; Lucide `File`; TS `terminalViewThesisButton` in `tokens/terminalViewThesis.ts` |
| Terminal filters KPI row | `.ds-terminal-kpi-label` / `.ds-terminal-kpi-value`; gradient `--ds-brand-gradient-horizontal`; TS `terminalKpiBar` in `tokens/terminalKpiBar.ts` |
| Terminal details sliders (margin %, leverage) | `.ds-terminal-slider*` + `--ds-terminal-slider-*`; brand ramp `--ds-brand-gradient-horizontal`; TS `terminalSetupSlider` in `tokens/terminalSetupSlider.ts` |
| Terminal gradient CTA (Connect Wallet, Refresh) | `.ds-terminal-gradient-cta` + `--ds-terminal-connect-wallet-*`; TS `terminalGradientCta` |

### Corner radius: Figma name → `--ds-radius-*` → Tailwind

| Figma (styles) | `--ds-radius-*` | Tailwind utility |
| -------------- | ----------------- | ------------------ |
| sharp `0` | `--ds-radius-none` | `rounded-none` |
| xxxs `2px` | `--ds-radius-xxxs` | `rounded-xs` |
| xxs `4px` | `--ds-radius-xxs` | `rounded-sm` |
| xs `6px` | `--ds-radius-xs` | `rounded-md` |
| sm `8px` | `--ds-radius-sm` | `rounded-lg` |
| md `10px` | `--ds-radius-md` | `rounded-xl` |
| lg `12px` | `--ds-radius-lg` | `rounded-2xl` |
| xl `16px` | `--ds-radius-xl` | `rounded-3xl` |
| 2xl `20px` | `--ds-radius-2xl` | `rounded-4xl` |
| 3xl `24px` | `--ds-radius-3xl` | **`rounded-ds-3xl`** (utility class; no `rounded-5xl` in theme) |
| round | `--ds-radius-full` | `rounded-full` |

### Layout grid (from `styles` → Grid frame)

- **Desktop** content width **1280px** (12 × ~75px columns in metadata).
- **Tablet** **834px** (8 columns).
- **Mobile** **402px** (4 columns).

Use these as `max-w-*` / breakpoint targets alongside your product breakpoints.

### Onest font weights

Figma lists **400 / 600 / 700**. `index.html` loads **400, 500, 600, 700** so labels (`500`) and headings (`600`/`700`) are covered.

## Component inventory

Exported from `src/components/ui/index.js`:

- **Button** — variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes: `xs`, `sm`, `md`, `lg`, `icon`; `loading`.
- **Input**, **Textarea**, **Select**
- **Checkbox**, **Radio**, **Switch**
- **Badge** — includes Figma chip-aligned `brand` / `neutral`.
- **Card** (+ header, title, description, content, footer)
- **Dialog** (native `<dialog>`) + header / title / body / footer
- **Tabs** — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Table** primitives
- **Alert** (+ title / description)
- **Toast** + **ToastViewport**
- **Navbar**, **NavbarItem**
- **Sidebar**
- **Dropdown**, **DropdownItem**
- **Tooltip** — native `title` only (upgrade path: Radix Tooltip).
- **Avatar**

Not implemented as dedicated **UI package** primitives (use tokens + composition or add later): generic **Slider**, **Progress bar**, **Loading icon** set, **Logo** scale components, **Icons** component set (Figma has hundreds of symbols). *Exception:* terminal **margin / leverage** sliders in `DetailsPanel` use design-system CSS (`.ds-terminal-slider*`, `--ds-brand-gradient-horizontal`) — see `tokens/terminalSetupSlider.ts`.

## Usage examples

```jsx
// From a module under `src/` (adjust relative path as needed).
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from './components/ui/index.js'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input placeholder="Search" />
        <Button variant="default" size="md">
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}
```

Typography-only:

```jsx
<h1 className="ds-text-heading-1 text-foreground">Heading</h1>
<p className="ds-text-body text-muted-foreground">Body</p>
```

## Rules for future components

1. **No raw hex / px in JSX** for colors, radii, shadows, or spacing — use theme tokens (`bg-primary`, `rounded-lg`, `shadow-ds-md`, `min-h-btn-md`, etc.).
2. **Prefer semantic names** (`foreground`, `muted-foreground`) over Figma layer names.
3. **Match Figma variant props** where components exist in the file; extend with backward-compatible optional props.
4. **Accessibility:** preserve `focus-visible` rings, labels for controls, and keyboard behavior for overlays/menus.
5. **Radix / CVA:** install only when the product needs composable primitives; until then use small local variant maps (see `Button`).

## Updating from a new Figma file

1. In Figma desktop, **select the target node** (layer) for the file you are syncing — Cursor’s `get_variable_defs` and `get_design_context` MCP calls require a selection.
2. Run **`get_metadata`** on the page or canvas for structure, then **`get_variable_defs`** and **`get_design_context`** on key component nodes.
3. Diff the output against `src/design-system/figma-import-log.md` and adjust `design-tokens.css` + token `.ts` files.
4. Re-run `npm run build` and `npm run lint`.

## Known gaps

- **Light theme:** not defined in the inspected canvases; CSS documents dark-first. Add `:root.theme-light` (or similar) when Figma publishes light variables.
- **Semantic `info`:** no dedicated swatch on the **styles** color page — `--ds-info` is a stand-in blue for callouts until design defines one.
- **Drop shadow:** Figma documents a `drop-shadow` token visually; code uses generic `shadow-ds-*` elevations until exact blur/spread values are exported.
- **Tooltip** is native (`title`); rich tooltips need Radix or similar.
- **Dialog** uses the native `<dialog>` element; complex focus traps may need enhancement.
