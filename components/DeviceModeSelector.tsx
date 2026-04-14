"use client";

interface DeviceModeSelectorProps {
  value: "mobile" | "desktop";
  onChange: (mode: "mobile" | "desktop") => void;
  supports?: {
    mobile: boolean;
    desktop: boolean;
  };
}

export default function DeviceModeSelector({
  value,
  onChange,
  supports = { mobile: true, desktop: true },
}: DeviceModeSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
        View Mode
      </h3>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("mobile")}
          disabled={!supports.mobile}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            value === "mobile"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          📱 Mobile
        </button>
        <button
          type="button"
          onClick={() => onChange("desktop")}
          disabled={!supports.desktop}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            value === "desktop"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          🖥️ Desktop
        </button>
      </div>
    </div>
  );
}
