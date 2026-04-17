"use client";

import { useEffect, useState } from "react";
import InteractiveScreenPreview from "@/components/InteractiveScreenPreview";
import ScreenListNavigator from "@/components/ScreenListNavigator";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function BuildWorkspace() {
  const initializeBuildWorkspace = useWorkflowStore((state) => state.initializeBuildWorkspace);
  const screens = useWorkflowStore((state) => state.buildScreens);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const setCurrentStage = useWorkflowStore((state) => state.setCurrentStage);
  const controls = useWorkflowStore((state) => state.buildDesignControls);
  const updateControls = useWorkflowStore((state) => state.updateBuildDesignControls);
  const applyControls = useWorkflowStore((state) => state.applyBuildDesignControls);
  const triggerBuildAction = useWorkflowStore((state) => state.triggerBuildAction);
  const buildUiState = useWorkflowStore((state) => state.buildUiState);
  const setBuildCurrentScreenIndex = useWorkflowStore((state) => state.setBuildCurrentScreenIndex);

  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [isPlayFlowRunning, setIsPlayFlowRunning] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

  useEffect(() => {
    initializeBuildWorkspace();
  }, [initializeBuildWorkspace]);

  // Auto-advance play flow
  useEffect(() => {
    if (!isPlayFlowRunning || !screens.length || currentIndex >= screens.length - 1) {
      if (currentIndex >= screens.length - 1) setIsPlayFlowRunning(false);
      return;
    }
    const t = window.setTimeout(() => setBuildCurrentScreenIndex(currentIndex + 1), 900);
    return () => window.clearTimeout(t);
  }, [isPlayFlowRunning, currentIndex, screens.length, setBuildCurrentScreenIndex]);

  const activeScreen = screens[currentIndex] ?? null;

  // ── empty state ─────────────────────────────────────────────────────────────
  if (!screens.length) {
    return (
      <section className="rounded-[10px] border border-gov-border bg-white p-8 text-center">
        <p className="text-sm font-semibold text-gov-navy">No screens to preview yet</p>
        <p className="mt-1 text-xs text-gov-muted">
          Generate screens in Stage 2 first.
          {generatedScreens?.screens.length
            ? ` (${generatedScreens.screens.length} generated — click below to go back)`
            : ""}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStage("design")}
          className="mt-4 rounded-[6px] bg-gov-navy px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A3F7E] transition"
        >
          ← Back to Stage 2
        </button>
      </section>
    );
  }

  // ── main ─────────────────────────────────────────────────────────────────────
  return (
    <section className="rounded-[10px] border border-gov-border bg-white overflow-hidden">

      {/* ── top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-gov-border px-5 py-3">
        <div className="flex items-center gap-3">
          {/* Prev */}
          <button
            type="button"
            onClick={() => setBuildCurrentScreenIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="rounded-[6px] border border-gov-border bg-white px-2.5 py-1.5 text-xs font-semibold text-gov-navy disabled:opacity-40 hover:bg-gov-navy-light transition"
          >
            ←
          </button>

          <p className="text-sm font-semibold text-gov-navy">
            {activeScreen?.screenName}
          </p>
          <p className="text-xs text-gov-muted">
            {currentIndex + 1} / {screens.length}
          </p>

          {/* Next */}
          <button
            type="button"
            onClick={() => setBuildCurrentScreenIndex(Math.min(screens.length - 1, currentIndex + 1))}
            disabled={currentIndex === screens.length - 1}
            className="rounded-[6px] border border-gov-border bg-white px-2.5 py-1.5 text-xs font-semibold text-gov-navy disabled:opacity-40 hover:bg-gov-navy-light transition"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex rounded-[6px] border border-gov-border overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={`px-3 py-1.5 transition ${
                deviceMode === "mobile"
                  ? "bg-gov-navy text-white"
                  : "bg-white text-gov-navy hover:bg-gov-navy-light"
              }`}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={`px-3 py-1.5 transition border-l border-gov-border ${
                deviceMode === "desktop"
                  ? "bg-gov-navy text-white"
                  : "bg-white text-gov-navy hover:bg-gov-navy-light"
              }`}
            >
              Desktop
            </button>
          </div>

          {/* Play flow */}
          <button
            type="button"
            onClick={() => {
              if (!isPlayFlowRunning) setBuildCurrentScreenIndex(0);
              setIsPlayFlowRunning((v) => !v);
            }}
            className={`rounded-[6px] border px-3 py-1.5 text-xs font-semibold transition ${
              isPlayFlowRunning
                ? "border-gov-red bg-gov-red text-white"
                : "border-gov-border bg-white text-gov-navy hover:bg-gov-navy-light"
            }`}
          >
            {isPlayFlowRunning ? "■ Stop" : "▶ Play Flow"}
          </button>

          {/* Style toggle */}
          <button
            type="button"
            onClick={() => setShowStylePanel((v) => !v)}
            className={`rounded-[6px] border px-3 py-1.5 text-xs font-semibold transition ${
              showStylePanel
                ? "border-gov-navy bg-gov-navy text-white"
                : "border-gov-border bg-white text-gov-navy hover:bg-gov-navy-light"
            }`}
          >
            Style
          </button>
        </div>
      </div>

      {/* ── style panel (collapsible) ────────────────────────────────────── */}
      {showStylePanel && (
        <div className="flex flex-wrap items-end gap-4 border-b border-gov-border bg-gov-page-bg px-5 py-3">
          {(
            [
              {
                label: "App Style",
                key: "appStyle" as const,
                options: ["transactional", "media", "hybrid"],
              },
              {
                label: "Tone",
                key: "tone" as const,
                options: ["professional", "playful", "premium", "friendly"],
              },
              {
                label: "Density",
                key: "density" as const,
                options: ["compact", "comfortable", "spacious"],
              },
            ] as const
          ).map(({ label, key, options }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gov-muted">
                {label}
              </span>
              <div className="flex gap-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateControls({ [key]: opt })}
                    className={`rounded-[6px] border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                      controls[key] === opt
                        ? "border-gov-navy bg-gov-navy text-white"
                        : "border-gov-border bg-white text-gov-navy hover:bg-gov-navy-light"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={applyControls}
            className="rounded-[6px] bg-gov-red px-4 py-2 text-xs font-semibold text-white hover:bg-[#a8222b] transition"
          >
            Apply
          </button>
        </div>
      )}

      {/* ── body: screen list + preview ─────────────────────────────────── */}
      <div className="flex min-h-[560px]">

        {/* Left: screen list */}
        <aside className="w-[180px] shrink-0 border-r border-gov-border bg-gov-page-bg p-3 overflow-y-auto">
          <ScreenListNavigator />
        </aside>

        {/* Centre: preview */}
        <main className="flex flex-1 flex-col items-center justify-center bg-[#F0F2F7] p-6 gap-4">
          {activeScreen ? (
            <div className={`w-full ${deviceMode === "mobile" ? "max-w-[390px]" : "max-w-2xl"}`}>
              <InteractiveScreenPreview
                screen={activeScreen}
                deviceMode={deviceMode}
                currentIndex={currentIndex}
                onNavigate={setBuildCurrentScreenIndex}
                onTriggerAction={triggerBuildAction}
                actionTargetOverrides={{}}
                edit={{}}
                uiState={buildUiState}
                showAnnotations={false}
              />
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
