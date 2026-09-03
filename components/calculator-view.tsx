import { Calculator, TriangleAlert } from "lucide-react";

import { AddressTable } from "@/components/address-table";
import { BitRuler } from "@/components/bit-ruler";
import { CalculatorBar } from "@/components/calculator-bar";
import { SplitTable } from "@/components/split-table";
import { SummaryAside } from "@/components/summary-aside";
import { getRangeOwner, type RangeOwnerResult } from "@/lib/range-owner";
import { calculateSubnet } from "@/lib/subnet";

type CalculatorViewProps = {
  query: string;
  splitPrefix: number | null;
};

export async function CalculatorView({ query, splitPrefix }: CalculatorViewProps) {
  const outcome = query ? calculateSubnet(query) : null;

  let owner: RangeOwnerResult | null = null;

  // Ownership only exists for globally routable blocks.
  if (outcome?.ok && !outcome.result.isPrivate) {
    owner = await getRangeOwner(outcome.result.address);
  }

  return (
    <>
      <CalculatorBar query={query} />

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
        {!outcome ? (
          <EmptyState />
        ) : !outcome.ok ? (
          <div className="flex max-w-2xl gap-3 rounded-lg border-2 border-red-300 bg-white px-5 py-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">Invalid input</p>
              <p className="mt-1 text-sm leading-6 text-indigo-950/70">{outcome.error}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <AddressTable result={outcome.result} />
              <BitRuler result={outcome.result} />
              <SplitTable
                result={outcome.result}
                query={query}
                splitPrefix={splitPrefix}
              />
            </div>
            <aside className="lg:col-span-4">
              <SummaryAside result={outcome.result} owner={owner} />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-indigo-200/80 bg-white px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-md bg-indigo-600 text-white">
        <Calculator className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold text-indigo-950">
        Enter an IP address or CIDR block
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-indigo-950/60">
        Works with IPv4 and IPv6, CIDR notation or a dotted subnet mask. You get the
        network and broadcast addresses, host range, masks, bit layout, and who announces
        the range.
      </p>
    </div>
  );
}
