import { ColorSet, DesignExtraction } from "@/lib/design-normalizer";

interface ExtractionPanelProps {
  design: DesignExtraction;
}

const COLOR_LABELS: (keyof ColorSet)[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
];

function ColorRow({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-7 w-7 shrink-0 rounded-md border border-slate-300 shadow-sm"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <span className="w-24 text-xs font-medium capitalize text-slate-700">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-500">{hex}</span>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: ColorSet }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {COLOR_LABELS.map((key) => (
          <ColorRow key={key} label={key} hex={colors[key]} />
        ))}
      </div>
    </div>
  );
}

export default function ExtractionPanel({ design }: ExtractionPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Design Extraction</h2>
        <p className="mt-1 text-sm text-slate-600">
          Structured output returned from the extraction API route.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
        <p>
          <span className="font-semibold">Likely purpose:</span>{" "}
          {design.contentHints.likelyPurpose}
        </p>
        <p>
          <span className="font-semibold">Navigation:</span> {design.navigation.type}
        </p>
        <p>
          <span className="font-semibold">Layout:</span> {design.layout.structure}
        </p>
        <p>
          <span className="font-semibold">Tone:</span> {design.brand.tone}
        </p>
      </div>

      {/* Color System */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Color System</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ColorGroup title="Observed Colors" colors={design.colors.observed} />
          <ColorGroup title="Recommended Colors" colors={design.colors.recommended} />
        </div>
      </div>

      <pre className="max-h-[22rem] overflow-auto rounded-xl border border-slate-300 bg-slate-900 p-4 text-xs leading-6 text-slate-100 sm:text-sm">
        <code>{JSON.stringify(design, null, 2)}</code>
      </pre>
    </section>
  );
}
