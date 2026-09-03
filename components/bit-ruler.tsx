import type { SubnetResult } from "@/lib/subnet";

type BitRulerProps = {
  result: SubnetResult;
};

/**
 * Shows every bit of the network address, coloured by whether the prefix
 * covers it (network bits) or not (host bits).
 */
export function BitRuler({ result }: BitRulerProps) {
  const totalBits = result.version === 4 ? 32 : 128;
  const separator = result.version === 4 ? "." : ":";

  return (
    <section
      aria-labelledby="bits-heading"
      className="rounded-lg border border-indigo-200/80 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 px-5 py-3.5">
        <h2 id="bits-heading" className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-950/70">
          Bit layout
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-indigo-950/70">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-600" />
            Network ({result.prefix} bits)
          </span>
          <span className="inline-flex items-center gap-1.5 text-indigo-950/70">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Host ({totalBits - result.prefix} bits)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto px-5 py-5">
        <div className="flex min-w-max items-start gap-3">
          {result.bitGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-start gap-3">
              <div>
                <div className="flex gap-0.5">
                  {group.bits.map((bit, bitIndex) => (
                    <span
                      key={bitIndex}
                      className={[
                        "inline-flex h-6 w-4 items-center justify-center rounded-sm font-mono text-[11px] font-semibold",
                        bit.isNetwork
                          ? "bg-indigo-600 text-white"
                          : "bg-amber-100 text-amber-900",
                      ].join(" ")}
                    >
                      {bit.value}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-center font-mono text-xs text-indigo-950/60">
                  {group.label}
                </p>
              </div>
              {groupIndex < result.bitGroups.length - 1 ? (
                <span className="pt-0.5 font-mono text-sm text-indigo-300">{separator}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
