import { POWERED_BY_URL } from "@/lib/constants";

type PoweredByBadgeProps = {
  className?: string;
};

export function PoweredByBadge({ className }: PoweredByBadgeProps) {
  return (
    <a
      href={POWERED_BY_URL}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-950/70 transition hover:border-indigo-400 hover:text-indigo-900 sm:text-sm",
        className ?? "",
      ].join(" ")}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500"
        aria-hidden="true"
      />
      Powered by ipgeolocation.io
    </a>
  );
}
