"use client";

import BuildWorkspace from "@/components/BuildWorkspace";
import DesignWorkspace from "@/components/DesignWorkspace";
import FieldKitHero from "@/components/FieldKitHero";
import ProblemDiscoveryStage from "@/components/ProblemDiscoveryStage";
import ScaleWorkspace from "@/components/ScaleWorkspace";
import StageAssistantDock from "@/components/StageAssistantDock";
import StageNavigation from "@/components/StageNavigation";
import { BUILD_VERSION } from "@/lib/build-version";
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
    return <BuildWorkspace />;
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

  return (
    <main className="relative flex-1 bg-gov-page-bg px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-[10px] border border-gov-border bg-white p-5 shadow-[0_2px_12px_rgba(26,44,91,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-gov-navy sm:text-2xl">FieldKit Product Workflow</h1>
            <span className="font-mono rounded-full border border-gov-border bg-gov-page-bg px-2.5 py-1 text-[11px] font-medium text-gov-muted">
              Build {BUILD_VERSION}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            <StageNavigation />
            <StagePanel stage={currentStage} />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-[8px] border border-gov-border bg-gov-page-bg px-4 py-3">
            <button
              type="button"
              onClick={previousStage}
              disabled={stageIndex <= 0}
              className="rounded-[6px] border border-gov-border bg-white px-3 py-1.5 text-sm font-semibold text-gov-navy disabled:opacity-40"
            >
              Previous Stage
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gov-muted">
              Stage {stageIndex + 1} of {stageOrder.length}
            </p>
            <button
              type="button"
              onClick={nextStage}
              disabled={stageIndex >= stageOrder.length - 1}
              className="rounded-[6px] bg-gov-navy px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next Stage
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-[6px] border border-gov-red-border bg-gov-red-light px-3 py-2 text-sm text-gov-red">
              {error}
            </p>
          ) : null}
        </section>
      </div>
      <StageAssistantDock />
    </main>
  );
}
