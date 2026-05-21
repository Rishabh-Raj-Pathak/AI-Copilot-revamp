const STATUS_STYLES = {
  Draft: "bg-[#242424] text-[#bfbfbf]",
  Backtested: "bg-[#171200] text-[#f2b500]",
  "Paper Trading": "bg-[#001610] text-[#00f3b6]",
  Watching: "bg-[#171200] text-[#f2b500]",
  Paused: "bg-[#242424] text-[#929292]",
  "Ready to Deploy": "bg-[#1a2a1a] text-[#269755]",
  Completed: "bg-[#242424] text-[#757575]",
};

export function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.Draft} ${className}`}
    >
      {status}
    </span>
  );
}
