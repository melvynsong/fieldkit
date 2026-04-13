"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function SolutionPlanEditor() {
  const plan = useWorkflowStore((state) => state.solutionPlan);
  const generationReady = useWorkflowStore((state) => state.generationReady);
  const setSolutionText = useWorkflowStore((state) => state.setSolutionText);
  const setPlannedScreenCount = useWorkflowStore((state) => state.setPlannedScreenCount);
  const updatePlannedScreen = useWorkflowStore((state) => state.updatePlannedScreen);
  const addPlannedScreen = useWorkflowStore((state) => state.addPlannedScreen);
  const removePlannedScreen = useWorkflowStore((state) => state.removePlannedScreen);
  const movePlannedScreen = useWorkflowStore((state) => state.movePlannedScreen);

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Solution Plan (Review Before Design)
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            plan.status === "ready-for-generation"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-amber-300 bg-amber-50 text-amber-700"
          }`}
        >
          {plan.status === "ready-for-generation"
            ? "Ready for Generation"
            : "Needs Refinement"}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">a. Solution</p>
          <textarea
            rows={4}
            value={plan.solution}
            onChange={(event) => setSolutionText(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">b. Number of Screens</p>
          <input
            type="number"
            min={1}
            value={plan.numberOfScreens}
            onChange={(event) => setPlannedScreenCount(Number(event.target.value || 1))}
            className="mt-2 w-28 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm"
          />
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              c. Screen Responsibilities
            </p>
            <button
              type="button"
              onClick={addPlannedScreen}
              className="rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              Add Screen
            </button>
          </div>

          <div className="space-y-3">
            {plan.screens.map((screen, index) => (
              <article key={screen.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">Screen {index + 1}</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => movePlannedScreen(screen.id, "up")}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px]"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => movePlannedScreen(screen.id, "down")}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px]"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlannedScreen(screen.id)}
                      className="rounded border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <label className="block text-xs text-slate-600">
                  Screen Name
                  <input
                    value={screen.screenName}
                    onChange={(event) =>
                      updatePlannedScreen(screen.id, { screenName: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>

                <label className="mt-2 block text-xs text-slate-600">
                  User Action
                  <input
                    value={screen.userAction}
                    onChange={(event) =>
                      updatePlannedScreen(screen.id, { userAction: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>

                <label className="mt-2 block text-xs text-slate-600">
                  Purpose
                  <textarea
                    rows={2}
                    value={screen.problemResolution}
                    onChange={(event) =>
                      updatePlannedScreen(screen.id, { problemResolution: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
              </article>
            ))}
          </div>
        </article>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Generation gate: solution + at least one valid screen + extracted design.
        {generationReady ? " Ready." : " Not ready yet."}
      </p>
    </section>
  );
}
