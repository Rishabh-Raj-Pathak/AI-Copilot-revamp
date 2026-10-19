import AppHeaderTabs from "../AppHeaderTabs.jsx";
import { useMobileApp } from "../MobileAppContext.js";

/**
 * Delta Neutral / Alpha Agents / Market Making as header tabs — the row under
 * the Agents title in `AppTopBar`, the same tabs as Copilot's Strategies /
 * Portfolio (Figma "02 Agents · v3.1 consistent"). It used to be a gold pill
 * segmented control at the top of each Agents body.
 *
 * Delta Neutral goes to v2, the mobile-native build, and Market Making to its
 * layout 2, that app's default — unless a page of the same kind is already
 * showing: the other versions stay real routes, reached from the tab bar's
 * re-tap picker, and this control must not bounce the user out of them.
 */
const TAB_HOME = {
  "delta-neutral": "dn-vaults-2",
  "alpha-agents": "vaults",
  "market-making": "market-making-2",
};

function tabForAgentsPage(page) {
  if (page.startsWith("dn-vaults")) return "delta-neutral";
  if (page.startsWith("market-making")) return "market-making";
  return "alpha-agents";
}

export default function AgentsSwitcher() {
  const app = useMobileApp();
  const current = tabForAgentsPage(app.page);

  return (
    <div className="flex px-5 pb-px max-[374px]:px-4">
      <AppHeaderTabs
        ariaLabel="Agent type"
        value={current}
        onChange={(id) => {
          if (id !== current) app.navigate(TAB_HOME[id]);
        }}
        options={[
          { id: "delta-neutral", label: "Delta Neutral" },
          { id: "alpha-agents", label: "Alpha Agents" },
          { id: "market-making", label: "Market Making" },
        ]}
      />
    </div>
  );
}
