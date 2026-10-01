/**
 * A Figma line icon tinted with `currentColor`.
 *
 * The exported SVGs bake in white; drawing them as a CSS mask keeps the exact
 * Figma glyph while letting state (active gold, destructive red, muted grey)
 * come from the text colour like any other icon font.
 *
 * @param {{ src: string, size?: number, className?: string, label?: string }} props
 */
export default function AppIcon({ src, size = 20, className = "", label }) {
  return (
    <span
      className={`app-icon ${className}`}
      style={{ "--app-icon": `url("${src}")`, width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
