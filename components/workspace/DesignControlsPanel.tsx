"use client";

import { useWorkspaceStore } from "@/lib/workspace-store";
import type { DesignControls } from "@/lib/workspace-types";
import { useEffect, useState } from "react";

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
  const storeControls = useWorkspaceStore((store) => store.state.designControls);
  const updateDesignControls = useWorkspaceStore((store) => store.updateDesignControls);
  const showGuidance = useWorkspaceStore((store) => store.showGuidance);

  const [pending, setPending] = useState<DesignControls>(storeControls);
  const [hasPending, setHasPending] = useState(false);

  // Sync pending state when store controls change externally (e.g. after extraction)
  useEffect(() => {
    setPending(storeControls);
    setHasPending(false);
  }, [storeControls]);

  function updatePending<K extends keyof DesignControls>(key: K, value: DesignControls[K]) {
    setPending((prev) => {
      const next = { ...prev, [key]: value };
      setHasPending(true);
      return next;
    });
  }

  function applyControls() {
    updateDesignControls(pending);
    setHasPending(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Controls</h2>
          {showGuidance ? (
            <p className="mt-1 text-sm text-slate-600">
              Select style properties below, then click <strong>Apply Controls</strong> to update the design tokens, preview, and prompt kit.
            </p>
          ) : null}
        </div>

        {hasPending ? (
          <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Pending
          </span>
        ) : null}
      </header>

      <div className="space-y-4">
        <ControlRow<"appStyle">
          label="App Style"
          value={pending.appStyle}
          options={["transactional", "media", "hybrid"]}
          onChange={(appStyle) => updatePending("appStyle", appStyle)}
        />

        <ControlRow<"tone">
          label="Tone"
          value={pending.tone}
          options={["professional", "playful", "premium", "friendly"]}
          onChange={(tone) => updatePending("tone", tone)}
        />

        <ControlRow<"density">
          label="Density"
          value={pending.density}
          options={["compact", "comfortable", "spacious"]}
          onChange={(density) => updatePending("density", density)}
        />

        <ControlRow<"emphasis">
          label="Emphasis"
          value={pending.emphasis}
          options={["content", "actions", "balanced"]}
          onChange={(emphasis) => updatePending("emphasis", emphasis)}
        />

        <ControlRow<"visualWeight">
          label="Visual Weight"
          value={pending.visualWeight}
          options={["light", "balanced", "bold"]}
          onChange={(visualWeight) => updatePending("visualWeight", visualWeight)}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={applyControls}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Apply Controls
        </button>
        {hasPending ? (
          <span className="text-xs text-slate-500">Changes staged — click Apply to activate.</span>
        ) : (
          <span className="text-xs text-slate-400">Controls up to date.</span>
        )}
      </div>
    </section>
  );
}
