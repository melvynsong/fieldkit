import { mockDesign } from "@/lib/mockDesign";

export default function ExtractionPanel() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Mock Design Extraction</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Hardcoded JSON preview for the MVP demo.
        </p>
      </div>

      <pre className="max-h-[22rem] overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-xs leading-6 text-zinc-100 sm:text-sm">
        <code>{JSON.stringify(mockDesign, null, 2)}</code>
      </pre>
    </section>
  );
}
