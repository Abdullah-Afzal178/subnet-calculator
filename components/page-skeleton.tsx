export function PageSkeleton() {
  return (
    <>
      <div className="border-b border-indigo-200/70 bg-white/80">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-10">
          <div className="h-9 w-48 animate-pulse rounded-md bg-indigo-100" />
          <div className="mt-5 h-12 animate-pulse rounded-md bg-indigo-100" />
        </div>
      </div>
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="h-80 animate-pulse rounded-lg border border-indigo-200/80 bg-white" />
            <div className="h-40 animate-pulse rounded-lg border border-indigo-200/80 bg-white" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <div className="h-40 animate-pulse rounded-lg bg-indigo-100" />
            <div className="h-24 animate-pulse rounded-lg border border-indigo-200/80 bg-white" />
          </div>
        </div>
      </main>
    </>
  );
}
