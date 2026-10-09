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
