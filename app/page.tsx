import { Suspense } from "react";

import { CalculatorView } from "@/components/calculator-view";
import { PageSkeleton } from "@/components/page-skeleton";

export const dynamic = "force-dynamic";

// A private block by default: instantly useful and costs no API credit.
const DEFAULT_CIDR = "192.168.1.0/24";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CalculatorView query={DEFAULT_CIDR} splitPrefix={null} />
    </Suspense>
  );
}
