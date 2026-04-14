const benefits = [
  {
    title: "Compress feedback loop",
    text: "Move from weeks to days and validate ideas faster",
  },
  {
    title: "Improve story quality",
    text: "Better clarity leads to fewer surprises in delivery",
  },
  {
    title: "Reduce wasted effort",
    text: "Focus only on what users actually need",
  },
];

export default function BenefitsSection() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Why teams switch to this flow</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
