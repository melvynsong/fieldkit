"use client";

import { useMemo } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function DesignUploader() {
  const files = useWorkflowStore((state) => state.designFiles);
  const referenceUrls = useWorkflowStore((state) => state.referenceUrls);
  const isExtracting = useWorkflowStore((state) => state.isExtractingDesign);
  const setDesignFiles = useWorkflowStore((state) => state.setDesignFiles);
  const setReferenceUrls = useWorkflowStore((state) => state.setReferenceUrls);
  const extractDesign = useWorkflowStore((state) => state.extractDesign);

  const fileNames = useMemo(() => files.map((file) => file.name), [files]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
        3. Design Extraction
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload one or more references, or paste reference URLs.
      </p>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-800">Reference Images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setDesignFiles(Array.from(event.target.files || []))}
          className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-sm"
        />
      </label>

      {fileNames.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {fileNames.map((name) => (
            <span key={name} className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-800">Reference URLs</span>
        <textarea
          rows={3}
          value={referenceUrls}
          onChange={(event) => setReferenceUrls(event.target.value)}
          placeholder="Paste URLs separated by commas or new lines"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="button"
        onClick={() => void extractDesign()}
        disabled={isExtracting}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isExtracting ? "Extracting..." : "Extract Design System"}
      </button>
    </section>
  );
}
