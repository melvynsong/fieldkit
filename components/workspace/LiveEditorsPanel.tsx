"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/lib/workspace-store";

function EditorBlock({
  title,
  value,
  onApply,
  placeholder,
  hint,
}: {
  title: string;
  value: string;
  onApply: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  // Sync when the external value changes (e.g. from extraction or controls apply)
  useEffect(() => {
    setDraft(value);
    setIsDirty(false);
  }, [value]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={() => {
            onApply(draft);
            setIsDirty(false);
          }}
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
            isDirty
              ? "border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          Apply
        </button>
      </div>
      {hint ? <p className="mb-2 text-[11px] text-slate-500">{hint}</p> : null}
      <textarea
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setIsDirty(true);
        }}
        placeholder={placeholder}
        spellCheck={false}
        className="h-56 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
      />
    </article>
  );
}

export default function LiveEditorsPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const showGuidance = useWorkspaceStore((store) => store.showGuidance);
  const applyExtractionRaw = useWorkspaceStore((store) => store.applyExtractionRaw);
  const applyDesignTokensRaw = useWorkspaceStore((store) => store.applyDesignTokensRaw);
  const applyPromptKitRaw = useWorkspaceStore((store) => store.applyPromptKitRaw);
  const setError = useWorkspaceStore((store) => store.setError);

  return (
    <section className="space-y-4">
      {showGuidance ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Edit the extracted data, prompts, or tokens below. Click <strong>Apply</strong> in each block to push changes to the preview.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <EditorBlock
          title="Design Extraction (JSON)"
          value={state.extractionRawJson}
          hint={showGuidance ? "AI-extracted design data. Editing this regenerates tokens and prompts." : undefined}
          onApply={(next) => {
            const ok = applyExtractionRaw(next);
            if (!ok) setError("Invalid design extraction JSON.");
            else setError(null);
          }}
        />

        <EditorBlock
          title="Prompt Kit (Text)"
          value={state.promptKitRawText}
          hint={showGuidance ? "Structured prompts built from your design. Used for AI generation." : undefined}
          onApply={(next) => {
            applyPromptKitRaw(next);
            setError(null);
          }}
          placeholder="[Product Prompt]\n..."
        />

        <EditorBlock
          title="Design Tokens (JSON / CSS vars source)"
          value={state.designTokensRawJson}
          hint={showGuidance ? "Token values that drive the live preview CSS variables." : undefined}
          onApply={(next) => {
            const ok = applyDesignTokensRaw(next);
            if (!ok) setError("Invalid design tokens JSON.");
            else setError(null);
          }}
        />
      </div>

      {state.errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.errorMessage}
        </p>
      ) : null}
    </section>
  );
}
