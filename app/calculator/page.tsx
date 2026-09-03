import type { Metadata } from "next";
import { Suspense } from "react";

import { CalculatorView } from "@/components/calculator-view";
import { PageSkeleton } from "@/components/page-skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CIDR Calculator — Subnet Mask, Host Range & Split Calculator",
  description:
    "Calculate network and broadcast addresses, usable host ranges, subnet and wildcard masks, and split any IPv4 or IPv6 CIDR block into smaller subnets.",
  alternates: {
    canonical: "/calculator",
  },
};

type PageProps = {
  searchParams: Promise<{
    cidr?: string | string[];
    split?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function CalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = firstValue(params.cidr);
  const rawSplit = firstValue(params.split);
  const parsedSplit = Number.parseInt(rawSplit, 10);
  const splitPrefix = Number.isFinite(parsedSplit) ? parsedSplit : null;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CalculatorView query={query} splitPrefix={splitPrefix} />
    </Suspense>
  );
}
