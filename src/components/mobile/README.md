# Mobile app kit (`src/components/mobile`)

The phone layout (< 834px, Tailwind `max-tablet:`) is built from this kit so it
reads like a native app. Desktop (`tablet:` and up) never renders any of it.

**Design source:** Figma `DoY28sP7SwidihlLGoGrEa`, page "HE App Web View"
(`707:1111`). Frames are 390 wide. The status bar (47px) and home indicator in
the frames are device chrome — the code pads `env(safe-area-inset-*)` instead
of drawing them.

## Rules

- **Phone only.** Gate with `useIsMobile()` (JS) or `tablet:hidden` /
  `max-tablet:` (CSS). Never change a class that desktop renders.
- **Tokens, not hexes.** Colours come from `src/styles/mobile-app.css`
  (named after the Figma variables): `bg-app-bg` `bg-app-surface`
  `bg-app-raised` `bg-app-subtle` `bg-app-accent-subtle` `bg-app-accent-faint`
  `bg-app-points` `bg-app-positive-subtle` `bg-app-negative-subtle`,
  `border-app-line` `-line-strong` `-line-accent` `-line-accent-subtle`
  `-line-points`, `text-app-accent` `-positive` `-negative` `-sell` `-mint`.
  Text greys use the shared ink ladder: `text-ink` (#fff) `text-ink-muted`
  (#bfbfbf) `text-ink-subtle` (#8f8f8f) `text-ink-faint` (#757575).
- **Type scale:** `text-app-display` 24 · `text-app-title` 20 ·
  `text-app-headline` 16 · `text-app-button` 15 · `text-app-body` 14 ·
  `text-app-callout` 13 · `text-app-caption` 12 · `text-app-label` 11 ·
  `text-app-micro` 10. Weights follow Figma (400/500/600/700). Override
  line-height with `leading-*` only when Figma differs.
- **Icons:** every Figma icon is vendored in `/public/mobile/icons` and listed
  in `mobileAssets.js` (`appIcons`). Render line icons with
  `<AppIcon src={appIcons.x} size={16} />` — it masks the SVG so it takes
  `currentColor`. Full-colour art (logos, coins, tier badges) is `appImages`,
  rendered with `<img>`. For an icon Figma doesn't vendor, use `lucide-react`
  (`import { Wallet } from "lucide-react"`, `size={16}`, default stroke) and
  draw the same Lucide paths in Figma. The connected wallet button in
  `AppTopBar` is the Lucide `Wallet` icon; `appImages.walletAvatar` (gradient)
  is only the identity picture in the Wallet sheet and Profile.
- **Lint:** files under `src/components/terminal/**` and `src/components/trade/**`
  run the trading type-scale lint (no `text-[Npx]`, no `font-semibold/bold`).
  Keep phone UI in this folder and only *mount* it from those files.

## Pieces

| Piece | File | Figma |
|---|---|---|
| Shell context: `navigate`, `goBack`, wallet, venue, points, tutorials | `MobileAppContext.js` → `useMobileApp()` | — |
| Screen header on every tab: title (+ meta, optional title menu) left; venue, points, Connect / Lucide wallet right; optional row below (tabs) | `AppTopBar.jsx` | Copilot Header 1227:13431 (signed out) · 1189:11730 (signed in) |
| Header title (17/22 + 11px meta; chevron = title menu) | `AppScreenTitle.jsx` | Strategy Title 1227:13448 |
| Header tabs (underline, optional count) — Copilot views, Agents types | `AppHeaderTabs.jsx` | Segmented 1227:13468 |
| Back nav bar for pushed screens | `AppNavBar.jsx` | Nav Bar / Back 994:16833 |
| Tab bar (persistent, rendered once by `App`) | `AppTabBar.jsx` | Bottom Nav 936:1240 |
| Bottom sheet + header (drag to dismiss, back closes) | `BottomSheet.jsx` | Sheet / Header 993:5861 |
| Large button (primary / destructive / secondary / ghost / buy) | `AppButton.jsx` | Button / Large 1036:5128 |
| Grouped list rows | `AppList.jsx` | List Row / Action 1036:5147 |
| Toast (`useAppToast().show({...})`) | `AppToast.jsx`, `appToastContext.js` | Toast / Success 1064:5584 |
| Empty state (icon disc, title, message, stacked 44px actions) | `AppEmptyState.jsx` | Copilot A5 1189:12683 · B1 1222:7000 |
| Chip (32px, 44px hit; Copilot categories, PnL Calendar months) | `AppChip.jsx` | Category Chip 937:1163 |
| Screen transitions | `MobilePageTransition.jsx` | — |
| Delta Neutral 2 phone screens (Vaults / Positions / History tabs, Set up vault page, vault sheets) | `dn2/` — see below | Terminal `kN9AkNRzaxmg4mhFVkt1Bo` 4476:2 |
| Market Making phone screen (Agents / History tabs, Set up agent page, agent page, sheets) | `mm/` — see below | production app.hyprearn.com/market-making |
| Alpha Agents phone screen (Agents / Positions / History tabs, agent shelves, sheets) | `agents/` — see below | `DoY28sP7SwidihlLGoGrEa` 1220:38293 |
| Hardware/gesture back | `appHistory.js` (`useHistoryBack`) | — |

### Navigation

`useMobileApp().navigate(id)` with a tab (`copilot` `agents` `trade` `rewards`)
or a page (`vaults` `dn-vaults-1` `dn-vaults-2` `kol`). Pushed screens
(`compete` `points` `pnl-calendar` `profile` `support` `delete-account`) get a back-stack entry
and a browser-history entry, so Android back / iOS swipe-back pops them.
`goBack()` returns to the previous screen.

### Layout contract for a phone screen

```
<div class="flex h-dvh flex-col bg-app-bg">
  <AppTopBar />            // or <AppNavBar title="…" /> on a pushed screen
  <main class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain
               pb-[var(--app-tab-bar-h)]">…</main>
</div>
```

The tab bar is `fixed` and owned by `App`; give the scroll area
`pb-[var(--app-tab-bar-h)]` so the last row clears it. Sheets portal to
`<body>` at `z-[90]`; the tab bar is `z-50`; toasts `z-[95]`.

### Delta Neutral 2 (`dn2/`)

Figma "Delta Neutral 2 · Mobile-native (390)" (Terminal file, section 4476:2),
in the vault colour theme. `DeltaNeutralVaultsV2Page` renders `Dn2Screen` on a
phone; `DeltaVaultBuilder` draws its phone face with `phoneLayout="page"`
(`Dn2Builder`), keeping every builder value and handler where they were. DN1
and desktop are untouched.

**Web field parity (2026-10-14).** The phone shows the web Delta Neutral 2
page's fields and nothing else: no tab or filter counts, no "New" badge, no
toasts for opening, editing, deactivating or closing (the copy button's
"Address copied" is the one feedback toast). Only phone-only pieces: the
Cross-DEX hero on the Vaults tab, the Close pair / Deactivate confirms (vault
or pair + action, no extra figures) and the Copilot chart sheet (A6).

- `dn2Theme.js` — the vault recipes (card / hero / bronze fills, tiles, fields,
  toggles, chips, type). `Dn2Ui.jsx` — the shared pieces (venue discs, rows,
  `SubTabs`, `SectionTitle`, `Dn2Button` on the control scale, `Dn2Sheet` =
  `BottomSheet` in the vault theme, with a back chevron when given `onBack`).
  Alpha Agents uses the same pieces. `dn2Data.js` — shaping for the phone copy (funding readouts, chart-feed
  token price, PnL breakdown that sums to its total, the 8h countdown).
- Screens: `Dn2Screen` (A, C, D), `Dn2NewVaultPage` (B1–B3: setup, rates,
  margin & leverage, estimates), `Dn2BuilderSheets` (B4 DEX, B5 market, B6
  cost, ⓘ), `Dn2ChartSheet` (A6 — the Copilot `AppChartCard`),
  `Dn2OpeningScreen` (B7), `Dn2VariationalSheet` (E1–E3), `Dn2Vaults` (vault
  card with PnL breakdown + Deactivate, C2–C4), `Dn2Positions` (D1–D4).
- Toasts here pass `theme: "gold"` to `useAppToast().show`.
- Inputs are 16px (not Figma's 14) so iOS never zooms on focus.

### Alpha Agents (`agents/`)

Figma "02 Agents - Alpha Agents" (`DoY28sP7SwidihlLGoGrEa`, 1220:38293). `VaultsPage`
renders `MobileAlphaAgents` on a phone under the Agents header; every value and
handler (venue filter, per-vault `rowUi`, `onPatch`, the product tour) stays in
`VaultsPage`, shared with desktop.

- Same chrome as Delta Neutral 2: `SubTabs` (Agents | Positions | History),
  20px gutters, 12px gaps, `SectionTitle`, DN2 cards, fields, pills and sheets.
- Agents tab: venue chip (`AgentVenueSheet`, the toolbar's main control) + a
  quiet grey "More info" link (`AgentsAboutSheet`, the intro paragraph that
  used to sit on the page). Shelf titles carry no ⓘ. Then
  sideways shelves — Activated vaults, Alpha Agents, Prime Agents. 280px cards
  snap one at a time and bleed to the screen edge so the next one peeks in.
  Activated agents lift out of their shelf, as on web.
- `MobileAgentCard` — the proto card's fields (stats, allocation, amount + Max,
  strategy, Backtest + Activate). `ActivatedAgentCard` adds PnL, keeps the
  inputs locked until Edit, and Deactivate sends it back to its shelf.
  `VaultStrategySelector appearance="agent"` draws the strategy field, tile and
  sheets in the DN2 scale; desktop keeps the default.
- `MobileAgentPositions` — `AgentPositionsView` / `AgentHistoryView`, the DN2
  card pattern over the web table rows (`vaultsPositionsHistoryMock`); expand
  adds a Details tile. No pagination. Rows become numeric positions
  (`agentPositionsData.js`) so Edit opens `EditTpSlSheet` and Close opens
  `ClosePositionSheet` — the Positions & Orders sheets (Figma 1103:24131). A
  market close shrinks or removes the position and adds a History row; a limit
  close only confirms with a toast.
- The `data-tour` anchors (`vaults-overview`, `vaults-dex-tabs`,
  `vaults-opportunities`, `vaults-featured-tour-controls`) live on the toolbar,
  venue chip, shelves and first Alpha card.

### Market Making (`mm/`)

Production's Market Making page (app.hyprearn.com/market-making, cloned for
desktop in `src/market-making`) in the Delta Neutral 2 phone pattern.
`MarketMakingPage` renders `MmScreen` under the Agents header on a phone. State
and actions are the desktop page's own hook, `useMarketMaking`, and the form
rules (defaults, auto-margin, what blocks activation, the estimate) are
exported from `market-making/Configure.tsx`, so both layouts behave the same.

- `MmScreen`: `SubTabs` Agents | History. The Agents tab has a setup hero
  (pre-filled market, venue, strategy and est. volume, then "Set up agent →"),
  a totals strip (Total volume, Avg CPM, Active agents) and the active agent
  cards. History lists completed runs, 10 at a time with "Show more".
  Production's All / Active / Completed filter became the two tabs, and its
  Configure / Dashboard switch became the hero plus a pushed page. Signed out,
  both tabs ask you to connect (`ConnectNetworkSheet`).
- `MmSetupPage`: production's Configure as a pushed page (`MmPage`, the
  DN2 "Set up vault" shell). Sections: venue, market, strategy, margin,
  leverage, expected volume, cut-off, duration. The CTA is pinned with
  production's label ladder (Connect wallet → Connect {venue} wallet →
  Activate agent / Save changes) and its blocking reason above it. While
  editing, venue, market and strategy are locked.
- `MmSetupSheets`: the venue and market dropdowns as sheets.
- `MmAgentPage`: an agent, or a finished run's results, as a pushed page.
  It has 2×2 figures, status, positions as tiles, the latest 5 activity rows
  plus an "All activity" sheet, and a scrubbable volume chart. Edit, Pause /
  Resume and Deactivate are pinned in the footer. Pause and Deactivate
  confirm in a sheet first, and Deactivate ends on a receipt step.
- `MmUi`: `MmPage`, `AgentCard`, `StatusChip` / `StatusPill`, `StatStrip`,
  `StatTile`, `Switch`, `InfoSheet` (ⓘ tips) and `VolumeChart`.
- Production's toasts ("Strategy activated.", "Changes saved.", "Strategy
  paused.", "Strategy resumed.") use the gold toast. Venue logos are
  production's SVGs (`public/market-making/dex`).
