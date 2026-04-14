"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ScreenListNavigator() {
  const screens = useWorkflowStore((state) => state.buildScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const setCurrent = useWorkflowStore((state) => state.setBuildCurrentScreenIndex);

  if (!screens.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
          Screens ({screens.length})
        </h3>
      </div>

      <div className="space-y-1.5">
        {screens.map((screen, index) => (
          <button
            key={screen.id}
            type="button"
            onClick={() => setCurrent(index)}
            className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
              index === currentIndex
                ? "border-blue-500 border bg-blue-50 font-semibold text-blue-900 shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{screen.screenName}</span>
              <span
                className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  index === currentIndex
                    ? "bg-blue-200 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {index + 1}
              </span>
            </div>
            {screen.subtitle && (
              <p
                className={`mt-1 truncate text-xs ${
                  index === currentIndex ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {screen.subtitle}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Navigation Summary */}
      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <p>
          Screen <span className="font-semibold">{currentIndex + 1}</span> of{" "}
          <span className="font-semibold">{screens.length}</span>
        </p>
      </div>
    </div>
  );
}
