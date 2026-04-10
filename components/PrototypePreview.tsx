function Watermark({ label }: { label: string }) {
  return (
    <span className="absolute right-3 top-3 rounded bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
      {label}
    </span>
  );
}

export default function PrototypePreview() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Prototype Preview</h2>
        <p className="mt-1 text-sm text-zinc-600">
          A visual shell showing likely product structure from extracted design.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <div className="relative rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-100 to-white p-4">
              <Watermark label="Navigation" />
              <div className="h-4 w-28 rounded bg-zinc-300" />
            </div>

            <div className="relative rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 p-5">
              <Watermark label="Header" />
              <div className="h-5 w-3/5 rounded bg-zinc-300" />
              <div className="mt-3 h-3 w-4/5 rounded bg-zinc-200" />
            </div>

            <div className="relative rounded-xl border border-zinc-200 bg-zinc-50 p-5">
              <Watermark label="Content" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
                <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
                <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
                <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
              </div>
            </div>

            <div className="relative rounded-xl border border-zinc-200 bg-white p-5">
              <Watermark label="Transactions" />
              <div className="space-y-2">
                <div className="h-10 rounded-lg bg-zinc-100" />
                <div className="h-10 rounded-lg bg-zinc-100" />
                <div className="h-10 rounded-lg bg-zinc-100" />
              </div>
            </div>
          </div>

          <aside className="relative rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <Watermark label="Side Panel" />
            <div className="space-y-3 pt-4">
              <div className="h-12 rounded-lg bg-white" />
              <div className="h-28 rounded-lg bg-white" />
              <div className="h-20 rounded-lg bg-white" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
