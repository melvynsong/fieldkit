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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="grid gap-2 lg:grid-cols-4">
        {STAGES.map((stage, index) => {
          const isActive = stage.id === currentStage;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setCurrentStage(stage.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <p className={`text-[11px] uppercase tracking-[0.14em] ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                Stage {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold">{stage.title}</p>
              <p className={`mt-1 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                {stage.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
