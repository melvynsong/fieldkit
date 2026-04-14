"use client";

import { useEffect, useState } from "react";
import InteractiveScreenPreview from "@/components/InteractiveScreenPreview";
import ScreenListNavigator from "@/components/ScreenListNavigator";
import DeviceModeSelector from "@/components/DeviceModeSelector";
import { BUILD_VERSION } from "@/lib/build-version";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildDesignControls } from "@/types";

function ControlRow<T extends keyof BuildDesignControls>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: BuildDesignControls[T];
  options: BuildDesignControls[T][];
  onChange: (next: BuildDesignControls[T]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                active
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BuildWorkspace() {
  const initializeBuildWorkspace = useWorkflowStore((state) => state.initializeBuildWorkspace);
  const screens = useWorkflowStore((state) => state.buildScreens);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const setCurrentStage = useWorkflowStore((state) => state.setCurrentStage);
  const controls = useWorkflowStore((state) => state.buildDesignControls);
  const tokens = useWorkflowStore((state) => state.buildDesignTokens);
  const updateControls = useWorkflowStore((state) => state.updateBuildDesignControls);
  const applyControls = useWorkflowStore((state) => state.applyBuildDesignControls);
  const resetControls = useWorkflowStore((state) => state.resetBuildDesignControls);

  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    initializeBuildWorkspace();
  }, [initializeBuildWorkspace]);

  const activeScreen = screens[currentIndex] || null;

  if (!screens.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stage 3. Build & Iterate</h2>
            <p className="mt-1 text-sm text-slate-600">Transform your design into an interactive prototype.</p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Build {BUILD_VERSION}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Generate screens in Stage 2 first. Stage 3 turns your design system and planned screens into a realistic, fully interactive product simulation where users can navigate, interact, and refine screens in real-time using AI.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Readiness: Generated screens {generatedScreens?.screens.length || 0} / Build screens {screens.length}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStage("design")}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go To Stage 2 (Design)
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Stage 3. Build & Iterate
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Interactive prototype • Screen {currentIndex + 1} of {screens.length}
            </p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Build {BUILD_VERSION}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-0 lg:grid-cols-[300px_1fr_380px]">
        {/* LEFT: Screen Navigator */}
        <aside className="border-r border-slate-200 bg-slate-50 p-4">
          <ScreenListNavigator />
        </aside>

        {/* CENTER: Interactive Preview */}
        <main className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 min-h-[600px] lg:min-h-[700px]">
          {activeScreen ? (
            <div className="w-full max-w-2xl">
              <InteractiveScreenPreview
                screen={activeScreen}
                deviceMode={deviceMode}
              />
            </div>
          ) : null}

          {/* Device Mode Selector Below Preview */}
          <div className="mt-6 w-full max-w-md">
            <DeviceModeSelector
              value={deviceMode}
              onChange={setDeviceMode}
              supports={{ mobile: true, desktop: true }}
            />
          </div>
        </main>

        {/* RIGHT: Controls Panel */}
        <aside className="border-l border-slate-200 bg-white p-4 space-y-4 overflow-y-auto max-h-[700px]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
              Design Controls
            </h3>
            <p className="text-xs text-slate-600">
              Refine prototype styling and interaction behavior.
            </p>

            <div className="space-y-3">
              <ControlRow<"appStyle">
                label="App Style"
                value={controls.appStyle}
                options={["transactional", "media", "hybrid"]}
                onChange={(appStyle) => updateControls({ appStyle })}
              />

              <ControlRow<"tone">
                label="Tone"
                value={controls.tone}
                options={["professional", "playful", "premium", "friendly"]}
                onChange={(tone) => updateControls({ tone })}
              />

              <ControlRow<"density">
                label="Density"
                value={controls.density}
                options={["compact", "comfortable", "spacious"]}
                onChange={(density) => updateControls({ density })}
              />

              <ControlRow<"emphasis">
                label="Emphasis"
                value={controls.emphasis}
                options={["content", "actions", "balanced"]}
                onChange={(emphasis) => updateControls({ emphasis })}
              />

              <ControlRow<"visualWeight">
                label="Visual Weight"
                value={controls.visualWeight}
                options={["light", "balanced", "bold"]}
                onChange={(visualWeight) => updateControls({ visualWeight })}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyControls}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={resetControls}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.08em]">
                Active Tokens
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {tokens.typographyPreset} • {tokens.layoutRhythm} • {tokens.hierarchy}
              </p>
            </div>
          </div>

          {/* Advanced Options */}
          <details className="group">
            <summary className="cursor-pointer select-none rounded-lg bg-slate-50 px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-100">
              <span className="text-sm uppercase tracking-[0.08em]">
                ⚙️ Advanced Options
              </span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-600">
                Access flow diagrams, inline editing, and export options.
              </p>
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Show Flow Diagram
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Enable Inline Editing
              </button>
            </div>
          </details>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-3">
            <p className="text-xs font-semibold text-blue-900">💡 Tip</p>
            <p className="mt-1 text-xs text-blue-700">
              Use the toggle in each screen to show design annotations. Use AI Assistant dock to refine screens.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
