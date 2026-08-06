import {
  AtSign,
  ChevronLeft,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  ScrollText,
  Send,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import CopilotMobileHeader from "../terminal/CopilotMobileHeader.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import { DOC_LINKS } from "../../lib/docs.js";
import { SUPPORT_CHANNELS, SUPPORT_RESPONSE_NOTE } from "./supportContent.js";

/** Icons are presentation, so — like `MoreSheet` — they map by id here, not in the data. */
const CHANNEL_ICONS = { email: Mail, telegram: Send, x: AtSign };
const DOC_ICONS = {
  "privacy-policy": Lock,
  "terms-of-service": ScrollText,
  "risk-disclosure": TriangleAlert,
  "account-deletion": Trash2,
  "restricted-regions": Globe,
};

/**
 * In-app Support / Help page. Informational only — no backend behind it.
 *
 * Shares the `ProfilePage` shell exactly (mobile header, desktop nav, scrolling
 * card stack, bottom nav) so it sits on the same gutter scale as every other
 * page. Reachable from "More" on both platforms via `onOpenSupport`.
 */
export default function SupportPage({
  onBack,
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenTrade,
  onOpenRewards,
  onVaultViewChange,
}) {
  const walletHeaderProps = {
    walletConnected,
    onWalletConnected,
    onWalletDisconnect,
    onOpenProfile,
    onOpenSupport,
    terminalPlatform,
    onTerminalPlatformChange,
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <CopilotMobileHeader {...walletHeaderProps} />
      <HeaderTerminal
        {...walletHeaderProps}
        activeNavItem="Support"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
          if (label === "Rewards") onOpenRewards?.();
          if (label === "KOL") onOpenRewards?.("kol");
        }}
        showCopilotTutorial={false}
      />

      <main className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {/* Same full-bleed title bar + gutter scale as `ProfilePage`. */}
        <div className="border-b border-[#242424]">
          <div className="flex w-full items-center gap-4 px-5 py-4 max-tablet:gap-2 max-tablet:px-4 max-tablet:py-3.5 sm:px-8 lg:px-10 xl:px-12">
            <button
              type="button"
              onClick={() => onBack?.()}
              aria-label="Back"
              className="-ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white sm:size-9"
            >
              <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
            </button>
            <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
              Help &amp; Support
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 px-5 py-8 pb-16 max-tablet:gap-4 max-tablet:px-4 max-tablet:py-5 max-tablet:pb-4 sm:px-8 lg:px-10 xl:px-12">
          <ContactCard />
          <ResourcesCard />
        </div>
      </main>

      <CopilotBottomNav
        activeId="support"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onOpenSupport={onOpenSupport}
        onNavClick={(id) => {
          if (id === "copilot") onOpenCopilot?.();
          if (id === "trade") onOpenTrade?.();
          if (id === "rewards") onOpenRewards?.();
          if (id === "kol") onOpenRewards?.("kol");
        }}
      />
    </div>
  );
}

/** Shared card frame — the dominant hand-rolled section used across pages. */
function Card({ title, description, children }) {
  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="border-b border-[#242424] pb-3.5 sm:pb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-[#929292]">{description}</p>
        ) : null}
      </header>
      <div className="mt-4 max-w-2xl sm:mt-5">{children}</div>
    </section>
  );
}

function ContactCard() {
  return (
    <Card
      title="Contact us"
      description="Something not working, a security concern, or a question about your account? Reach the team directly."
    >
      <div className="flex flex-col gap-2">
        {SUPPORT_CHANNELS.map((ch) => {
          const Icon = CHANNEL_ICONS[ch.id];
          const externalProps = ch.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <a
              key={ch.id}
              href={ch.href}
              {...externalProps}
              className="group flex items-center gap-3.5 rounded-lg border border-[#242424] bg-black/40 px-3.5 py-3 transition-colors hover:border-[#454545] hover:bg-white/[0.03]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#242424] bg-[#0f0f0f] text-[#f2b500]">
                {Icon ? (
                  <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {ch.label}
                </span>
                <span className="block truncate text-xs text-[#8c8c8c]">
                  {ch.sub}
                </span>
              </span>
              {ch.external ? (
                <ExternalLink
                  className="size-4 shrink-0 text-[#575757] transition-colors group-hover:text-[#bfbfbf]"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : null}
            </a>
          );
        })}
      </div>
      <p className="mt-3.5 text-xs leading-relaxed text-[#757575]">
        {SUPPORT_RESPONSE_NOTE}
      </p>
    </Card>
  );
}

function ResourcesCard() {
  return (
    <Card
      title="Policies &amp; resources"
      description="The full legal documents, kept current on our docs site."
    >
      <div className="overflow-hidden rounded-lg border border-[#242424]">
        <div className="divide-y divide-[#1c1c1c]">
          {DOC_LINKS.map(({ id, label, href }) => {
            const Icon = DOC_ICONS[id];
            return (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 bg-black/40 px-3.5 py-3 transition-colors hover:bg-white/[0.03]"
              >
                {Icon ? (
                  <Icon
                    className="size-[18px] shrink-0 text-[#bfbfbf]"
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {label}
                </span>
                <ExternalLink
                  className="size-3.5 shrink-0 text-[#575757] transition-colors group-hover:text-[#bfbfbf]"
                  strokeWidth={2}
                  aria-hidden
                />
              </a>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
