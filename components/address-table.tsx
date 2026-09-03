import { CopyButton } from "@/components/copy-button";
import { formatBig, type SubnetResult } from "@/lib/subnet";

type AddressTableProps = {
  result: SubnetResult;
};

export function AddressTable({ result }: AddressTableProps) {
  const rows: Array<{ label: string; value: string; copy?: boolean }> = [
    { label: "CIDR notation", value: result.cidr, copy: true },
    { label: "Network address", value: result.networkAddress, copy: true },
  ];

  if (result.broadcastAddress) {
    rows.push({ label: "Broadcast address", value: result.broadcastAddress, copy: true });
  }

  rows.push(
    { label: "First usable host", value: result.firstHost, copy: true },
    { label: "Last usable host", value: result.lastHost, copy: true },
  );

  if (result.netmask) {
    rows.push({ label: "Subnet mask", value: result.netmask, copy: true });
  }

  if (result.wildcardMask) {
    rows.push({ label: "Wildcard mask", value: result.wildcardMask, copy: true });
  }

  rows.push(
    { label: "Prefix length", value: `/${result.prefix}` },
    { label: "Total addresses", value: formatBig(result.totalAddresses) },
    { label: "Usable hosts", value: formatBig(result.usableHosts) },
  );

  if (result.addressClass) {
    rows.push({ label: "Address class", value: result.addressClass });
  }

  rows.push(
    { label: "Scope", value: result.scope },
    { label: "IP version", value: `IPv${result.version}` },
  );

  return (
    <section
      aria-labelledby="addresses-heading"
      className="rounded-lg border border-indigo-200/80 bg-white"
    >
      <div className="border-b border-indigo-100 px-5 py-3.5">
        <h2 id="addresses-heading" className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-950/70">
          Address breakdown
        </h2>
      </div>
      <dl className="divide-y divide-indigo-50">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3"
          >
            <dt className="text-sm text-indigo-950/60">{row.label}</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-indigo-950 sm:text-base">
                {row.value}
              </span>
              {row.copy ? <CopyButton value={row.value} label="" /> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
