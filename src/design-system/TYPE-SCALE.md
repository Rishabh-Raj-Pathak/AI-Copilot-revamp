# Type scales

Two live scales, plus one frozen.

- **[Trading scale](#trading-scale)** — AI Copilot and Trade. Five steps, 12px
  base, weight capped at 500.
- **[Section scale](#section-scale)** — content surfaces inside the app
  shell (Compete). Five fluid steps, 14px base, weight up to 700.
- **[Legacy `.ds-text-*`](#legacy--ds-text-)** — frozen, `src/components/ui/` only.

Profile, Rewards and delta-neutral are still on the legacy scale and out of scope
for both.

---

## Trading scale

The type system for **trading surfaces** — the AI Copilot page and the Trade page.

Reverse-engineered from the computed CSS of Hyperliquid, Variational, Lighter and
Vooi. All four converge on the same three rules, and so do we:

1. **One base size carries ~90% of the UI.** Ours is 12px.
2. **Three to five sizes exist, total.** Not eight. Ours is five.
3. **Hierarchy comes from colour and opacity, not size or weight.** None of the
   four uses bold anywhere in its core data UI.

---

### The scale

| Role | Class | Size | Weight | Notes |
|---|---|---|---|---|
| Anchor / pair title | `text-anchor` | 18px | 500 | **exactly once per screen** |
| Control / tab / button | `text-control` | 13px | 400 (+`font-medium` when active) | |
| **Base data & labels** | **`text-data`** | **12px** | 400 | the workhorse |
| Dense numeric cell | `text-micro` | 11px | 400 | |
| Eyebrow / table header | `ds-eyebrow` | 11px | 500 | UPPERCASE, +0.04em — all bundled |
| Meta / badge / status | `text-meta` | 10px | 400 | |

### Pick one in five seconds

- Is it **the pair title**? → `text-anchor`
- Is it a **tab, nav item or button**? → `text-control`
- Is it an **ALL-CAPS column header or section label**? → `ds-eyebrow`
- Is it a **badge or bottom-nav label**? → `text-meta`
- **Everything else** → `text-data`

`text-micro` is the escape hatch for a dense table that genuinely will not fit at
12px. Reach for it last, not first.

### Hierarchy is colour, not weight

Weight is capped at **500**. Since that removes the tool most people reach for,
emphasis lives in the ink ladder:

| Class | Value | Use |
|---|---|---|
| `text-ink` | `#ffffff` | primary values, active states |
| `text-ink-muted` | `#bfbfbf` | field labels, secondary text |
| `text-ink-subtle` | `#8f8f8f` | tertiary, inactive tabs |
| `text-ink-faint` | `#757575` | placeholder, disabled |

An active tab is `font-medium` **and** `text-ink`; an inactive one is 400 and
`text-ink-subtle`. Two levers, both subtle, which is why the result reads calm.

### Banned patterns

| Don't write | Write instead | Why |
|---|---|---|
| `text-[13px]`, `text-[10px]`, any `text-[Npx]` | a scale class | 774 of these is how the codebase ended up with 15 sizes |
| `text-xs` `text-sm` `text-base` `text-lg` | `text-data` / `text-control` / `text-anchor` | stock Tailwind sizes are not the trading scale |
| `font-semibold` `font-bold` | drop it; use `text-ink` vs `text-ink-muted` | 600 was acting as a second default, not an emphasis step |
| `tracking-wide`, `tracking-[0.35px]`, … | `ds-eyebrow` | six values had drifted apart for one style |
| `uppercase` next to `ds-eyebrow` | nothing — it is already in the class | |
| `tabular-nums` | nothing — it is inherited | see below |
| `text-[#bfbfbf]`, `text-[#8c8c8c]`, `text-white` | `text-ink-muted`, `text-ink-subtle`, `text-ink` | eight greys were doing the work of four |
| `.ds-text-*` | any of the above | see *Legacy* below |

### Numerals align by default

`[data-type-scale="terminal"]` on `<body>` sets `font-variant-numeric:
tabular-nums`, which is an **inherited** property — so it covers the whole tree,
including portal children and numbers rendered by a chart library. Trading pages
set that attribute on mount.

**Do not add `tabular-nums`.** If a number sits inside prose and proportional
figures read better, opt out with Tailwind's stock `proportional-nums`.

> ⚠️ **Unverified:** Onest is a variable Google font and it has not been confirmed
> that it ships a `tnum` feature. If it does not, the declaration is a silent
> no-op. Check by rendering `0123456789` against `1111111111` at 12px and
> comparing widths. If it is a no-op, right-align numeric table columns — that
> solves column scanning without adding a second typeface.

### Before / after

Bottom-nav label — [`CopilotBottomNav.jsx`](../components/terminal/CopilotBottomNav.jsx):

```diff
-<span className={`text-[10px] font-medium leading-none ${active ? "font-semibold text-[#f2b500]" : ""}`}>
+<span className={`text-meta font-medium ${active ? "text-[#f2b500]" : ""}`}>
```

Dropdown group header — [`HeaderTerminal.jsx`](../components/terminal/HeaderTerminal.jsx):

```diff
-<p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#757575]">
+<p className="ds-eyebrow px-2 py-1.5 text-ink-faint">
```

### Exemptions

- **The brand wordmark** (`HyprEarn` in the header) is a logo lockup, not content
  type. It keeps 18px/600. Every reference DEX also carries a logo alongside its
  pair title; they are spatially separated and do not compete.
- **`text-[0px]`** on the wordmark wrapper is a whitespace-collapse hack, not a
  font size.

### Where it lives

- Tokens: `src/styles/design-tokens.css` — `--ds-type-*` and `--ds-ink*` in
  `:root`, mapped to `--text-*` / `--color-ink*` in `@theme inline`.
- `ds-eyebrow` is an `@utility` rather than a `@theme` entry because
  `@theme --text-*` has no `text-transform` key.
- Scope + numerals + the base-element reset: the `@layer base` block at the end
  of the same file, keyed on `[data-type-scale="terminal"]`.

That base reset exists because `src/delta-neutral/styles/theme.css` is imported
app-wide (not scoped to its own subtree) and sizes bare `button`, `label`,
`input` and `h1`–`h4` at 16–24px. Without the reset, any control that forgets a
utility silently renders at 16px.

## Section scale

Covers content surfaces that live inside the app shell —
[Compete](../components/compete/) today. It exists because the trading scale
genuinely cannot do this job: these pages carry a page title, headings and prose,
and bold is a legitimate tool on them.

Same three rules, different numbers.

| Role | Class | Size (375px → 1536px) | Weight | Use |
|---|---|---|---|---|
| Hero | `text-hero` | 24 → 32px | 700 | page `h1`, **once per screen** |
| Card title | `text-headline` | 18 → 24px | 700 | |
| Money, counts, wordmarks | `text-figure` | 15 → 18px | 600 | prominent, but not a heading |
| **Body, labels, buttons** | **`text-copy`** | **12 → 14px** | 400 | the workhorse |
| Status pill | `text-tag` | 10 → 11px | 600 | UPPERCASE in markup, +0.06em |

A clean ~1.3 ladder: 32 · 24 · 18 · 14 · 11.

### Anchor to the app, not to the mock

The Figma section this was built from is a **1672px marketing canvas** whose hero
is 82px and whose card titles are 44px. Those sizes are right on a landing page
and far too loud in the shell, a nav click away from a 12px trading surface.

So the ceilings come from what the neighbouring pages already ship — a 32px page
title (`RewardsPage`), 24px card titles, 14px body — and the mock is treated as a
source of *proportion and layout*, not of absolute size. Anything sized against
the type has to come down with it: icons, button boxes, and especially key art,
which is the one that gets missed, because a width percentage keeps looking
reasonable while everything beside it shrinks.

### Every step is fluid

Each size is a `clamp()` ramping between a 375px and a 1536px viewport, so a
component names a role **once** instead of restating it at every breakpoint:

```diff
-<h2 className="text-[24px] font-bold leading-[1.25] tracking-[-0.01em] text-white sm:text-[32px] xl:text-[44px] xl:leading-[55px]">
+<h2 className="text-headline text-ink">
```

Both ends are clamped and every clamp keeps a `rem` term, so user font-size
scaling still works. **Do not stack `sm:` / `xl:` size variants on top** — if a
step reads wrong at some width, the clamp is wrong, not the call site.

### Icons ride the type

Icons and the gaps beside them are sized in `em` against whichever step owns
their row, so a cluster stays proportional as the type moves:

```jsx
<div className="text-figure flex items-center gap-[1.1em]">
  <Database className="size-[1.6em]" />  {/* 26px at 16, 38px at 24 */}
```

### Hierarchy is still colour

Same ink ladder, same job. The Figma reference renders the live card's dot and
countdown as two different greens, and the settled card's icons, label and dot as
three near-identical greys — that is antialiasing noise in a screenshot, not
intent. Shipped: two accents (`#4AE87F` green, `#FFD400` gold) plus the four ink
steps. Compete renders **5 sizes, 3 weights, 5 colours** at every width.

### Fenced off

ESLint bans these class names under `src/components/terminal/**` and
`src/components/trade/**`, the same way it bans arbitrary sizes there. The two
scales are not interchangeable and nothing else can tell you which surface you
are on.

---

## Legacy — `.ds-text-*`

`--ds-text-*` / `.ds-text-*` is a **frozen marketing scale** (16px body, 20px h4,
48px display). It is consumed only by the `src/components/ui/` primitives, which
Profile, Rewards and the delta-neutral pages depend on — so changing a value
there silently reflows pages nobody is looking at.

Never use it on a trading surface. Beyond the wrong sizes, it sets `font-size` in
`@layer components`, which beats any `text-*` utility unconditionally — you
cannot override it inline.

`tokens/typography.ts` used to mirror these role names in TypeScript. It was
deleted: nothing ever imported it, and a `Record<Role, string>` of class names is
strictly worse than the class names themselves. **The class name is the API** —
do not build a `typeScale.ts`.

---

## Burn-down

Coverage is enforced by ESLint (`no-restricted-syntax`) over
`src/components/terminal/**` and `src/components/trade/**`. To check the rest of
the app:

```bash
grep -rcE "text-\[[0-9.]+px\]" src/components src/delta-neutral
```

**Not yet migrated:** `strategyTrading/**` (~230 sites), the rest of `trade/**`,
Vaults, Rewards, Profile, delta-neutral.

**Watch item:** `src/delta-neutral/components/ui/utils.ts` uses real `twMerge`,
which misclassifies unknown `text-*` names as colours and silently drops them —
`twMerge('text-data text-white')` returns `'text-white'`. Harmless today (the
terminal/trade tree's `cn()` in `src/lib/utils.js` is a plain join), but when the
scale reaches delta-neutral it needs an `extendTailwindMerge` font-size group.

_Last verified: 2026-08-10._
