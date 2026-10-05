import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChartPie, Scale } from "lucide-react";
import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import { useHistoryBack } from "../appHistory.js";
import { showCopilotPortfolio } from "../copilot/copilotPortfolio.js";
import { DOC_LINKS } from "../../../lib/docs.js";

const DOC_ICON = {
  "privacy-policy": appIcons.morePrivacy,
  "terms-of-service": appIcons.moreTerms,
  "risk-disclosure": appIcons.moreRisk,
  "restricted-regions": appIcons.moreRegions,
};

const docLink = (id) => DOC_LINKS.find((d) => d.id === id);

/**
 * `icon` is a vendored Figma glyph; `Icon` a lucide component for rows Figma
 * drew from Lucide (Portfolio, Legal & Support). 1.75 at 20px is the 1.46px
 * line of the vendored set. `chevron` marks a row that opens more of the sheet.
 */
function Row({ icon, Icon, label, onClick, href, chevron = false }) {
  const body = (
    <>
      {Icon ? (
        <Icon size={20} strokeWidth={1.75} className="shrink-0 text-ink" aria-hidden />
      ) : (
        <AppIcon src={icon} size={20} className="text-ink" />
      )}
      <span className="min-w-0 flex-1 truncate text-left text-app-body leading-5 text-ink">{label}</span>
      {href ? <AppIcon src={appIcons.external16} size={16} className="text-ink-subtle" /> : null}
      {chevron ? <AppIcon src={appIcons.chevronRight16} size={16} className="text-ink-subtle" /> : null}
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
 * Figma "More / Sheet — Open" (1220:40076) and its drill-in "More / Legal &
 * Support — Open" (1245:6988).
 *
 * The six legal and support rows sit behind one "Legal & Support" row so the
 * sheet stays short. It opens inside the same sheet with a back chevron;
 * hardware back returns to the root list before it closes the sheet.
 *
 * Help & Support and Account Deletion open in-app screens (the Profile &
 * Delete Account handoff moves deletion off the external link), so only the
 * legal documents carry the external-link glyph.
 */
export default function AppMoreSheet({ open, onClose }) {
  const app = useMobileApp();
  const toast = useAppToast();
  const reduceMotion = useReducedMotion();
  // `dir` slides the list in from the side it came from; 0 (a fresh open) doesn't animate.
  const [nav, setNav] = useState({ view: "root", dir: 0 });
  const inLegal = nav.view === "legal";

  const openLegal = () => setNav({ view: "legal", dir: 1 });
  const backToRoot = () => setNav({ view: "root", dir: -1 });

  useHistoryBack(open && inLegal, backToRoot);

  const close = () => {
    setNav({ view: "root", dir: 0 });
    onClose?.();
  };

  const go = (fn) => () => {
    close();
    fn?.();
  };

  const openPortfolio = () => {
    showCopilotPortfolio();
    app.navigate("copilot");
  };

  const legal = ["privacy-policy", "terms-of-service", "risk-disclosure"].map(docLink);
  const regions = docLink("restricted-regions");

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={inLegal ? "Legal & Support" : "More"}
      onBack={inLegal ? backToRoot : undefined}
      backIcon
    >
      <motion.div
        key={nav.view}
        initial={nav.dir && !reduceMotion ? { x: nav.dir * 24, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {inLegal ? (
          <nav aria-label="Legal & Support">
            {legal.map((doc) => (
              <Row key={doc.id} icon={DOC_ICON[doc.id]} label={doc.label} href={doc.href} onClick={close} />
            ))}
            <Row icon={appIcons.moreHelp} label="Help & Support" onClick={go(() => app.navigate("support"))} />
            <Row
              icon={appIcons.moreDelete}
              label="Account Deletion"
              onClick={go(() => app.navigate("delete-account"))}
            />
            <Row icon={DOC_ICON["restricted-regions"]} label={regions.label} href={regions.href} onClick={close} />
          </nav>
        ) : (
          <nav aria-label="More">
            <Row Icon={ChartPie} label="Portfolio" onClick={go(openPortfolio)} />
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

            <div className="h-5" aria-hidden />
            <Row Icon={Scale} label="Legal & Support" chevron onClick={openLegal} />
          </nav>
        )}
      </motion.div>
    </BottomSheet>
  );
}
