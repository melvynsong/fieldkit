import Link from "next/link";

export default function CTASection() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:px-8">
      <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        Now we can focus on scaling with confidence.
      </h2>
      <Link
        href="/workflow"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Open Workflow
      </Link>
    </section>
  );
}
