export default function LoadingRoomDetailPage() {
  return (
    <main className="flex-1 bg-[#f3f5f7] pb-16">
      <section className="mx-auto w-full max-w-400 animate-pulse space-y-4 px-4 pt-8 lg:px-8">
        <div className="h-28 rounded-3xl bg-slate-200" />
        <div className="h-80 rounded-3xl bg-slate-200" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-60 rounded-3xl bg-slate-200 lg:col-span-2" />
          <div className="h-60 rounded-3xl bg-slate-200" />
        </div>
      </section>
    </main>
  );
}
