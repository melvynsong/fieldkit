export default function FieldKitHero() {
  return (
    <section className="rounded-[10px] border border-gov-border bg-white px-8 py-8 shadow-[0_2px_12px_rgba(26,44,91,0.07)] sm:px-10">
      <div className="space-y-3">
        <p className="inline-flex rounded-full border border-gov-border bg-gov-navy-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gov-navy">
          Prototype Generator
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-gov-navy sm:text-4xl">
            FieldKit
          </h1>
          <span className="inline-flex rounded-full border border-gov-red-border bg-gov-red-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gov-red">
            BETA
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-gov-muted sm:text-base">
          Turn screenshots into prototype-ready UI shells in minutes. Upload a reference image to get a structured extraction with a polished preview.
        </p>
      </div>
    </section>
  );
}
