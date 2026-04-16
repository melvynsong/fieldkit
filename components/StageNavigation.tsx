"use client";

import { useWorkflowStore } from "@/lib/workflowStore";
import type { WorkflowStage } from "@/types";

interface StageItem {
  id: WorkflowStage;
  title: string;
  subtitle: string;
}

const STAGES: StageItem[] = [
  {
    id: "problem-discovery",
    title: "Problem Discovery",
    subtitle: "Define problem, solution, and screen intent",
  },
  {
    id: "design",
    title: "Design",
    subtitle: "Shape controls and live previews",
  },
  {
    id: "build-iterate",
    title: "Build & Iterate",
    subtitle: "Implementation workflows coming next",
  },
  {
    id: "scale",
    title: "Scale",
    subtitle: "Convert work into delivery artifacts",
  },
];

export default function StageNavigation() {
  const currentStage = useWorkflowStore((state) => state.currentStage);
  const setCurrentStage = useWorkflowStore((state) => state.setCurrentStage);

  return (
    <div className="grid gap-2 lg:grid-cols-4">
      {STAGES.map((stage, index) => {
        const isActive = stage.id === currentStage;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => setCurrentStage(stage.id)}
            className={`relative overflow-hidden rounded-[8px] border px-4 py-3 text-left transition ${
              isActive
                ? "border-gov-navy bg-gov-navy text-white"
                : "border-gov-border bg-white text-gov-navy hover:bg-gov-navy-light"
            }`}
          >
            {isActive && (
              <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gov-red" />
            )}
            <p className={`text-[11px] uppercase tracking-[0.14em] ${isActive ? "text-gov-navy-muted" : "text-gov-muted"}`}>
              Stage {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold">{stage.title}</p>
            <p className={`mt-1 text-xs ${isActive ? "text-gov-navy-muted" : "text-gov-muted"}`}>
              {stage.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
}
