function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ActivityTimeline({ entries, emptyMessage, compact }) {
  if (!entries?.length) {
    return (
      <p className={`text-[#757575] ${compact ? "text-[10px]" : "text-xs"}`}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={`space-y-2 ${compact ? "" : "mt-1"}`}>
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-2">
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#454545]"
            aria-hidden
          />
          <div className="min-w-0">
            <p
              className={`leading-relaxed text-[#929292] ${compact ? "text-[10px]" : "text-xs"}`}
            >
              {entry.message}
            </p>
            {entry.at ? (
              <p className="text-[10px] text-[#585858]">{formatTime(entry.at)}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
