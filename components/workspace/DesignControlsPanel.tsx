"use client";

import { useWorkspaceStore } from "@/lib/workspace-store";
import type { DesignControls } from "@/lib/workspace-types";

function ControlRow<T extends keyof DesignControls>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: DesignControls[T];
  options: DesignControls[T][];
  onChange: (next: DesignControls[T]) => void;
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

export default function DesignControlsPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const updateDesignControls = useWorkspaceStore((store) => store.updateDesignControls);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Controls</h2>
        <p className="mt-1 text-sm text-slate-600">
          Formal control layer that drives token and preview behavior.
        </p>
      </header>

      <div className="space-y-4">
        <ControlRow<"appStyle">
          label="App Style"
          value={state.designControls.appStyle}
          options={["transactional", "media", "hybrid"]}
          onChange={(appStyle) => updateDesignControls({ appStyle })}
        />

        <ControlRow<"tone">
          label="Tone"
          value={state.designControls.tone}
          options={["professional", "playful", "premium", "friendly"]}
          onChange={(tone) => updateDesignControls({ tone })}
        />

        <ControlRow<"density">
          label="Density"
          value={state.designControls.density}
          options={["compact", "comfortable", "spacious"]}
          onChange={(density) => updateDesignControls({ density })}
        />

        <ControlRow<"emphasis">
          label="Emphasis"
          value={state.designControls.emphasis}
          options={["content", "actions", "balanced"]}
          onChange={(emphasis) => updateDesignControls({ emphasis })}
        />

        <ControlRow<"visualWeight">
          label="Visual Weight"
          value={state.designControls.visualWeight}
          options={["light", "balanced", "bold"]}
          onChange={(visualWeight) => updateDesignControls({ visualWeight })}
        />
      </div>
    </section>
  );
}
