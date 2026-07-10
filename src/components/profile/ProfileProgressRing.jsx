import { useId } from "react";

/**
 * Brand-gradient completion ring drawn around whatever it wraps.
 *
 * Hand-rolled rather than pulled from the delta-neutral kit: that one is a
 * linear bar on a different design system, and its Radix dependency isn't in
 * this package's root deps.
 *
 * @param {object} props
 * @param {number} props.percent 0–100
 * @param {number} [props.size] outer diameter in px
 * @param {number} [props.strokeWidth]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children centred inside the ring
 */
export default function ProfileProgressRing({
  percent,
  size = 26,
  strokeWidth = 2,
  className = "",
  children,
}) {
  const gradientId = useId();
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7bb08" />
            <stop offset="100%" stopColor="#2fffce" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#242424"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {children}
    </span>
  );
}
