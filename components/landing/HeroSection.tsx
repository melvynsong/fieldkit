import Link from "next/link";

type HeroSectionProps = {
  scrollTargetId: string;
};

export default function HeroSection({ scrollTargetId }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-6 py-14 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
          <span className="rounded-md bg-amber-200/65 px-2 py-1">Prototype on the fly.</span>{" "}
          Get real <span className="rounded-md bg-amber-200/65 px-2 py-1">user feedback</span> immediately.
        </h1>
        <p className="mt-6 text-pretty text-base text-slate-600 sm:text-lg">
          Turn conversations, ideas, and screenshots into working concepts in minutes - not weeks.
        </p>
        <p className="mt-2 text-pretty text-sm font-medium text-slate-500 sm:text-base">
          FieldKit compresses the journey from idea to user feedback from weeks into days.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/workflow"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Workflow
          </Link>
          <a
            href={`#${scrollTargetId}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
