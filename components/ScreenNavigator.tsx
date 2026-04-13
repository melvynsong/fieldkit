"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ScreenNavigator() {
  const screens = useWorkflowStore((state) => state.buildScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const goNext = useWorkflowStore((state) => state.goToNextBuildScreen);
  const goBack = useWorkflowStore((state) => state.goToPreviousBuildScreen);
  const setCurrent = useWorkflowStore((state) => state.setBuildCurrentScreenIndex);

  if (!screens.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
          Screen Flow Navigator
        </p>
        <p className="text-xs text-slate-500">
          Screen {currentIndex + 1} of {screens.length}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex <= 0}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= screens.length - 1}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Next
        </button>

        <select
          value={currentIndex}
          onChange={(event) => setCurrent(Number(event.target.value))}
          className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs"
        >
          {screens.map((screen, index) => (
            <option key={screen.id} value={index}>
              {screen.screenName}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
