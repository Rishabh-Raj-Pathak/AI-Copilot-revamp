import { ArrowDownToLine, LockOpen, ShieldCheck } from "lucide-react";
import { Dn2Button, Dn2Sheet } from "../dn2/Dn2Ui.jsx";
import { TILE } from "../dn2/dn2Theme.js";

const FACTS = [
  [ShieldCheck, "Non-custodial"],
  [LockOpen, "No lock-in"],
  [ArrowDownToLine, "Withdraw anytime"],
];

/**
 * "How it works" — Figma "02 Agents - Alpha Agents" A5. The Alpha Agents intro
 * paragraph used to sit above the shelves and cost a third of the first screen;
 * it now opens from the toolbar link and the section ⓘ, its three promises
 * pulled out as rows.
 */
export default function AgentsAboutSheet({ open, onClose }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="How it works">
      <div className="flex flex-col gap-4 px-4 pt-4">
        <p className="text-[13px] leading-5 text-[#b0b0be]">
          AI agents trade perps for you, live, 24/7. Your agent trades on your behalf, but your funds stay fully
          in your control.
        </p>
        <ul className={`${TILE} flex flex-col gap-3 p-3`}>
          {FACTS.map(([Icon, label]) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#ccb17f]">
                <Icon size={14} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-[13px] font-medium leading-[18px] text-[#e8d5b5]">{label}</span>
            </li>
          ))}
        </ul>
        <Dn2Button size="lg" className="w-full" onClick={onClose}>
          Got it
        </Dn2Button>
      </div>
    </Dn2Sheet>
  );
}
