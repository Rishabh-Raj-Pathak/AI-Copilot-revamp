import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  v3DetailText,
  v3SectionTitle,
} from "./V3TabLayout.jsx";

export default function StrategyLogicCard({ setup, className = "" }) {
  const theme = useCopilotTheme();
  if (!setup) return null;

  const entry = setup.entryRules ?? [];
  const exit = setup.exitRules ?? [];
  const risk = setup.riskRules ?? [];

  if (theme.isV3) {
    return (
      <section
        className={`border-b border-white/6 py-5 ${className}`.trim()}
      >
        <div className="flex items-center gap-2">
          <span
            className="size-1.5 shrink-0 rounded-full bg-[var(--ds-copilot-v2-mint)]"
            aria-hidden
          />
          <h4 className={v3SectionTitle}>Strategy Logic</h4>
        </div>
        {setup.description ? (
          <p className={`mt-2.5 ${v3DetailText}`}>{setup.description}</p>
        ) : null}

        {(entry.length > 0 || exit.length > 0) && (
          <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
            {entry.length > 0 ? (
              <div className="sm:pr-6">
                <p className="text-xs font-medium text-[rgba(255,255,255,0.48)]">
                  Entry condition
                </p>
                <ul className="mt-1.5 space-y-1">
                  {entry.map((r) => (
                    <li
                      key={r}
                      className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.72)]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="hidden sm:block" />
            )}
            {entry.length > 0 && exit.length > 0 ? (
              <div
                className={`hidden self-stretch sm:block ${theme.dividerVertical}`}
                aria-hidden
              />
            ) : null}
            {exit.length > 0 ? (
              <div className="sm:pl-6">
                <p className="text-xs font-medium text-[rgba(255,255,255,0.48)]">
                  Exit condition
                </p>
                <ul className="mt-1.5 space-y-1">
                  {exit.map((r) => (
                    <li
                      key={r}
                      className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.72)]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {setup.personalizationNote ? (
          <p className="mt-4 text-[12px] leading-relaxed text-[rgba(255,255,255,0.52)]">
            {setup.personalizationNote}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <div
      className={`${theme.isV2 ? "" : "mt-3"} p-4 sm:p-5 ${theme.card} ${className}`}
    >
      <h4
        className={
          theme.isV2
            ? "text-sm font-bold text-white"
            : "text-xs font-semibold text-white"
        }
      >
        Strategy Logic
      </h4>
      {setup.description ? (
        <p className="mt-2 text-[11px] leading-relaxed text-[#929292]">
          {setup.description}
        </p>
      ) : null}

      {theme.isV2 && (entry.length > 0 || exit.length > 0) ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
          {entry.length > 0 ? (
            <div className="sm:pr-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#757575]">
                Entry condition
              </p>
              <ul className="mt-1.5 space-y-1">
                {entry.map((r) => (
                  <li
                    key={r}
                    className="text-[11px] leading-relaxed text-[#bfbfbf]"
                  >
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <span className="hidden sm:block" />
          )}
          {entry.length > 0 && exit.length > 0 ? (
            <div
              className="hidden w-px self-stretch bg-[#2a2a2a] sm:block"
              aria-hidden
            />
          ) : null}
          {exit.length > 0 ? (
            <div className="sm:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#757575]">
                Exit condition
              </p>
              <ul className="mt-1.5 space-y-1">
                {exit.map((r) => (
                  <li
                    key={r}
                    className="text-[11px] leading-relaxed text-[#bfbfbf]"
                  >
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {entry.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
                Entry condition
              </p>
              <ul className="mt-1 space-y-0.5">
                {entry.map((r) => (
                  <li key={r} className="text-[11px] text-[#bfbfbf]">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {exit.length > 0 ? (
            <div className="mt-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
                Exit condition
              </p>
              <ul className="mt-1 space-y-0.5">
                {exit.map((r) => (
                  <li key={r} className="text-[11px] text-[#bfbfbf]">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {!theme.isV2 && risk.length > 0 ? (
        <div className="mt-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
            Risk rules
          </p>
          <ul className="mt-1 space-y-0.5">
            {risk.map((r) => (
              <li key={r} className="text-[11px] text-[#bfbfbf]">
                · {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {setup.personalizationNote ? (
        <p
          className={`mt-4 text-[10px] leading-relaxed ${
            theme.isV2
              ? "text-[rgba(255,255,255,0.52)]"
              : "text-[#f2b500]"
          }`}
        >
          {setup.personalizationNote}
        </p>
      ) : null}
    </div>
  );
}
