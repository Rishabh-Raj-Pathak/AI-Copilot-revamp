import AppHeaderTabs from "../AppHeaderTabs.jsx";
import { useMobileApp } from "../MobileAppContext.js";

/**
 * Delta Neutral / Alpha Agents as header tabs — the row under the Agents
 * title in `AppTopBar`, the same tabs as Copilot's Strategies / Portfolio
 * (Figma "02 Agents · v3.1 consistent"). It used to be a gold pill segmented
 * control at the top of each Agents body.
 *
 * Delta Neutral goes to v1 unless v2 is already showing: v2 stays a real route,
 * reached from the tab bar's re-tap picker, and this control must not bounce
 * the user out of it.
 */
export default function AgentsSwitcher() {
  const app = useMobileApp();
  const onDeltaNeutral = app.page.startsWith("dn-vaults");

  return (
    <div className="flex px-5 pb-px max-[374px]:px-4">
      <AppHeaderTabs
        ariaLabel="Agent type"
        value={onDeltaNeutral ? "delta-neutral" : "alpha-agents"}
        onChange={(id) => {
          if (id === "delta-neutral" && !onDeltaNeutral) app.navigate("dn-vaults-1");
          if (id === "alpha-agents" && onDeltaNeutral) app.navigate("vaults");
        }}
        options={[
          { id: "delta-neutral", label: "Delta Neutral" },
          { id: "alpha-agents", label: "Alpha Agents" },
        ]}
      />
    </div>
  );
}
