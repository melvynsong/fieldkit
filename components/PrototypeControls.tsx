"use client";

import type {
  EmphasisOverride,
  NavigationOverride,
  PreviewMode,
  PrototypeControlState,
} from "@/lib/generated-page";

interface PrototypeControlsProps {
  controls: PrototypeControlState;
  onChange: (next: PrototypeControlState) => void;
}

function SegmentedButton<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PrototypeControls({ controls, onChange }: PrototypeControlsProps) {
  function update<K extends keyof PrototypeControlState>(
    key: K,
    value: PrototypeControlState[K]
  ) {
    onChange({ ...controls, [key]: value });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <header className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Prototype Controls</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tune the generated page live without making additional extraction requests.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Preview Mode</p>
          <SegmentedButton<PreviewMode>
            value={controls.previewMode}
            onChange={(value) => update("previewMode", value)}
            options={[
              { label: "Desktop", value: "desktop" },
              { label: "Mobile", value: "mobile" },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Density</p>
          <SegmentedButton<PrototypeControlState["density"]>
            value={controls.density}
            onChange={(value) => update("density", value)}
            options={[
              { label: "Compact", value: "compact" },
              { label: "Comfortable", value: "comfortable" },
              { label: "Spacious", value: "spacious" },
            ]}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Navigation Override
          </label>
          <select
            value={controls.navigationOverride}
            onChange={(event) =>
              update("navigationOverride", event.target.value as NavigationOverride)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
          >
            <option value="auto">Auto</option>
            <option value="top-nav">Top Nav</option>
            <option value="side-nav">Side Nav</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Emphasis
          </label>
          <select
            value={controls.emphasis}
            onChange={(event) => update("emphasis", event.target.value as EmphasisOverride)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
          >
            <option value="auto">Auto</option>
            <option value="dashboard">Dashboard</option>
            <option value="transactional">Transactional</option>
            <option value="form-heavy">Form-Heavy</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Show Labels</p>
          <p className="text-xs text-slate-600">Toggle scaffolding labels on generated zones.</p>
        </div>
        <button
          type="button"
          onClick={() => update("showLabels", !controls.showLabels)}
          className={`inline-flex h-8 w-16 items-center rounded-full border transition ${
            controls.showLabels
              ? "border-slate-800 bg-slate-800"
              : "border-slate-300 bg-slate-200"
          }`}
          aria-pressed={controls.showLabels}
        >
          <span
            className={`mx-1 h-6 w-6 rounded-full bg-white transition ${
              controls.showLabels ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
