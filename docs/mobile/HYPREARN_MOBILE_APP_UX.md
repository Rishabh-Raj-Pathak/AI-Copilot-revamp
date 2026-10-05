# HyprEarn Mobile App UX System

**v0.2 — AI Copilot pilot.** Branch `mobile-native-ai-copilot`.

> **v0.2 (2026-10-05) — border-only pass.** The Copilot screen now follows Figma
> reference `1209:6991` and section `1172:6988` ("v3.1 · Border-only pass"):
> outline-only cards, "Strategies" tab, underline tabs, countdown on the refresh
> button, one Backtest button per card. Rules it replaced are marked
> **SUPERSEDED** below with what replaced them; the case study (§32) keeps the
> v0.1 rows as history and adds rows 15–19.

This is not yet a universal spec. Every rule is tagged:

- **VALIDATED** — implemented on the AI Copilot phone screen and inspected in the
  running prototype at 375 / 390 / 412px.
- **PROVISIONAL** — looks right from this pilot or the skills used, but has not
  been exercised on a HyprEarn screen yet (or cannot be tested in a web
  prototype). Validate before treating as a rule.

Sources of reasoning: the `mobile-app-ui-design` skill (hierarchy, thumb zone,
type economy, states), Apple HIG via `apple-design-skill` (sheets, generative
AI, keyboards, touch targets, "concentrate boldness in one place"), and the
`design-audit` skill's mobile-app profile (44pt targets, fintech needs clear
formatting and confirmations). Audit and before/after measurements:
[`AI_COPILOT_MOBILE_AUDIT.md`](./AI_COPILOT_MOBILE_AUDIT.md).

---

## 1. Purpose

Turn HyprEarn's web-derived phone layout into an app that behaves like one —
clear place, clear priority, clear next action, native-feeling overlays and
feedback — **without changing what HyprEarn looks like or what it can do**, and
without touching desktop. The audience for this document is whoever builds the
React Native app: it should let them *reason* about a new screen, not copy
components.

## 2. Non-negotiable principles

1. **Desktop is untouched.** Phone behaviour lives in phone code paths. (VALIDATED — DOM/style diff, §30)
2. **HyprEarn identity stays.** Black canvas, gold accent, gold→mint brand gradient, Onest, the existing token names. No generic iOS/Material skin. (VALIDATED)
3. **Mobile is a different composition, not a smaller desktop.** Re-decide hierarchy per screen. (VALIDATED)
4. **Touch first, no hover.** Every action has a visible, ≥44pt target. (VALIDATED)
5. **Progressive disclosure, not deletion.** Detail moves one tap deeper (ticket, backtest, sheet); it does not disappear. (VALIDATED)
6. **Financial context is never hidden to save space.** Price, direction, win rate, R:R, entry and horizon stay on the card. (VALIDATED)
7. **Reduce cognitive load by ordering, grouping and quieting** — not by enlarging everything. (VALIDATED)
8. **Native mental models where they fit** (title menus, segmented controls, sheets, pull to refresh), always with a visible alternative. (VALIDATED)

## 3. Mobile information hierarchy

What the pilot taught:

- **Find the screen's one job first.** AI Copilot's job is "show me a trade worth taking now, and let me act". Everything else (strategy, filters, positions, share) is context or a secondary job. (VALIDATED)
- **Order a card the way a trader scans it:** *what* (token, symbol, direction) → *why* (AI thesis line) → *how good* (win rate, R:R) → *where* (entry range against the current price, right-aligned at the end of the metrics row) → *act*. (VALIDATED at 390px. v0.1 put the price in the card head and ended on a review horizon; v0.2 drops the horizon.)
- **Separate jobs that compete for one scroll.** Discovery (Strategies) and management (Portfolio) were stacked into a 1.5k-px scroll; they became peer tabs. (VALIDATED)
- **Context that drives the content belongs in the title.** The AI strategy decides every setup, so it is the screen title (§7). (VALIDATED)
- **Values over labels.** Labels are quiet (11px, `ink-subtle`); values carry the weight (13px, medium, semantic colour). (VALIDATED)

## 4. Layout and spacing

- 16px screen gutter app-wide; **20px on the Copilot screen** (header, chips, cards) per the v3 Figma. 12–14px inside cards; 8px between sibling controls; 12px between cards. (VALIDATED)
- **One container per cluster.** The old strategy area was a card inside a bordered band; it is now a plain pinned header with a hairline. Cards are kept only where an item is a tappable unit (an idea). (VALIDATED)
- **Outline, not fill.** Copilot cards, skeletons, the expired banner and strategy-sheet options have no fill — a 1px hairline only (`app-line-accent-subtle` #2E2200 for strategy cards, `app-line` elsewhere). Fill is reserved for controls: the soft `app-control` (#1C1C1F) on Backtest, the active chip and secondary buttons. Selection is a brighter outline, never a fill. (VALIDATED at 390px; design decision, Figma 1209:6991)
- Pinned chrome is budgeted: global top bar (56) + screen header (~100) on Copilot; content gets the rest. Everything else scrolls. (VALIDATED)
- Spacing uses 4/8 multiples. (VALIDATED)

## 5. Mobile typography

Same typeface (Onest). Hierarchy from a small set of steps:

| Role | Size / weight | Used for |
|---|---|---|
| Screen title | 17 / 600 (`text-app-heading`) | strategy title menu |
| Item title | 15 / 600 | token symbol on a card |
| Tab | 14 / 600 active, 500 idle | Strategies / Portfolio |
| Body / value | 13 / 400–500 | thesis line, metric values, buttons, chips (14 / 500 for the card's current price) |
| Label / meta | 11 / 400–500 | metric labels, "Strategy · risk" meta |

- Four sizes, three weights (400/500/600) on the redesigned surface — down from 11 size/weight pairs before. (VALIDATED)
- **No bold (700) for content.** The old 16/700 idea title read as marketing; weight now marks only the title and the symbol. (VALIDATED)
- Emphasis comes from colour and order first (ink ladder: `ink` → `ink-muted` → `ink-subtle` → `ink-faint`), size second. (VALIDATED)
- Line-clamp supporting copy (2 lines) rather than letting it push actions down. (VALIDATED)

## 6. Navigation

- **App level:** one persistent tab bar (Copilot / Agents / Trade / Rewards / More), owned by the app shell, never re-mounted per screen. (VALIDATED in the kit, before this pilot)
- **Within a screen:** peer views use **underline tabs** with a trailing count (`Strategies 2 · Portfolio 3`); each keeps its own scroll position and state. (VALIDATED. v0.1 used an iOS segmented control labelled "Ideas"; SUPERSEDED by the v3 Figma.)
- Name segments by what they contain, and avoid echoing a child label: "Portfolio" (positions, orders, history, balance) instead of "Positions" sitting on top of a "Positions" sub-tab. (VALIDATED)
- **Back:** sheets and pushed screens close on hardware/gesture back via history layers. Tab switches don't push history. (VALIDATED in the kit)
- Do not add navigation layers without checking the product architecture; e.g. the conversational *Strategy Copilot* is a separate view with no phone route today — that is a product decision, not something to patch into this screen. (PROVISIONAL — finding)

## 7. App bars / headers

- **One header on every tab** (`AppTopBar`, Figma 1227:13431 / 1189:11730): screen title + meta on the left (Copilot: strategy menu; Agents: "Agents" + header tabs; Trade: market as title menu "BTC-USDC ⌄"; Rewards), the same 32px venue / points / Connect-or-wallet controls on the right, 20px gutters, proportional figures. The brand mark only remains as a fallback for screens without a title. (VALIDATED at 390px, 2026-10-05)
- A **screen header** sits under it and carries only screen context and screen actions. (VALIDATED)
- **Title menu pattern:** when one setting defines everything on the screen, make it the title (`Name ⌄` over a quiet `Strategy · Medium risk`), and open its chooser from there. It reads as "where am I", not as a form field. (VALIDATED; v0.1 had the meta above the name with a risk dot.)
- Toolbar actions: at most two (share, refresh), outline-free, 32px visual / 44pt hit. Refresh carries the batch's time left as text beside its icon. (VALIDATED)

## 8. Bottom navigation

No new rule. The existing tab bar was kept as-is; the pilot gave no evidence to change it. Do not add bottom navigation inside a screen. (VALIDATED by non-change)

## 9. Bottom sheets

Use a sheet when a **contextual choice or short task** needs room the inline UI doesn't have — options with descriptions (strategy + risk + details), a form tied to one item (trade ticket), or an explanation (About AI setups). (VALIDATED)

- Grabber + drag-to-dismiss + scrim tap + Escape + hardware back. One sheet at a time. (VALIDATED, kit)
- Complex, long content (backtest report, full ticket) uses the **full-height** variant. (VALIDATED)
- Detail inside a chooser uses "← Back" within the same sheet rather than a second sheet. (VALIDATED, strategy details)
- **Not** for: four peer filters (inline chips), two peer views (tabs), a binary choice. (VALIDATED)
- Sheets rise above the software keyboard (§19). (PROVISIONAL — needs a real device)

## 10. Dialogs / confirmations

The pilot added none. Irreversible trading actions (close position, cancel all) already confirm in a sheet in the Portfolio segment; single cancels act immediately with Undo. (VALIDATED in Portfolio; carried over)

## 11. Selectors and filters

Decide by count, need for description, and frequency:

| Situation | Pattern | Example |
|---|---|---|
| 2 peer views | underline tabs | Strategies / Portfolio |
| 3–6 peer filters, short labels, frequent | horizontal chip selector (radio group) | market category |
| Options need descriptions / risk / details | bottom sheet | AI strategy |

Chips are 32px visually (9px radius) with a 44px hit area; idle chips are outline only, the active one takes the `app-control` fill. The active chip scrolls into view when changed from elsewhere. (VALIDATED)

## 12. Forms

The pilot's only form is the trade ticket (pre-existing sheet). Rules carried from it: 16px input text so iOS doesn't zoom; `inputMode="decimal"` for amounts; defaults seeded from the AI setup (side, entry, TP/SL, leverage). (VALIDATED for ticket defaults; keyboard behaviour PROVISIONAL)

## 13. AI / Copilot interactions

The pilot screen is a **generated feed**, not a chat. Learned:

- **Disclose AI, in-line and specific.** A "How it works" sheet: generated by the chosen strategy, they expire, nothing is placed for you, can be wrong / not advice. It currently has **no entry point on the Copilot screen**: the footer line that linked to it ("AI setups can be wrong and are not financial advice. How it works") was removed at the user's request on 2026-10-05. (PROVISIONAL — needs a new home, e.g. the strategy sheet or More → Tutorials. v0.1 also had a "✦ AI-generated · n setups · valid m:ss" status line under the chips; SUPERSEDED — the v3 Figma removed it.)
- **Freshness is part of the content.** Generated setups decay. Show the exact time left on the refresh button itself (`⟳ 9:50`): green while fresh, gold in the last minute, "Expired" in red, "Scanning" while refreshing. (VALIDATED at 390px. v0.1's draining ring + status-line time is SUPERSEDED.)
- **Expired is a state, not a colour.** Cards dim, an inline outline-only banner says "These setups expired. Refresh for a new batch." with the action right there. (VALIDATED in code; the 10-minute expiry wasn't waited out in the browser — see §12 of the change log)
- **Say what the AI is doing.** Outline skeleton cards plus "Scanning" on the refresh button; the full sentence ("Scanning Trending with High Conviction") is announced to screen readers through a live region. (VALIDATED. v0.1 showed the sentence on screen in the status line.)
- **Keep the person in control.** Every setup offers Backtest (evidence) as its one button; tapping the card (chevron) opens the ticket, which shows everything editable before anything is placed. (VALIDATED. v0.1's explicit "Open short/long" button is SUPERSEDED — see §17.)
- **Make the strategy (the AI's "lens") obvious and switchable** from the title. (VALIDATED)
- ~~Disclaimer at the end of the feed, quiet, always present.~~ SUPERSEDED 2026-10-05: removed from the feed at the user's request; the not-advice copy now lives only in the About sheet. Check with legal before shipping. (PROVISIONAL)

## 14. Chat / input composer

Not exercised: this screen has no composer. The conversational Strategy Copilot (`StrategyPromptBox`) exists on desktop only. When it comes to phone: bottom-anchored composer above the safe area, grows to ~5 lines, send button ≥44pt, suggestions above the composer, list scrolls to newest, keyboard pushes the composer (not overlays it). (PROVISIONAL — unvalidated)

## 15. Trading and financial data density

- Keep density; change **priority**. One direction, four metrics (win rate, R:R, entry, current price) and one button per idea card — all visible without a tap. (VALIDATED)
- **Label-over-value metric rows** are denser and more scannable than a wrap of equal pills. No hairline above them in v0.2 — the outline card already groups them. (VALIDATED)
- Compact formats where the label provides the unit: Entry `83,468–83,984` (no `$`, no cents above $1k); full precision lives in the ticket. (VALIDATED)
- Semantic colour only: green = favourable stat / long, red = short / loss. R:R is plain ink in v0.2 (it was gold). Never colour alone — text says "Long/Short". (VALIDATED)
- Numbers inherit tabular figures from the trading body scope; don't fight it per element. (VALIDATED)

## 16. Charts

Moved deeper, not shrunk: the desktop's inline chart lives in the trade ticket on phone, where it has the full width and can be panned. (VALIDATED, pre-existing)

## 17. Primary / secondary actions

- **SUPERSEDED (v0.2):** *Make the primary action explicit* — v0.1 put a direction-tinted "Open short/long" beside Backtest. The v3 Figma removed it: the whole card opens the ticket, signalled by a chevron, and the card's one button is a neutral full-width Backtest (38px, `app-control` fill). Trade-off: opening a trade is less explicit than in v0.1; the audit's original complaint was a *loud* Backtest hiding the primary, and Backtest is now quiet. Watch for "how do I trade this?" in testing. (PROVISIONAL)
- **Concentrate boldness.** The brand gradient was on Refresh, Backtest, the selected card and Connect at once. It now marks only primary buttons in a state that needs one — Connect, "Switch strategy" (empty) and "Refresh" (expired banner). No card is highlighted. (VALIDATED — HIG craft: "boldness in one place")
- The whole card is the tap target for opening the ticket. (VALIDATED)

## 18. Touch targets

- ≥44pt for every action in the redesigned area; visuals can be smaller if the hit area isn't (chips 32→44, segments 36→44 via transparent `::before`). (VALIDATED by DOM measurement)
- ≥8px between adjacent targets. (VALIDATED)
- Known gap outside the pilot: the global top bar's venue/points/connect controls are 36px. (PROVISIONAL — fix when the shell is revisited)

## 19. Keyboard behaviour

- Sheets track `visualViewport` and sit above the iOS keyboard (height clamps to the space left); `interactive-widget=resizes-content` asks Android Chrome to resize the layout instead of overlaying. (PROVISIONAL — implemented, not testable without a device keyboard)
- 16px inputs to avoid iOS focus zoom. (VALIDATED in ticket code)

## 20. Safe areas

`viewport-fit=cover`; the top bar pads `env(safe-area-inset-top)`, the tab bar and sheet footers pad the bottom inset (min 20px). Feed bottom padding clears the tab bar plus 16px. (VALIDATED structurally; notch/home-indicator rendering PROVISIONAL until on device)

## 21. Scrolling

- One scroll view per segment; no nested vertical scrollers. (VALIDATED)
- Pinned header doesn't scroll; the Portfolio sub-tab strip pins inside its own scroll view. (VALIDATED)
- Horizontal chip row scrolls on its own axis with `overscroll-x-contain`. (VALIDATED)
- Refresh scrolls the feed back to top so the user sees the new batch arrive. (VALIDATED)

## 22. Gestures

- **Pull to refresh** on the Ideas feed — an accelerator only; the refresh button is always visible. Arms only at scroll-top, yields to sideways and upward intent. (VALIDATED in code; touch feel PROVISIONAL until on device)
- Drag-to-dismiss sheets, swipe toasts away, hardware/gesture back. (VALIDATED, kit)
- Never gesture-only. (VALIDATED)

## 23. Motion

Motion only where it carries meaning: segment content settles in (160ms fade/rise), refresh icon spins while scanning, the ring drains linearly, skeletons shimmer, cards scale 0.99 on press. All disabled under `prefers-reduced-motion`. (VALIDATED)

## 24. Haptics

Can't be validated in a web prototype. Suggested for native: light impact on segment change and pull-to-refresh commit; success notification when an order is placed; warning on expiry banner appearing. (PROVISIONAL)

## 25. Loading / processing states

Outline skeleton cards shaped like the real card; "Scanning" on the refresh button; the sentence describing the work goes to a live region. The Strategies tab count shows "–" while scanning (no stale numbers). (VALIDATED)

## 26. Empty states

One component, `AppEmptyState` (Figma A5 / B1): centred in the visible space above the tab bar, a touch above the middle; 48px icon disc; 17/22 title saying what happened in the user's terms ("No setups in Trade[XYZ]", "Connect a wallet"); a 13/18 message of one or two even lines (`text-balance`, max 280) saying why; full-width 44px pill actions stacked 10px apart, primary first. No container box. (VALIDATED at 390px, 2026-10-05)

- **Signed out is an empty state, not a disabled UI.** Portfolio signed out shows no sub-tabs and no counts (header tab reads "Portfolio", not "Portfolio 0") — just "Connect a wallet" with one action. (VALIDATED)
- **One gradient per page.** On Trade, where "Open Position" is the page's action, the same empty state's "Connect wallet" is the secondary (grey) style. (VALIDATED)

## 27. Error and recovery states

Expired data is the main "error" here (§13). Network/AI failures don't exist in the mock; when they do, reuse the expired-banner shape: what happened + one recovery action, inline in the list. (PROVISIONAL)

## 28. Success / confirmation states

Placing an order closes the ticket, shows the existing success flow, and a toast whose "View" switches to the Portfolio segment (it used to scroll to a panel below the feed). (VALIDATED)

## 29. Accessibility

- Contrast checked on the new surface: short red on its tint was ~4.0:1 with the token red, so card text uses #f06464 (≥4.5:1). Labels `#8f8f8f` on black ≈ 6.2:1. (VALIDATED)
- Tabs are `tablist`/`tab` with spoken counts ("Portfolio, 5 open positions"); chips are a `radiogroup`; the refresh button announces remaining validity, "Setups expired" or "Scanning for new setups"; the card's label reads symbol, direction, price and thesis. (VALIDATED)
- Text sizes: 11px is used only for labels/meta, never for actionable or primary values. (VALIDATED)

## 30. Responsive engineering isolation

How phone and desktop stay separate — the pattern to keep when porting:

- One breakpoint: `max-tablet` (< 834px) in CSS, `useIsMobile()` in JS. No new breakpoints. (VALIDATED)
- **Phone UI lives in `src/components/mobile/<area>/`**; desktop files only *mount* it inside their existing `isMobile` branch. (VALIDATED)
- Shared components get **additive, phone-only hooks**, never behaviour changes: `CopilotStrategySelector` gained an optional `renderTrigger` used only in its narrow branch; `MobilePositionsPanel` gained an optional `onCountsChange`. (VALIDATED)
- New CSS is new class names (`app-*`) or rules inside the narrow media query. (VALIDATED)
- **Proof, not trust:** desktop Copilot was fingerprinted before editing, then compared against the pre-branch commit served side-by-side — 367/367 elements identical in tag, classes, computed type, colour, spacing, borders and text. Repeat this for every screen ported. (VALIDATED)
- For React Native: treat this as "two compositions over one state/data layer" — the phone screen should reuse the same selectors/handlers (`getCopilotSetups`, strategy list, order submit) and own only layout and interaction. (PROVISIONAL)

## 31. Patterns to avoid (seen in the audit)

- A form-style dropdown for the setting that defines the screen → title menu. (VALIDATED)
- Equal-weight pills for unequal information (direction, win rate, R:R, range all looked alike). (VALIDATED)
- A loud secondary action and an invisible primary one. (VALIDATED)
- Brand gradient on several elements at once. (VALIDATED)
- Card inside a bordered band for one cluster. (VALIDATED)
- Two jobs stacked in one long scroll with a nested sticky strip. (VALIDATED)
- Fading the list to 40% as the only loading signal. (VALIDATED)
- 28px chips / 36px icon buttons as primary touch targets. (VALIDATED)
- Marketing-weight (700) titles on dense data. (VALIDATED)

## 32. AI Copilot case study

| # | Before | After | Why | Pattern | Status |
|---|---|---|---|---|---|
| 1 | Strategy was a bordered dropdown inside a card, scrolled away | Strategy is the pinned screen title (`AI strategy · risk` / `High Conviction ⌄`) opening the strategy sheet | It defines every setup; users always know which lens they're looking through | Title menu for screen-defining context | Validated |
| 2 | "Expires in 10m 28s" text + gradient Refresh competing with 3 controls | Neutral refresh button with a draining freshness ring; exact time in the status line | Freshness at a glance, less noise, boldness freed up | Encode decay visually, keep exact value in text | Validated |
| 3 | Ideas and positions in one ~1,560px scroll | Segmented Ideas · n / Portfolio · n, independent scroll + state | Discovery vs management are different jobs | Segment peer views of one screen | Validated |
| 4 | 4 equal pills + bold 16px title, no price | Symbol + direction tag + price row; thesis as 13px muted copy; label-over-value metrics (Win rate, R:R, Entry, Review) | Scan order matches trading decisions; price and horizon restored | Values over labels; scan order | Validated |
| 5 | Full-width gradient Backtest, primary hidden in a chevron | Backtest (secondary) + Open short/long (direction-tinted primary) | Primary action discoverable; secondary quiet | Explicit primary, quiet secondary | Validated |
| 6 | Card-in-band container | Plain pinned header, hairline | Fewer boxes, same grouping | One container per cluster | Validated |
| 7 | Chips 28px | 32px visual / 44px hit, radio semantics | Touch reliability, a11y | Visual ≠ hit area | Validated |
| 8 | Refresh = list at 40% opacity, instant swap | Spinner + skeletons + "Scanning … with …" (650ms in the prototype) | Feedback that the tap worked and what the AI is doing | Specific generation progress | Validated |
| 9 | — | Pull to refresh on the feed | Native accelerator; button remains | Gesture as accelerator only | Validated (feel provisional) |
| 10 | Expired = red word | Dimmed cards + inline banner with Refresh | Stale prices are risky; recovery in place | Stale-data state with inline recovery | Validated in code |
| 11 | No AI disclosure | Status line + "How it works" sheet + footer disclaimer | Transparency and expectations (HIG GenAI) | Disclose AI in context | Validated |
| 12 | Desktop empty state component | Phone empty state with two 44pt actions; status line "no matches" | Clear way out on a phone | Empty state = what/why/next | Validated |
| 13 | "Demo position added" toast scrolled to a panel | Toast "View" switches to Portfolio | Matches the new structure | Success leads to the result | Validated |
| 14 | Sheets ignored the keyboard | Sheets sit above the keyboard (visualViewport) + Android resize hint | Ticket inputs stay visible | Keyboard layout guide | Provisional |
| 15 | (v0.1) #111113-filled cards, two buttons, price in the head | Outline-only cards (#2E2200 hairline, r16); chevron; metrics end in "Current Price"; one full-width Backtest | Minimal surface; colour left to the data | Outline, not fill | Validated at 390px |
| 16 | (v0.1) "Ideas" in an iOS segmented control | "Strategies n / Portfolio n" underline tabs | Matches the v3 Figma; the list is a list of strategy setups | Tabs for peer views | Validated at 390px |
| 17 | (v0.1) Draining refresh ring + status line with the time | `⟳ 9:50` refresh button, colour-coded; status line removed | One place for freshness, one fewer row | Freshness on the control that resets it | Validated at 390px |
| 18 | (v0.1) Filled / accent strategy options | Outline options; selected = brighter outline | Same rule as the cards | Selection by outline | Validated at 390px |
| 19 | (v0.1) Status line was the "How it works" entry | Footer line "…not financial advice. How it works" — then removed (2026-10-05) | User wanted the list without it | — | Removed; About sheet has no entry point |
