import { buildDesignBrief } from "@/lib/design-brief";
import type { DesignExtraction } from "@/lib/design-normalizer";

interface DesignBriefPanelProps {
  design: DesignExtraction;
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}

export default function DesignBriefPanel({ design }: DesignBriefPanelProps) {
  const brief = buildDesignBrief(design);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Design Brief</h2>
        <p className="mt-1 text-sm text-slate-600">
          Human-friendly summary generated from extracted design signals.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">{brief.summary}</p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Likely Purpose</dt>
          <dd className="mt-1 text-slate-600">{brief.likelyPurpose}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Brand / Tone</dt>
          <dd className="mt-1 text-slate-600">{brief.tone}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Navigation</dt>
          <dd className="mt-1 text-slate-600">{brief.navigationType}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Layout</dt>
          <dd className="mt-1 text-slate-600">{brief.layoutStructure}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Data Density</dt>
          <dd className="mt-1 text-slate-600">{brief.dataDensity}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <dt className="font-semibold text-slate-900">Interaction Style</dt>
          <dd className="mt-1 text-slate-600">{brief.interactionStyle}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-slate-900">Personality</p>
        <div className="flex flex-wrap gap-2">
          {brief.personality.map((trait) => (
            <Chip key={trait} label={trait} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-slate-900">Key Visual Traits</p>
        <div className="flex flex-wrap gap-2">
          {brief.visualTraits.map((trait) => (
            <Chip key={trait} label={trait} />
          ))}
        </div>
      </div>
    </section>
  );
}
