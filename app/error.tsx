"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-lg border border-indigo-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-indigo-950/50">
          Unexpected error
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-indigo-950">
          The page could not be rendered.
        </h1>
        <p className="mt-4 text-base text-indigo-950/70">
          Try the calculation again. If the problem continues, check the CIDR block you
          entered.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex items-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
