import type { ReactNode } from "react";

type ProblemCard = {
  title: string;
  text: string;
  footer: string;
  icon: ReactNode;
};

const cards: ProblemCard[] = [
  {
    title: "Little or no discovery",
    text: "Products are shaped too early by assumptions instead of real understanding",
    footer: "Clunky user experience",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <path d="M8 8l8 8" />
      </svg>
    ),
  },
  {
    title: "Lengthy requirements gathering",
    text: "Teams spend weeks writing specs before seeing anything real",
    footer: "Hardened assumptions",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 9h8M8 13h8" />
      </svg>
    ),
  },
  {
    title: "Late user feedback",
    text: "Users only interact with the product much later in the process",
    footer: "Too many change requests",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16v10H4z" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
];

export default function ProblemSection() {
  return (
    <section id="problem-today" className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">The Problem Today</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Teams discover reality too late.</h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-slate-600">{card.icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">{card.footer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
