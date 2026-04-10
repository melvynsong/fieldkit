import { DesignExtraction } from "@/lib/design-normalizer";

interface ExtractionPanelProps {
  design: DesignExtraction;
}

export default function ExtractionPanel({ design }: ExtractionPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Design Extraction</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Structured output returned from the extraction API route.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 sm:grid-cols-2">
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

      <pre className="max-h-[22rem] overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-xs leading-6 text-zinc-100 sm:text-sm">
        <code>{JSON.stringify(design, null, 2)}</code>
      </pre>
    </section>
  );
}
