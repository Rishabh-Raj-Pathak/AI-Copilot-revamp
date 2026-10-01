# AI Copilot — mobile audit & plan (pilot)

Branch `mobile-native-ai-copilot`. Scope: the **AI Copilot** screen (page `copilot`,
view `suggestions`) below the 834px breakpoint (`max-tablet:` / `useIsMobile()`).
Desktop is the reference that must not change.

Grounding: `mobile-app-ui-design` (thumb zone, hierarchy, ≤4 sizes / 2–3 weights,
no equal-weight information, empty/loading/success states), Apple HIG via
`apple-design-skill` (sheets, generative AI, keyboards, touch 44pt, "boldness in
one place"), `design-audit` mobile-app profile (44pt targets, 8pt spacing, thumb
zone, fintech needs confirmation + clear formatting).

## What the screen is for

The primary job is **"show me a trade worth taking right now, and let me act on
it"**: AI-generated setups (idea + direction + win rate + R:R + entry range +
review horizon), filtered by an AI *strategy lens* and a *market category*, that
expire on a countdown. Secondary jobs: backtest a setup, manage the positions
those setups became, share the list.

There is **no chat composer on this screen**. The conversational product
("Strategy Copilot v1/v2", with `StrategyPromptBox`) is a separate copilot view
switched from the desktop header dropdown; phones have no route to it at all.
That is recorded as a finding, not fixed here (out of pilot scope).

## Measured at 375 × 812 (before)

| Region | Height | Notes |
|---|---|---|
| Global top bar | 56 | shared across app — out of scope |
| Strategy section (card in a bordered section) | 126 | dropdown, countdown, Share, gradient Refresh, chips |
| Idea card ×N | 202 each | first card starts at y≈254; ~2.5 cards per screen |
| Positions panel (same scroll) | 924 | 5 positions + sticky tab strip, below the ideas |

Type in use: 11/400, 11/500, 11/600, 12/500, 12/600, 13/400, 13/500, 14/500,
14/600, 16/500, 16/700 — 11 size/weight pairs on one screen. Targets under 44pt:
category chips 28px tall, Share/Refresh 36px, Backtest 36px.

## Element audit

| Element | Verdict | Why |
|---|---|---|
| Global top bar + tab bar | KEEP | Shared shell, works; not Copilot-specific |
| No screen identity ("where am I?") | RESTRUCTURE | Nothing says *AI Copilot* or which strategy is producing the list once the card scrolls away |
| Strategy dropdown (bordered pill inside a card) | REPLACE WITH MOBILE PATTERN | It is the screen's context, not a form field → becomes the screen title as a title menu that opens the existing strategy sheet |
| Strategy sheet (choose / details) | KEEP | Correct pattern already (descriptions + risk need room) |
| "Expires in 10m 28s" text + gradient Refresh button | MODIFY | Freshness is real information but reads as noise; the brand gradient on a secondary action is the loudest thing on screen → countdown becomes a progress ring on a neutral refresh button + a status line; expiry gets a proper stale state |
| Share (36px icon in the toolbar) | MODIFY | Secondary; keep as a 44pt icon button next to refresh |
| Card-in-section strategy container | REMOVE | Card inside a bordered band = two containers for one cluster |
| Category chips (28px) | MODIFY | Correct control (horizontal selector for 4 peer filters) but under target size; add 44pt hit area, tighten visual |
| Idea card: 4 pills at equal weight | RESTRUCTURE | Side, win rate, R:R and range all look identical; label-weighted, no scan order. Price — the number you trade on — is missing on phone. "Review 6h" (desktop chip) missing |
| Idea card: bold 16px title | MODIFY | Marketing weight; the symbol + direction is what you scan, the AI thesis line is supporting copy |
| Idea card: full-width gradient "Backtest" | RESTRUCTURE | Secondary action styled louder than the (invisible) primary action; there is no explicit "trade" affordance — only the chevron |
| Trade ticket sheet / Backtest sheet | KEEP | Already native sheets; backtest is full-height (complex content) |
| Positions panel inline below ideas | RESTRUCTURE | Two jobs (discover vs. manage) in one 1.5k-px scroll with nested sticky tabs; positions are a peer view of the same screen → segmented control *Ideas / Positions* with independent scroll |
| Refresh = list at 40% opacity | REPLACE WITH MOBILE PATTERN | No progress information; HIG GenAI: say what is happening → skeleton cards + "Scanning Trending with High Conviction…" ; pull-to-refresh as an accelerator (button stays) |
| No AI disclosure | MODIFY | HIG GenAI transparency: say it is AI-generated and can be wrong |
| Empty state (desktop component, 8px buttons) | MODIFY | Phone version with 44pt actions |
| Desktop chart inside the expanded card | KEEP (moved deeper already) | Chart lives in the trade ticket on phone |

## Plan

**A. Structure** — Copilot header (title menu = strategy, status line, refresh ring,
share) + segmented *Ideas · n / Positions · n* pinned under the global top bar;
each segment its own scroll view (positions keep their scroll + state).
Ideas: chips → AI disclosure/status line → idea cards → disclaimer.

**B. Interaction** — title menu opens the existing strategy sheet; explicit
per-card primary "Trade" + secondary "Backtest"; whole card still opens the
ticket; pull-to-refresh with a visible button alternative; "position added"
toast switches to the Positions segment; expired state offers refresh inline.

**C. Visual hierarchy** — 4 sizes (17 title · 15 symbol · 13 body/value · 11
label/meta), weights 400/500/600; metrics as a label-over-value row (value
emphasised, label quiet); one bold element (selected card outline / primary
action), refresh neutral.

**D. States** — refreshing (skeletons + specific copy), expired (dimmed list +
inline banner + accent refresh), empty (phone empty state), selected (outline),
pressed (scale), success (toast → Positions).

**E. Isolation** — everything renders from `src/components/mobile/copilot/**`,
mounted only in the `isMobile` branch of `TerminalCopilotPage`. Shared files get
additive, mobile-only hooks only: an optional `renderTrigger` prop on
`CopilotStrategySelector` (used only in its `isNarrow` branch). Desktop DOM +
computed-style fingerprint taken before editing (367 elements, hash
`737816246`) is re-checked after.
