import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import { DOC_LINKS } from "../../../lib/docs.js";

const DOC_ICON = {
  "privacy-policy": appIcons.morePrivacy,
  "terms-of-service": appIcons.moreTerms,
  "risk-disclosure": appIcons.moreRisk,
  "restricted-regions": appIcons.moreRegions,
};

const docLink = (id) => DOC_LINKS.find((d) => d.id === id);

function Row({ icon, label, onClick, href }) {
  const body = (
    <>
      <AppIcon src={icon} size={20} className="text-ink" />
      <span className="min-w-0 flex-1 truncate text-left text-app-body leading-5 text-ink">{label}</span>
      {href ? <AppIcon src={appIcons.external16} size={16} className="text-ink-subtle" /> : null}
    </>
  );
  const cls =
    "flex h-12 w-full items-center gap-2.5 border-b border-app-line px-4 transition-colors active:bg-white/[0.04]";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
      {body}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {body}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-4 pb-2 pt-5 text-app-caption font-medium uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </p>
  );
}

/**
 * Figma "More / Sheet — Open" (956:5047).
 *
 * Help & Support and Account Deletion open in-app screens (the Profile &
 * Delete Account handoff moves deletion off the external link), so only the
 * legal documents carry the external-link glyph.
 */
export default function AppMoreSheet({ open, onClose }) {
  const app = useMobileApp();
  const toast = useAppToast();

  const go = (fn) => () => {
    onClose?.();
    fn?.();
  };

  const legal = ["privacy-policy", "terms-of-service", "risk-disclosure"].map(docLink);
  const regions = docLink("restricted-regions");

  return (
    <BottomSheet open={open} onClose={onClose} title="More">
      <nav aria-label="More">
        <Row
          icon={appIcons.morePnlCalendar}
          label="PnL Calendar"
          onClick={go(() =>
            toast.show({ title: "PnL Calendar is coming soon", message: "Daily PnL will show here once it ships." }),
          )}
        />
        <Row icon={appIcons.moreCompete} label="Compete" onClick={go(() => app.navigate("compete"))} />
        <Row icon={appIcons.morePoints} label="Points" onClick={go(() => app.navigate("points"))} />

        {app.runCopilotTutorial || app.runVaultTutorial ? <SectionLabel>Tutorials</SectionLabel> : null}
        {app.runCopilotTutorial ? (
          <Row
            icon={appIcons.moreCopilotTutorial}
            label="AI Copilot tutorial"
            onClick={go(app.runCopilotTutorial)}
          />
        ) : null}
        {app.runVaultTutorial ? (
          <Row icon={appIcons.moreVaultTutorial} label="Vault tutorial" onClick={go(app.runVaultTutorial)} />
        ) : null}

        <SectionLabel>Legal &amp; Support</SectionLabel>
        {legal.map((doc) => (
          <Row key={doc.id} icon={DOC_ICON[doc.id]} label={doc.label} href={doc.href} onClick={onClose} />
        ))}
        <Row icon={appIcons.moreHelp} label="Help & Support" onClick={go(() => app.navigate("support"))} />
        <Row
          icon={appIcons.moreDelete}
          label="Account Deletion"
          onClick={go(() => app.navigate("delete-account"))}
        />
        <Row icon={DOC_ICON["restricted-regions"]} label={regions.label} href={regions.href} onClick={onClose} />
      </nav>
    </BottomSheet>
  );
}
