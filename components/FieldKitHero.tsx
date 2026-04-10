export default function FieldKitHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-[0_3px_12px_rgba(15,23,42,0.05)] sm:p-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-slate-200/55 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="relative space-y-4">
        <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
          Prototype Generator
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            FieldKit
          </h1>
          <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Beta
          </span>
        </div>
        <p className="max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
          Turn screenshots into prototype-ready UI shells in minutes. Upload or
          capture a reference image and present a structured extraction with a
          polished preview.
        </p>
      </div>
    </section>
  );
}
