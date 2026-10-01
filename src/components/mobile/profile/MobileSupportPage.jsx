import { AtSign, Mail, Send } from "lucide-react";
import AppIcon from "../AppIcon.jsx";
import AppNavBar from "../AppNavBar.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { DOC_LINKS } from "../../../lib/docs.js";
import { SUPPORT_CHANNELS, SUPPORT_RESPONSE_NOTE } from "../../support/supportContent.js";
import { ActionRow, Card, DividedRows, Section } from "./profileUi.jsx";

/** The kit has no mail / Telegram glyphs, so the channels keep their lucide icons. */
const CHANNEL_ICONS = { email: Mail, telegram: Send, x: AtSign };

/** Same glyphs the More sheet uses for these documents. */
const DOC_ICONS = {
  "privacy-policy": appIcons.morePrivacy,
  "terms-of-service": appIcons.moreTerms,
  "risk-disclosure": appIcons.moreRisk,
  "account-deletion": appIcons.moreDelete,
  "restricted-regions": appIcons.moreRegions,
};

/**
 * Help & Support as a pushed phone screen: the kit nav bar instead of the top
 * bar, and the desktop page's content (contact channels, policy links) on the
 * app's grouped-card pattern — the same eyebrow + surface card + footnote the
 * Profile screen uses.
 *
 * Account Deletion opens the in-app flow, as it does from the More sheet; the
 * other documents stay external.
 */
export default function MobileSupportPage() {
  const app = useMobileApp();
  return (
    <div className="flex h-dvh flex-col bg-app-bg">
      <AppNavBar title="Help & Support" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col gap-6 px-4 py-6">
          <Section label="CONTACT US">
            <p className="px-1 pb-1 text-app-callout text-ink-subtle">
              Something not working, a security concern, or a question about your account? Reach
              the team directly.
            </p>
            <Card>
              <DividedRows inset="pl-16">
                {SUPPORT_CHANNELS.map((ch) => (
                  <ChannelRow key={ch.id} channel={ch} />
                ))}
              </DividedRows>
            </Card>
            <p className="px-1 text-app-caption leading-[17px] text-ink-faint">
              {SUPPORT_RESPONSE_NOTE}
            </p>
          </Section>

          <Section label="POLICIES & RESOURCES">
            <p className="px-1 pb-1 text-app-callout text-ink-subtle">
              The full legal documents, kept current on our docs site.
            </p>
            <Card>
              <DividedRows>
                {DOC_LINKS.map(({ id, label, href }) =>
                  id === "account-deletion" ? (
                    <ActionRow
                      key={id}
                      icon={DOC_ICONS[id]}
                      label={label}
                      chevron
                      onClick={() => app.navigate("delete-account")}
                    />
                  ) : (
                    <ActionRow key={id} icon={DOC_ICONS[id]} label={label} href={href} />
                  ),
                )}
              </DividedRows>
            </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}

function ChannelRow({ channel }) {
  const Icon = CHANNEL_ICONS[channel.id];
  const externalProps = channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a
      href={channel.href}
      {...externalProps}
      className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/[0.04]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-app-line bg-app-bg text-app-accent">
        {Icon ? <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden /> : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-app-body font-medium leading-[normal] text-ink">
          {channel.label}
        </span>
        <span className="truncate text-app-caption leading-[normal] text-ink-subtle">
          {channel.sub}
        </span>
      </span>
      {channel.external ? (
        <AppIcon src={appIcons.external16} size={16} className="text-ink-faint" />
      ) : null}
    </a>
  );
}
