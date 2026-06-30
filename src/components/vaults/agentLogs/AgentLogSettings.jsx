export default function AgentLogSettings({
  categories,
  disabledCategories,
  onToggleCategory,
}) {
  return (
    <div className="vaults-root border-b border-[rgba(255,255,255,0.05)] px-5 py-5">
      <h3 className="text-[14px] font-semibold text-[#e8d5b5]">
        Notification settings
      </h3>
      <p className="mt-1.5 text-[13px] leading-[1.45] text-[#717182]">
        Choose which events appear in Agent Logs. Critical alerts always remain
        visible.
      </p>

      <ul className="mt-4 space-y-3">
        {categories.map((cat) => {
          const enabled = !disabledCategories.includes(cat.id);
          return (
            <li key={cat.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 transition-colors hover:border-[rgba(120,90,40,0.2)]">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => onToggleCategory(cat.id)}
                  className="size-4 rounded border-[rgba(120,90,40,0.35)] bg-[#0c0a08] accent-[#ccb17f]"
                />
                <span className="text-[13px] text-[#e8d5b5]">{cat.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
