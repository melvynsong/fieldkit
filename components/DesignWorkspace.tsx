"use client";

import ChatRefiner from "@/components/ChatRefiner";
import DesignCuesPanel from "@/components/DesignCuesPanel";
import DesignUploader from "@/components/DesignUploader";
import PreviewCanvas from "@/components/PreviewCanvas";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { ReactNode } from "react";

function CollapsibleSection({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-slate-200 bg-white"
    >
      <summary className="cursor-pointer list-none px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </summary>
      <div className="border-t border-slate-200 p-3">{children}</div>
    </details>
  );
}

export default function DesignWorkspace() {
  const problemDiscovery = useWorkflowStore((state) => state.problemDiscovery);
  const solutionPlan = useWorkflowStore((state) => state.solutionPlan);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const selectedScreenId = useWorkflowStore((state) => state.selectedScreenId);
  const setSelectedScreenId = useWorkflowStore((state) => state.setSelectedScreenId);
  const generateScreens = useWorkflowStore((state) => state.generateScreens);
  const isGeneratingScreens = useWorkflowStore((state) => state.isGeneratingScreens);
  const design = useWorkflowStore((state) => state.designSystem);
  const canGenerateForStage3 = Boolean(problemDiscovery) && solutionPlan.status === "ready-for-generation";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Stage 2. Live Design Workspace</h2>
        <p className="mt-1 text-sm text-slate-600">
          Use Stage 1 screen intent as input, refine design controls, and preview updates live.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-3">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
              Planned Screens from Stage 1
            </p>
            <select
              value={selectedScreenId || solutionPlan.screens[0]?.id || ""}
              onChange={(event) => setSelectedScreenId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {solutionPlan.screens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.screenName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void generateScreens()}
              disabled={!canGenerateForStage3 || isGeneratingScreens}
              className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isGeneratingScreens ? "Generating..." : "Generate Screens For Stage 3"}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              {design
                ? "Using extracted design system."
                : "No design extracted yet. Generation will use a sensible default style."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Stage 3 readiness: Generated screens {generatedScreens?.screens.length || 0}
            </p>
            {!canGenerateForStage3 ? (
              <p className="mt-1 text-xs text-amber-700">
                Complete Stage 1 Solution Plan review first (status must be Ready for Generation).
              </p>
            ) : null}
          </section>

          <CollapsibleSection
            title="Design Inputs"
            description="Upload screenshots or links and extract design signals."
            defaultOpen
          >
            <DesignUploader />
          </CollapsibleSection>

          <CollapsibleSection
            title="Extracted Settings"
            description="Inspect tone, hierarchy, and navigation design cues."
            defaultOpen
          >
            <DesignCuesPanel />
          </CollapsibleSection>

          <CollapsibleSection
            title="AI Design Chat"
            description="Refine style and density using natural language."
            defaultOpen
          >
            <ChatRefiner />
          </CollapsibleSection>
        </aside>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <PreviewCanvas />
        </section>
      </div>
    </section>
  );
}
