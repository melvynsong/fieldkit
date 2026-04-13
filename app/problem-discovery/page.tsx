import ProblemDiscoveryForm from "@/components/ProblemDiscoveryForm";

export default function ProblemDiscoveryPage() {
  return (
    <main className="flex-1 bg-slate-100/60 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-600">
            Problem Discovery Engine
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Problem-first analysis for product decisions
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            Capture the problem context, run disciplined AI analysis, and get structured output for Problem Discovery A and B.
          </p>
        </section>

        <ProblemDiscoveryForm />
      </div>
    </main>
  );
}
