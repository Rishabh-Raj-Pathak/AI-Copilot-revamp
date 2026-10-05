/**
 * Figma "Empty State" (Copilot A5 1189:12683 · B1 1222:7000): icon disc, title,
 * a short message and full-width stacked 44px actions, primary first.
 *
 *          ( ◎ )
 *     No setups in X
 *   one or two even lines
 *   [ ▓▓ primary ▓▓▓▓▓ ]
 *   [    secondary     ]
 *
 * Grows to fill a flex-column parent and centres in it, sitting a touch above
 * the middle (`pb-6`); anywhere else it takes its natural height. `icon` is a
 * 20px glyph (`AppIcon` or a Lucide icon) — it inherits the muted ink.
 */
export default function AppEmptyState({ icon, title, message, actions = [], className = "" }) {
  return (
    <div className={`flex flex-1 flex-col items-center justify-center pb-6 text-center ${className}`}>
      <span
        className="flex size-12 items-center justify-center rounded-full bg-app-control text-ink-muted"
        aria-hidden
      >
        {icon}
      </span>
      <h2 className="text-balance pt-4 text-app-heading font-semibold text-ink">{title}</h2>
      {message ? (
        <p className="mt-1.5 max-w-[280px] text-balance text-app-callout text-ink-subtle">{message}</p>
      ) : null}
      {actions.length ? (
        <div className="flex w-full flex-col gap-2.5 pt-6">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`app-pressable h-11 w-full rounded-full text-app-button font-medium ${
                action.primary
                  ? "app-gradient-brand text-black"
                  : "bg-app-control text-ink active:bg-white/[0.1]"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
