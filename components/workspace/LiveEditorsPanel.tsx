"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/lib/workspace-store";

function EditorBlock({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-[11px] font-medium text-slate-500">Live Sync</span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="h-56 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
      />
    </article>
  );
}

export default function LiveEditorsPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const applyExtractionRaw = useWorkspaceStore((store) => store.applyExtractionRaw);
  const applyDesignTokensRaw = useWorkspaceStore((store) => store.applyDesignTokensRaw);
  const applyPromptKitRaw = useWorkspaceStore((store) => store.applyPromptKitRaw);
  const setError = useWorkspaceStore((store) => store.setError);

  const [extractionRaw, setExtractionRaw] = useState(state.extractionRawJson);
  const [tokensRaw, setTokensRaw] = useState(state.designTokensRawJson);
  const [promptRaw, setPromptRaw] = useState(state.promptKitRawText);

  useEffect(() => {
    setExtractionRaw(state.extractionRawJson);
  }, [state.extractionRawJson]);

  useEffect(() => {
    setTokensRaw(state.designTokensRawJson);
  }, [state.designTokensRawJson]);

  useEffect(() => {
    setPromptRaw(state.promptKitRawText);
  }, [state.promptKitRawText]);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <EditorBlock
          title="Design Extraction (JSON)"
          value={extractionRaw}
          onChange={(next) => {
            setExtractionRaw(next);
            const ok = applyExtractionRaw(next);
            if (!ok) setError("Invalid design extraction JSON.");
            else setError(null);
          }}
        />

        <EditorBlock
          title="Prompt Kit (Text)"
          value={promptRaw}
          onChange={(next) => {
            setPromptRaw(next);
            applyPromptKitRaw(next);
            setError(null);
          }}
          placeholder="[Product Prompt]\n..."
        />

        <EditorBlock
          title="Design Tokens (JSON / CSS vars source)"
          value={tokensRaw}
          onChange={(next) => {
            setTokensRaw(next);
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
