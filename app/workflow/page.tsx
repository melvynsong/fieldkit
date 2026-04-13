"use client";

import BuildIteratePlaceholder from "@/components/BuildIteratePlaceholder";
import DesignWorkspace from "@/components/DesignWorkspace";
import FieldKitHero from "@/components/FieldKitHero";
import ProblemDiscoveryStage from "@/components/ProblemDiscoveryStage";
import ScaleWorkspace from "@/components/ScaleWorkspace";
import StageNavigation from "@/components/StageNavigation";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { WorkflowStage } from "@/types";

function StagePanel({ stage }: { stage: WorkflowStage }) {
  if (stage === "problem-discovery") {
    return <ProblemDiscoveryStage />;
  }

  if (stage === "design") {
    return <DesignWorkspace />;
  }

  if (stage === "build-iterate") {
    return <BuildIteratePlaceholder />;
  }

  return <ScaleWorkspace />;
}

export default function WorkflowPage() {
  const currentStage = useWorkflowStore((state) => state.currentStage);
  const previousStage = useWorkflowStore((state) => state.previousStage);
  const nextStage = useWorkflowStore((state) => state.nextStage);
  const error = useWorkflowStore((state) => state.error);
  const stageOrder: WorkflowStage[] = [
    "problem-discovery",
    "design",
    "build-iterate",
    "scale",
  ];
  const stageIndex = stageOrder.indexOf(currentStage);
  const simpleStageFlow: Array<{ id: WorkflowStage; label: string }> = [
    { id: "problem-discovery", label: "Stage 1: Problem Discovery" },
    { id: "design", label: "Stage 2: Design" },
    { id: "build-iterate", label: "Stage 3: Build & Iterate" },
    { id: "scale", label: "Stage 4: Scale" },
  ];

  return (
    <main className="relative flex-1 bg-slate-100/60 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">FieldKit Product Workflow</h1>
          <p className="mt-1 text-sm text-slate-600">
            Problem Discovery -&gt; Design -&gt; Build &amp; Iterate -&gt; Scale
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {simpleStageFlow.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 font-semibold ${
                    currentStage === stage.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-600"
                  }`}
                >
                  {stage.label}
                </span>
                {index < simpleStageFlow.length - 1 ? <span className="text-slate-400">-&gt;</span> : null}
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <StageNavigation />
            <StagePanel stage={currentStage} />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={previousStage}
              disabled={stageIndex <= 0}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Previous Stage
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Stage {stageIndex + 1} of {stageOrder.length}
            </p>
            <button
              type="button"
              onClick={nextStage}
              disabled={stageIndex >= stageOrder.length - 1}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Next Stage
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
