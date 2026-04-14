"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function AdvancedEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <CopyButton value={value} />
      </summary>
      <div className="border-t border-slate-200 p-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          spellCheck={false}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800"
        />
      </div>
    </details>
  );
}

export default function DesignDirectionPanel() {
  const files = useWorkflowStore((state) => state.designFiles);
  const referenceUrls = useWorkflowStore((state) => state.referenceUrls);
  const isExtracting = useWorkflowStore((state) => state.isExtractingDesign);
  const setDesignFiles = useWorkflowStore((state) => state.setDesignFiles);
  const setReferenceUrls = useWorkflowStore((state) => state.setReferenceUrls);
  const extractDesign = useWorkflowStore((state) => state.extractDesign);
  const design = useWorkflowStore((state) => state.designSystem);
  const cues = useWorkflowStore((state) => state.activeDesignCues);
  const tone = useWorkflowStore((state) => state.designSystem?.tone || "hybrid");
  const density = useWorkflowStore((state) => state.designSystem?.density || "comfortable");
  const setDesignTone = useWorkflowStore((state) => state.setDesignTone);
  const setDesignDensity = useWorkflowStore((state) => state.setDesignDensity);
  const plannedScreens = useWorkflowStore((state) => state.solutionPlan.screens);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultCss = useMemo(() => {
    if (!design) {
      return ":root {\n  --fk-primary: #2c4d8f;\n  --fk-accent: #3b82f6;\n  --fk-surface: #ffffff;\n  --fk-bg: #f8fafc;\n  --fk-text: #0f172a;\n}\n";
    }

    return `:root {\n  --fk-primary: ${design.colors.primary};\n  --fk-secondary: ${design.colors.secondary};\n  --fk-accent: ${design.colors.accent};\n  --fk-surface: ${design.colors.surface};\n  --fk-bg: ${design.colors.background};\n  --fk-text: ${design.colors.text};\n  --fk-density: ${design.density};\n}`;
  }, [design]);

  const defaultPrompts = useMemo(() => {
    const screenList = plannedScreens.map((screen) => `- ${screen.screenName}: ${screen.userAction}`).join("\n");
    return [
      "Generate a polished product UI based on this direction:",
      `Tone: ${cues.tone}`,
      `Density: ${cues.density}`,
      `Typography: ${cues.typographyHierarchy}`,
      "Planned screens:",
      screenList || "- Core screen",
      "Keep hierarchy strong and action paths obvious.",
    ].join("\n");
  }, [cues, plannedScreens]);

  const defaultStandards = useMemo(
    () =>
      [
        "1. Keep layout rhythm consistent across all planned screens.",
        "2. Reserve accent color for primary actions and key states.",
        "3. Prioritize scannable headings and compact supporting text.",
        "4. Use clear card grouping and strong CTA hierarchy.",
      ].join("\n"),
    []
  );

  const [suggestedCss, setSuggestedCss] = useState(defaultCss);
  const [suggestedPrompts, setSuggestedPrompts] = useState(defaultPrompts);
  const [suggestedStandards, setSuggestedStandards] = useState(defaultStandards);

  useEffect(() => {
    setSuggestedCss(defaultCss);
  }, [defaultCss]);

  useEffect(() => {
    setSuggestedPrompts(defaultPrompts);
  }, [defaultPrompts]);

  const fileNames = useMemo(() => files.map((file) => file.name), [files]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Direction</h3>
          <p className="mt-1 text-sm text-slate-600">Extract style signals and shape generation controls in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {showAdvanced ? "Hide Advanced Controls" : "Show Advanced Controls"}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Reference Inputs</p>
        <label className="mt-2 block">
          <span className="text-xs font-semibold text-slate-700">Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setDesignFiles(Array.from(event.target.files || []))}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
          />
        </label>

        {fileNames.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fileNames.map((name) => (
              <span key={name} className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                {name}
              </span>
            ))}
          </div>
        ) : null}

        <label className="mt-3 block">
          <span className="text-xs font-semibold text-slate-700">Reference URLs</span>
          <textarea
            rows={2}
            value={referenceUrls}
            onChange={(event) => setReferenceUrls(event.target.value)}
            placeholder="Paste URLs separated by commas or lines"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={() => void extractDesign()}
          disabled={isExtracting}
          className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isExtracting ? "Extracting..." : "Extract Design Direction"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Style Controls</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={tone}
              onChange={(event) => setDesignTone(event.target.value as "transactional" | "media" | "hybrid")}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
            >
              <option value="transactional">transactional</option>
              <option value="media">media</option>
              <option value="hybrid">hybrid</option>
            </select>
            <select
              value={density}
              onChange={(event) => setDesignDensity(event.target.value as "compact" | "comfortable" | "spacious")}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
            >
              <option value="compact">compact</option>
              <option value="comfortable">comfortable</option>
              <option value="spacious">spacious</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Direction Summary</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">Tone: {cues.tone}</span>
            <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">Density: {cues.density}</span>
            <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">Navigation: {cues.navigationStyle}</span>
          </div>
        </div>
      </div>

      {showAdvanced ? (
        <div className="mt-3 space-y-2">
          <AdvancedEditor title="Suggested CSS" value={suggestedCss} onChange={setSuggestedCss} />
          <AdvancedEditor title="Suggested Design Prompts" value={suggestedPrompts} onChange={setSuggestedPrompts} />
          <AdvancedEditor
            title="Suggested Design Standards"
            value={suggestedStandards}
            onChange={setSuggestedStandards}
          />
        </div>
      ) : null}
    </section>
  );
}
