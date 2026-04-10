export default function FieldKitHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-white via-slate-50 to-stone-100 p-8 shadow-sm sm:p-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="relative space-y-4">
        <p className="inline-flex rounded-full border border-zinc-300/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
          Step 1 MVP
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          FieldKit
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg">
          Turn screenshots into prototype-ready UI shells in minutes. Upload or
          capture a reference image and present a structured extraction with a
          polished preview.
        </p>
      </div>
    </section>
  );
}
