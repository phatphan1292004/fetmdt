export default function CategoryLoading() {
  return (
    <main className="container mx-auto px-4 py-8 md:px-6">
      {/* Title skeleton */}
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-200" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] items-start">
        {/* Sidebar skeleton */}
        <aside className="hidden xl:block">
          <div className="h-[600px] animate-pulse rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" />
        </aside>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
            >
              {/* Image box skeleton */}
              <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-slate-200" />
              {/* Content skeletons */}
              <div className="mt-4 flex-1 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
              {/* Footer skeleton */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100/60 pt-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                    <div className="h-2.5 w-12 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
