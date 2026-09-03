import Link from "next/link";

import { formatBig, splitOptions, splitSubnet, type SubnetResult } from "@/lib/subnet";

type SplitTableProps = {
  result: SubnetResult;
  query: string;
  splitPrefix: number | null;
};

const ROW_LIMIT = 16;

export function SplitTable({ result, query, splitPrefix }: SplitTableProps) {
  const options = splitOptions(result);

  if (options.length === 0) {
    return null;
  }

  const active = splitPrefix && options.includes(splitPrefix) ? splitPrefix : null;
  const { rows, total } = active
    ? splitSubnet(result, active, ROW_LIMIT)
    : { rows: [], total: 0n };

  return (
    <section
      aria-labelledby="split-heading"
      className="rounded-lg border border-indigo-200/80 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 px-5 py-3.5">
        <h2 id="split-heading" className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-950/70">
          Split this block
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {options.map((option) => (
            <Link
              key={option}
              href={`/calculator?cidr=${encodeURIComponent(query)}&split=${option}`}
              className={[
                "rounded-md border px-2.5 py-1 font-mono text-xs font-semibold transition",
                option === active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400",
              ].join(" ")}
            >
              /{option}
            </Link>
          ))}
        </div>
      </div>

      {active ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-indigo-100 text-xs uppercase tracking-[0.08em] text-indigo-950/50">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium">#</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Subnet</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Host range</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Hosts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {rows.map((row) => (
                  <tr key={row.cidr}>
                    <td className="px-5 py-2.5 font-mono text-xs text-indigo-950/40">
                      {row.index}
                    </td>
                    <td className="px-5 py-2.5 font-mono font-semibold text-indigo-950">
                      {row.cidr}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-indigo-950/70">
                      {row.firstHost} – {row.lastHost}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-indigo-950/70">
                      {formatBig(row.usableHosts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-indigo-50 px-5 py-3 text-xs text-indigo-950/50">
            {total > BigInt(ROW_LIMIT)
              ? `Showing the first ${ROW_LIMIT} of ${formatBig(total)} /${active} subnets.`
              : `${formatBig(total)} /${active} subnet${total === 1n ? "" : "s"} in this block.`}
          </p>
        </>
      ) : (
        <p className="px-5 py-5 text-sm text-indigo-950/60">
          Pick a smaller prefix above to divide <span className="font-mono">{result.cidr}</span>{" "}
          into equal subnets.
        </p>
      )}
    </section>
  );
}
