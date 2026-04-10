"use client";

import { useState } from "react";
import type { DesignExtraction } from "@/lib/design-normalizer";
import { buildPromptKit } from "@/lib/prompt-kit";

interface PromptKitPanelProps {
  design: DesignExtraction;
}

type PromptKey = "product" | "page" | "designSystem";

function PromptCard({
  title,
  value,
  copied,
  onCopy,
}: {
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-700 sm:text-sm">
        <code>{value}</code>
      </pre>
    </article>
  );
}

export default function PromptKitPanel({ design }: PromptKitPanelProps) {
  const promptKit = buildPromptKit(design);
  const [copiedKey, setCopiedKey] = useState<PromptKey | null>(null);

  async function handleCopy(key: PromptKey, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1200);
    } catch {
      setCopiedKey(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Prompt Kit</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reusable prompts derived from extracted design JSON for future prototyping.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PromptCard
          title="Product / Experience Prompt"
          value={promptKit.productPrompt}
          copied={copiedKey === "product"}
          onCopy={() => handleCopy("product", promptKit.productPrompt)}
        />
        <PromptCard
          title="Page Generation Prompt"
          value={promptKit.pagePrompt}
          copied={copiedKey === "page"}
          onCopy={() => handleCopy("page", promptKit.pagePrompt)}
        />
        <PromptCard
          title="Design System Prompt"
          value={promptKit.designSystemPrompt}
          copied={copiedKey === "designSystem"}
          onCopy={() => handleCopy("designSystem", promptKit.designSystemPrompt)}
        />
      </div>
    </section>
  );
}
