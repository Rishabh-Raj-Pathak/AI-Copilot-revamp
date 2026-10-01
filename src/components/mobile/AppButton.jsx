/**
 * Figma "Button / Large" (1036:5128): full-width 44px CTA, 15px medium label.
 *
 * - primary     brand gradient, black label — the main non-destructive action
 * - destructive red fill — irreversible actions (delete, close position)
 * - secondary   subtle fill + hairline — the neutral alternative
 * - ghost       label only — cancel / tertiary
 * - buy         solid positive green — "Buy / Long", "Connect Wallet" in a ticket
 *
 * `disabled` renders Figma's Disabled style regardless of `variant`, which is
 * how the design shows a button whose precondition isn't met yet.
 */
const VARIANT_CLASS = {
  primary: "app-gradient-brand text-black",
  destructive: "bg-app-negative text-ink",
  secondary: "border border-app-line bg-app-subtle text-ink",
  ghost: "bg-transparent text-ink-muted",
  buy: "bg-app-positive text-ink",
};

export default function AppButton({
  variant = "primary",
  disabled = false,
  className = "",
  children,
  type = "button",
  ...rest
}) {
  const look = disabled ? "bg-app-subtle text-ink-faint" : VARIANT_CLASS[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      className={`app-pressable flex h-11 w-full items-center justify-center gap-2 rounded-[10px] px-5 text-app-button font-medium disabled:pointer-events-none ${look} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
