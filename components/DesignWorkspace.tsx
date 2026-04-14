"use client";

import DesignDirectionPanel from "@/components/DesignDirectionPanel";
import PreviewCanvas from "@/components/PreviewCanvas";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function DesignWorkspace() {
  const problemDiscovery = useWorkflowStore((state) => state.problemDiscovery);
  const solutionPlan = useWorkflowStore((state) => state.solutionPlan);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const selectedScreenId = useWorkflowStore((state) => state.selectedScreenId);
  const setSelectedScreenId = useWorkflowStore((state) => state.setSelectedScreenId);
  const generateScreens = useWorkflowStore((state) => state.generateScreens);
  const isGeneratingScreens = useWorkflowStore((state) => state.isGeneratingScreens);
  const canGenerateForStage3 = Boolean(problemDiscovery) && solutionPlan.status === "ready-for-generation";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Stage 2. Design Workspace</h2>
        <p className="mt-1 text-sm text-slate-600">Review planned screens, shape design direction, and preview realistic UI outputs.</p>
      </header>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Planned Screens from Stage 1</p>
          <button
            type="button"
            onClick={() => void generateScreens()}
            disabled={!canGenerateForStage3 || isGeneratingScreens}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isGeneratingScreens ? "Generating..." : "Generate Screens For Stage 3"}
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {solutionPlan.screens.map((screen) => {
            const active = (selectedScreenId || solutionPlan.screens[0]?.id) === screen.id;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setSelectedScreenId(screen.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-slate-900 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{screen.screenName}</p>
                <p className="mt-1 text-xs text-slate-600">{screen.userAction}</p>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-slate-500">Stage 3 readiness: Generated screens {generatedScreens?.screens.length || 0}</p>
        {!canGenerateForStage3 ? (
          <p className="mt-1 text-xs text-amber-700">Complete Stage 1 solution plan review before generating screens.</p>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          <DesignDirectionPanel />
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <PreviewCanvas />
        </section>
      </div>
    </section>
  );
}
