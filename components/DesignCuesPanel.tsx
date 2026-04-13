"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function DesignCuesPanel() {
  const cues = useWorkflowStore((state) => state.activeDesignCues);

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Design Cues Used
      </h3>
      <dl className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-900">Tone</dt>
          <dd>{cues.tone}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Density / Spacing</dt>
          <dd>{cues.density}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Color direction</dt>
          <dd>{cues.colorDirection}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Typography hierarchy</dt>
          <dd>{cues.typographyHierarchy}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Layout rhythm</dt>
          <dd>{cues.layoutRhythm}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Navigation style</dt>
          <dd>{cues.navigationStyle}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-slate-900">Card / section style</dt>
          <dd>{cues.cardSectionStyle}</dd>
        </div>
      </dl>
    </section>
  );
}
