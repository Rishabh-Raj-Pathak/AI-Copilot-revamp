import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";

/**
 * Figma header "Title" (Copilot 1227:13448 / 1189:11934): a 17/22 title over
 * an 11px meta line, left of the account controls in `AppTopBar`.
 *
 * With `onPress` it is a title menu — the chevron says the title is the
 * screen's switchable context (the strategy on Copilot, the market on Trade)
 * and tapping it opens that context's sheet. Without it, the title is the
 * screen's heading. Steps down to 15px under 375px so the account controls
 * keep their room.
 */
export default function AppScreenTitle({
  title,
  meta,
  onPress,
  expanded = false,
  disabled = false,
  ariaLabel,
  dataTour,
}) {
  const Title = onPress ? "span" : "h1";
  const body = (
    <>
      <Title className="flex max-w-full items-center gap-0.5 text-app-heading font-semibold text-ink max-[374px]:text-app-button">
        <span className="truncate">{title}</span>
        {onPress ? (
          <AppIcon
            src={appIcons.chevronDown16}
            size={14}
            className={`shrink-0 text-ink-subtle transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        ) : null}
      </Title>
      {meta ? (
        <span className="max-w-full truncate text-app-label font-medium text-ink-faint">{meta}</span>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <div
        data-tour={dataTour}
        className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center gap-0.5"
      >
        {body}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled}
        onClick={onPress}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-label={ariaLabel}
        data-tour={dataTour}
        className="app-pressable -ml-1.5 flex min-h-11 max-w-full flex-col items-start justify-center gap-0.5 rounded-lg px-1.5 text-left active:bg-white/[0.04]"
      >
        {body}
      </button>
    </div>
  );
}
