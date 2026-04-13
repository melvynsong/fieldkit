"use client";

import { useEffect } from "react";
import AIChatPanel from "@/components/AIChatPanel";
import InteractiveScreen from "@/components/InteractiveScreen";
import ScreenNavigator from "@/components/ScreenNavigator";
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
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const controls = useWorkflowStore((state) => state.buildDesignControls);
  const tokens = useWorkflowStore((state) => state.buildDesignTokens);
  const updateControls = useWorkflowStore((state) => state.updateBuildDesignControls);
  const applyControls = useWorkflowStore((state) => state.applyBuildDesignControls);
  const resetControls = useWorkflowStore((state) => state.resetBuildDesignControls);

  useEffect(() => {
    initializeBuildWorkspace();
  }, [initializeBuildWorkspace]);

  const activeScreen = screens[currentIndex] || null;

  if (!screens.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">Stage 3. Build & Iterate</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Generate screens in Stage 2 first. Stage 3 turns generated outputs into a realistic, interactive product simulation.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Stage 3. Build & Iterate</h2>
        <p className="mt-1 text-sm text-slate-600">
          Simulate a realistic product flow with real content, interactive actions, and AI-assisted iteration.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Controls</h3>
            <p className="mt-1 text-xs text-slate-600">Reuse Stage 2 style controls and apply to this high-fidelity prototype layer.</p>

            <div className="mt-4 space-y-4">
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

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={applyControls}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Apply Controls
              </button>
              <button
                type="button"
                onClick={resetControls}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Active tokens: {tokens.typographyPreset}, {tokens.layoutRhythm}, {tokens.hierarchy}
            </p>
          </section>

          <AIChatPanel />
        </aside>

        <section className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <ScreenNavigator />
          {activeScreen ? <InteractiveScreen screen={activeScreen} /> : null}
        </section>
      </div>
    </section>
  );
}
