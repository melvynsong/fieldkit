const oldFlow = ["Discovery", "Design", "Build", "Scale"];

export default function ShiftSection() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
        What if we could prototype on the fly for immediate user feedback?
      </h2>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">As-is</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {oldFlow.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {step}
              </span>
              {index < oldFlow.length - 1 ? <span className="text-slate-400">-&gt;</span> : null}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">~4 weeks</p>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-lime-50 to-emerald-100 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">To-be</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white/80 px-4 py-3">
          <span className="text-sm font-semibold text-emerald-800 sm:text-base">Prototype -&gt; Test with users -&gt; Iterate</span>
          <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">2-3 days</span>
        </div>
        <p className="mt-4 text-sm font-semibold text-emerald-800">~10x faster feedback loop</p>
      </div>
    </section>
  );
}
