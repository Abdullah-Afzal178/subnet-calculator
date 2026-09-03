import { Globe, Lock, TriangleAlert } from "lucide-react";

import { formatBig, type SubnetResult } from "@/lib/subnet";
import type { RangeOwnerResult } from "@/lib/range-owner";

type SummaryAsideProps = {
  result: SubnetResult;
  owner: RangeOwnerResult | null;
};

export function SummaryAside({ result, owner }: SummaryAsideProps) {
  const ownerRows = owner?.ok
    ? [
        { label: "Announced route", value: owner.data.announcedRoute, mono: true },
        { label: "ASN", value: owner.data.asNumber, mono: true },
        { label: "Organization", value: owner.data.organization },
        { label: "Company type", value: formatEnum(owner.data.companyType) },
        { label: "RIR", value: owner.data.rir },
        { label: "Country", value: owner.data.countryName },
      ].filter((row) => row.value.trim() !== "")
    : [];

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-lg border-2 border-indigo-600 bg-indigo-600 px-5 py-6 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-indigo-200">
          Usable hosts
        </p>
        <p className="mt-2 font-mono text-4xl font-bold leading-none">
          {formatBig(result.usableHosts)}
        </p>
        <p className="mt-3 font-mono text-sm text-indigo-100">
          {result.cidr}
        </p>
        <p className="mt-1 text-xs text-indigo-200">
          {formatBig(result.totalAddresses)} total addresses · /{result.prefix}
        </p>
      </div>

      <div className="rounded-lg border border-indigo-200/80 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          {result.isPrivate ? (
            <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <Globe className="h-4 w-4 shrink-0 text-indigo-600" />
          )}
          <p className="text-sm font-semibold text-indigo-950">{result.scope}</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-indigo-950/60">
          {result.isPrivate
            ? "Not routable on the public internet, so it has no registered owner."
            : "Routable on the public internet."}
        </p>
      </div>

      {result.prefixAssumed ? (
        <div className="flex gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-5 text-amber-900">
            No prefix given, so <span className="font-mono font-semibold">/{result.prefix}</span>{" "}
            was assumed. Add one (e.g. <span className="font-mono">/16</span>) to change it.
          </p>
        </div>
      ) : null}

      {!result.isPrivate ? (
        <div className="rounded-lg border border-indigo-200/80 bg-white">
          <div className="border-b border-indigo-100 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-950/70">
              Who announces this range
            </h2>
          </div>

          {owner?.ok ? (
            <>
              <dl className="divide-y divide-indigo-50">
                {ownerRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 px-5 py-2.5">
                    <dt className="shrink-0 text-xs text-indigo-950/60">{row.label}</dt>
                    <dd
                      className={`text-right text-xs font-semibold text-indigo-950 ${
                        row.mono ? "font-mono" : ""
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {owner.data.isAnycast || owner.data.isCdn ? (
                <div className="flex flex-wrap gap-1.5 border-t border-indigo-50 px-5 py-3">
                  {owner.data.isAnycast ? <Tag label="Anycast" /> : null}
                  {owner.data.isCdn ? <Tag label="CDN" /> : null}
                </div>
              ) : null}
            </>
          ) : (
            <p className="px-5 py-4 text-xs leading-5 text-indigo-950/60">
              {owner?.error.message ?? "Ownership details are unavailable for this address."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
      {label}
    </span>
  );
}

function formatEnum(value: string) {
  if (!value.trim()) {
    return "";
  }

  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => (word === "isp" ? "ISP" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}
