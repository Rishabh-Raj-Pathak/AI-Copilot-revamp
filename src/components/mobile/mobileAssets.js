/**
 * Mobile app iconography and brand marks, exported from Figma
 * (`DoY28sP7SwidihlLGoGrEa` → "As-Is Web · 00 Components & Tokens": Icons 930:1111,
 * Logos & Images 933:1111) and vendored into `/public/mobile`.
 *
 * Local paths on purpose: Figma's MCP asset URLs expire after ~7 days.
 *
 * Icons are single-colour line glyphs. Render them through `<AppIcon>` so they
 * take `currentColor` (active tab gold, destructive red, ...) rather than the
 * white baked into the export.
 */

const icon = (name) => `/mobile/icons/${name}.svg`;
const logo = (file) => `/mobile/logos/${file}`;

export const appIcons = {
  // Tab bar (Figma "Icon / Nav/*", 20px)
  navCopilot: icon("nav-copilot"),
  navAgents: icon("nav-agents"),
  navTrade: icon("nav-trade"),
  navRewards: icon("nav-rewards"),
  navMore: icon("nav-more"),

  // Chevrons / navigation
  chevronDown14: icon("chevron-down-14"),
  chevronDown16: icon("chevron-down-16"),
  chevronDown20: icon("chevron-down-20"),
  chevronUp16: icon("chevron-up-16"),
  chevronLeft16: icon("chevron-left-16"),
  chevronRight16: icon("chevron-right-16"),
  chevronRight24: icon("chevron-right-24"),
  back24: icon("back-24"),
  close20: icon("close-20"),
  x20: icon("x-20"),
  arrowRight15: icon("arrow-right-15"),
  arrowRight20: icon("arrow-right-20"),
  arrowDown16: icon("arrow-down-16"),
  caretDown16: icon("caret-down-16"),
  external16: icon("external-16"),

  // Actions
  share14: icon("share-14"),
  refresh14: icon("refresh-14"),
  backtest16: icon("backtest-16"),
  copy16: icon("copy-16"),
  copyImage16: icon("copy-image-16-group"),
  edit20: icon("edit-20"),
  penLine24: icon("pen-line-24"),
  search19: icon("search-19"),
  sort13: icon("sort-13"),
  loader16: icon("loader-16"),
  trash24: icon("trash-24"),
  logout20: icon("logout-20"),
  userRound20: icon("user-round-20"),
  user16: icon("user-16"),
  wallet20: icon("wallet-20"),

  // Status
  check12: icon("check-12"),
  checkCircle16: icon("check-circle-16"),
  xCircle16: icon("x-circle-16"),
  circleCheckLine16: icon("circle-check-line-16"),
  circleXLine16: icon("circle-x-line-16"),
  shieldCheck16: icon("shield-check-16"),
  info14: icon("info-14"),

  // Category chips (14px)
  chipBluechip: icon("chip-bluechip"),
  chipStocks: icon("chip-stocks"),
  chipTrending: icon("chip-trending"),
  chipCommodities: icon("chip-commodities"),
  dnCommodities12: icon("dn-commodities-12"),
  dnMeme12: icon("dn-meme-12"),
  dnFx12: icon("dn-fx-12"),

  // Trade ticket fields
  dollar20: icon("dollar-20"),
  percent20: icon("percent-20"),
  indicators14: icon("indicators-14"),

  // Rewards / compete
  tierGem20: icon("tier-gem-20"),
  coins20: icon("coins-20"),
  users20: icon("users-20"),
  activity20: icon("activity-20"),
  timer20: icon("timer-20"),
  calendar20: icon("calendar-20"),
  trophy14: icon("trophy-14"),
  trendUp12: icon("trend-up-12"),

  // More sheet rows (20px)
  morePnlCalendar: icon("more-pnl-calendar"),
  moreCompete: icon("more-compete"),
  morePoints: icon("more-points"),
  moreCopilotTutorial: icon("more-copilot-tutorial"),
  moreVaultTutorial: icon("wallet-20"),
  morePrivacy: icon("more-privacy"),
  moreTerms: icon("more-terms"),
  moreRisk: icon("more-risk"),
  moreHelp: icon("more-help"),
  moreDelete: icon("more-delete"),
  moreRegions: icon("more-regions"),

  // Wallet networks (20px)
  networkEvm: icon("network-evm"),
  networkSolana: icon("network-solana"),
  networkAptos: icon("network-aptos"),

  socialX16: icon("social-x-16"),
};

/** Full-colour assets — render with a plain `<img>`, never through the mask. */
export const appImages = {
  hyprEarnMark: logo("hyprearn-mark.svg"),
  hyprEarnMarkSmall: icon("mark-hyprearn-small"),
  lighterMarkSmall: icon("mark-lighter-small"),
  /** Gold→mint gradient disc used as the wallet avatar (Figma "Avatar"). */
  walletAvatar: icon("avatar-gradient"),
  activeDot: icon("active-dot"),
  coinBronze: logo("coin-bronze.png"),
  tokenEth: logo("token-eth.png"),
  tokenBtc: logo("token-btc.png"),
  venue: {
    hyperliquid: logo("venue-hyperliquid.png"),
    zklighter: logo("venue-lighter.svg"),
    "lighter-robinhood": logo("venue-lighter-robinhood.png"),
    arcus: logo("venue-arcus.svg"),
    decibel: logo("venue-decibel.png"),
    pacifica: logo("venue-pacifica.svg"),
    nado: logo("venue-nado.png"),
    avantis: logo("venue-avantis.png"),
    paradex: logo("venue-paradex.png"),
  },
  tier: {
    base: logo("tier-base.png"),
    scout: logo("tier-scout.png"),
    degen: logo("tier-degen.png"),
    executor: logo("tier-executor.png"),
    alphaHunter: logo("tier-alpha-hunter.png"),
    whale: logo("tier-whale.png"),
  },
  competeArt: {
    decibel: logo("compete-decibel-art.png"),
    lighter: logo("compete-lighter-art.png"),
    pacifica: logo("compete-pacifica-art.png"),
  },
};
