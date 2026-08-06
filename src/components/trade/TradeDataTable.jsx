/** Column-driven table for the Trade bottom panel. Grid table on desktop, cards below `tablet`. */
export default function TradeDataTable({ columns, rows, empty }) {
  if (!rows.length) {
    return (
      <p className="px-5 py-10 text-center text-sm text-[#757575]">{empty}</p>
    );
  }

  const accent = columns.find((c) => c.accent) ?? columns[0];
  const rest = columns.filter((c) => c !== accent);

  return (
    <>
      {/* Desktop */}
      <div className="minimal-scrollbar hidden min-h-0 flex-1 overflow-auto tablet:block">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="sticky top-0 z-10 whitespace-nowrap border-b border-[#242424] bg-black px-4 py-3 text-center text-xs font-normal text-[#bfbfbf] first:text-left"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-l-2 border-transparent transition-colors hover:border-l-[#f2b500] hover:bg-white/[0.02]"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="whitespace-nowrap px-4 py-3.5 text-center text-sm text-white tabular-nums first:text-left"
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="minimal-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 tablet:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            className="overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-[#111116] to-[#0c0c10] p-4"
          >
            <div className="mb-3 text-sm">{accent.render(row)}</div>
            <dl className="flex flex-col gap-2">
              {rest.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3">
                  <dt className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                    {c.label}
                  </dt>
                  <dd className="text-right text-sm text-[#d4d4d8] tabular-nums">
                    {c.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
