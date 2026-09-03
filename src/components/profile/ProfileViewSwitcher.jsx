import { ChevronDown } from "lucide-react";
import { Dropdown, DropdownItem } from "../ui/dropdown.jsx";

const PROFILE_VIEWS = [
  { id: "simple", label: "Wallet & X" },
  { id: "points", label: "Points overview" },
];

/**
 * Picks which profile the page renders. Exists because the points system
 * isn't live yet, but the checklist/ring build behind it still needs a way
 * to be seen and demoed without becoming the thing every user lands on.
 *
 * @param {object} props
 * @param {'simple'|'points'} props.view
 * @param {(view: 'simple'|'points') => void} props.onChange
 */
export default function ProfileViewSwitcher({ view, onChange }) {
  const current = PROFILE_VIEWS.find((v) => v.id === view) ?? PROFILE_VIEWS[0];

  return (
    <Dropdown
      className="ml-auto shrink-0"
      contentClassName="right-0 border-[#242424] bg-[#0f0f0f] shadow-lg"
      trigger={
        <span className="flex items-center gap-1.5 rounded-lg border border-[#242424] bg-[#0f0f0f] px-3 py-2 text-xs font-medium text-white transition-colors hover:border-[#454545] hover:bg-white/[0.03] sm:text-sm">
          {current.label}
          <ChevronDown className="size-3.5 text-[#757575]" strokeWidth={2} aria-hidden />
        </span>
      }
    >
      {PROFILE_VIEWS.map((v) => (
        <DropdownItem
          key={v.id}
          onSelect={() => onChange(v.id)}
          className={
            v.id === view
              ? "!text-white"
              : "!text-[#929292] hover:!text-white"
          }
        >
          {v.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
