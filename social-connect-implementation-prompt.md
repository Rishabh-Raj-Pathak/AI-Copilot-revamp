# Prompt: reframe HyprEarn's social-connect step away from "pay for a handle"

Use this prompt to brief Claude (or another engineer) on the change, or as a record of what was implemented in `ai-copilot` on 2026-07-20.

## Context

HyprEarn's "Complete your profile" flow pays points for linking X/Telegram and for following @hyprearn. Research into how comparable products (Layer3, Galxe, DeBank, Hyperliquid, Jupiter, Drift, GMX, Rabby, MetaMask, Backpack, Duolingo, fintech referral programs, Discord/Guild.xyz) handle social-connect flows found:

- Serious trading products never pay points for a social connect — rewards track real usage, and following/connecting is framed as something the user wants for its own sake.
- The platforms that do pay points for it directly (Layer3, Galxe) pair the payout with a real credential, and gate it with anti-farming checks — never a bare OAuth handshake.
- The over-justification effect (Lepper, Greene & Nisbett 1973; Deci, Koestner & Ryan 1999) is the central risk: a flat, expected reward for an action a user would take anyway can crowd out the intrinsic reason to take it, and completion rates can fall once the reward stops.
- Duolingo's Friend Streak is the strongest non-crypto precedent: zero points, pure functional benefit (a friend who nudges you), and it measurably lifts retention (+22% daily completion) with no reward at all.

Full findings, comparison table, and psychology writeup: `social_connect_research_brief.docx` (also mirrored into the HyprEarn Product Tracker on Notion, under "Take user telegram/X/email → Check how other trading apps takes the info → Analysis").

## The change

Repo: `ai-copilot` (local), profile flow at `src/components/profile/`.

Implement three things:

### 1. Split the shared 200-pt "either X or Telegram" reward into two honest, independent 100-pt rewards

Keep the existing low-friction behavior — either provider still satisfies the checklist step, and a trader who connects one isn't blocked from finishing their profile. What changes is that each provider's 100 points are now its own reward, tied to its own reason, rather than a single 200-pt pot credited to whichever comes first. This stops the two channels (alerts vs. reputation/referrals) from reading as interchangeable filler for the same generic payout.

### 2. Pay points on activation, not on connection (the core anti-farming lever)

Linking an account (OAuth for X, bot-pairing for Telegram) satisfies the checklist step immediately — the progress ring and "N of 3" counter still advance the instant it's linked, so there's no new friction. But the *points* for that provider don't land until the connection has done something real:

- **Telegram** — pays out once the bot delivers its first real alert. This is a push, not a user action, so it resolves on its own a few seconds after pairing (simulate a delay standing in for "the bot noticed something worth alerting on").
- **X** — pays out once the user shares their first PnL/setup card or claims their referral link. This is user-initiated, so surface an explicit "Share your first setup" affordance once X is linked, and credit the points when they act on it.

This is the single highest-leverage change from the research: it directly answers "why do you need my X/Telegram?" with a real, delivered benefit rather than a click, and it means a bot can't farm the reward by connecting and immediately disconnecting.

### 3. Lead with the functional benefit in copy; points are the secondary line

Update the connect-flow microcopy so the benefit comes first and the point value reads as an acknowledgment, not the headline:

- Telegram: *"Get pinged the moment a position is at risk. +100 pts once your first alert lands."*
- X: *"Auto-generate shareable PnL cards and claim your referral link. +100 pts once you share your first card."*
- Follow @hyprearn: keep it as the one "pure" points ask (least functional upside), but keep its copy tied to something real (alpha/feature drops), since it's the one step with no other honest justification.

## Files touched (for reference — already implemented)

- `src/components/profile/profileSteps.js` — `SOCIAL_POINTS = { telegram: 100, x: 100 }`; `computeProfileProgress` now takes the full `socials` record (not a `hasSocial` boolean) and only credits a provider's points once `activatedAt` is set. The social step's structural "done" flag is unchanged (any provider linked = done), so completion/finish-bonus timing doesn't regress.
- `src/components/profile/simulatedOAuth.js` — added `startTelegramFirstAlert` (auto timer) and `startXFirstShare` (user-triggered timer) to stand in for the real activation events; updated `SOCIAL_PROVIDERS` copy to lead with benefit and name the point trigger; `stamp()` now seeds `activatedAt: null`.
- `src/components/profile/ProfileContext.jsx` — added `activateSocial(provider)`, wired into the context value; `progress` now derives from `record.socials` directly.
- `src/components/profile/ConnectSocialStep.jsx` — three states per provider instead of two (not linked / linked-and-earning / linked-and-earned): a passive "waiting for your first alert" row for Telegram, an active "Share your first setup" button for X, and an "+100 earned" badge once activated.
- `src/components/profile/ProfileChecklistCard.jsx` — the social row's point value is now the live earned amount (0/100/200), colored grey (todo) / amber (linked, not yet earning) / green (earned), instead of a fixed 200 shown the instant anything is linked.
- `src/components/profile/FollowOnXStep.jsx`, `ConnectionsCard.jsx` — copy tightened to match the benefit-first framing.
- `src/components/profile/profileSteps.test.js` — new unit tests locking in the activation-gated points math (structural completion vs. earned points, 500-point ceiling still reachable).

## Verify

```
npx eslint src/components/profile/
npx vitest run
npx vite build   # confirms the profile module still compiles/bundles cleanly
```
