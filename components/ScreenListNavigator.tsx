"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ScreenListNavigator() {
  const screens = useWorkflowStore((state) => state.buildScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const setCurrent = useWorkflowStore((state) => state.setBuildCurrentScreenIndex);

  if (!screens.length) return null;

  return (
    <div className="space-y-1">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gov-muted">
        Screens ({screens.length})
      </p>
      {screens.map((screen, index) => (
        <button
          key={screen.id}
          type="button"
          onClick={() => setCurrent(index)}
          className={`w-full rounded-[6px] border px-2.5 py-2 text-left transition ${
            index === currentIndex
              ? "border-gov-navy bg-gov-navy text-white"
              : "border-gov-border bg-white text-gov-navy hover:bg-gov-navy-light"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold shrink-0 ${
                index === currentIndex ? "text-gov-navy-muted" : "text-gov-muted"
              }`}
            >
              {index + 1}
            </span>
            <span className="truncate text-[11px] font-semibold">{screen.screenName}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
