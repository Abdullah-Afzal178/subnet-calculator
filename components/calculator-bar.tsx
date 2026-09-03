import Link from "next/link";
import { Binary, Calculator } from "lucide-react";

import { PoweredByBadge } from "@/components/powered-by-badge";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const EXAMPLES = ["192.168.1.0/24", "10.0.0.0/8", "172.16.5.4/12", "2001:db8::/48"];

type CalculatorBarProps = {
  query: string;
};

/**
 * Full-bleed banded header: brand row on top, the calculation input spanning
 * the entire width beneath it.
 */
export function CalculatorBar({ query }: CalculatorBarProps) {
  return (
    <div className="border-b border-indigo-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Calculator className="h-5 w-5" />
              </span>
              <span className="text-xl font-semibold tracking-tight text-indigo-950">
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-1.5 text-sm text-indigo-950/60">{SITE_TAGLINE}</p>
          </div>
          <PoweredByBadge />
        </div>

        <form action="/calculator" method="get" className="mt-5">
          <label htmlFor="cidr" className="sr-only">
            IP address or CIDR block
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-center gap-2.5 rounded-md border-2 border-indigo-200 bg-white px-3.5 transition focus-within:border-indigo-500">
              <Binary className="h-5 w-5 shrink-0 text-indigo-400" />
              <input
                id="cidr"
                name="cidr"
                type="text"
                defaultValue={query}
                placeholder="192.168.1.0/24 · 10.0.0.1 255.0.0.0 · 2001:db8::/48"
                className="w-full bg-transparent py-3 font-mono text-base text-indigo-950 outline-none placeholder:text-indigo-300 sm:text-lg"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Calculate
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-indigo-950/40">
            Examples
          </span>
          {EXAMPLES.map((example) => (
            <Link
              key={example}
              href={`/calculator?cidr=${encodeURIComponent(example)}`}
              className="font-mono text-xs text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition hover:decoration-indigo-500"
            >
              {example}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
