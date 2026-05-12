export default function ClockIcon({ className = 'size-3 shrink-0 text-current' }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.75V6l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
