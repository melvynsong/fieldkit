"use client";

import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildScreen, BuildDesignTokens } from "@/types";

function spacingClass(tokens: BuildDesignTokens): string {
  if (tokens.spacingScale === "tight") return "space-y-2";
  if (tokens.spacingScale === "airy") return "space-y-5";
  return "space-y-3";
}

function typographyClass(tokens: BuildDesignTokens): string {
  if (tokens.typographyPreset === "luxury") return "tracking-wide";
  if (tokens.typographyPreset === "expressive") return "tracking-normal";
  return "tracking-tight";
}

function headingWeight(tokens: BuildDesignTokens): string {
  if (tokens.weight === "bold") return "font-bold";
  if (tokens.weight === "light") return "font-medium";
  return "font-semibold";
}

function sectionGrid(tokens: BuildDesignTokens): string {
  if (tokens.hierarchy === "content-led") return "grid-cols-1";
  if (tokens.hierarchy === "action-led") return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2";
}

export default function InteractiveScreen({ screen }: { screen: BuildScreen }) {
  const design = useWorkflowStore((state) => state.designSystem);
  const tokens = useWorkflowStore((state) => state.buildDesignTokens);
  const uiState = useWorkflowStore((state) => state.buildUiState);
  const triggerBuildAction = useWorkflowStore((state) => state.triggerBuildAction);

  if (!design) {
    return null;
  }

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${spacingClass(tokens)}`}
      style={{ borderColor: design.colors.secondary, backgroundColor: design.colors.surface }}
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={`text-2xl text-slate-900 ${headingWeight(tokens)} ${typographyClass(tokens)}`}>
            {screen.title}
          </h3>
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: design.colors.primary, color: design.colors.primary }}
          >
            {screen.screenName}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-700">{screen.subtitle}</p>
        <p className="text-sm leading-6 text-slate-600">{screen.description}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {screen.chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border px-2.5 py-1 text-xs"
            style={{ borderColor: design.colors.secondary, backgroundColor: `${design.colors.background}` }}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className={`grid gap-3 ${sectionGrid(tokens)}`}>
        {screen.sections.map((section) => (
          <section key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className={`text-sm text-slate-900 ${headingWeight(tokens)}`}>{section.heading}</p>
            <p className="mt-1 text-sm text-slate-600">{section.body}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {section.fieldPlaceholder ? (
              <label className="mt-3 block text-xs text-slate-500">
                {section.fieldLabel || "Input"}
                <input
                  readOnly
                  value={section.fieldPlaceholder}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-500"
                />
              </label>
            ) : null}
          </section>
        ))}
      </div>

      <footer className="flex flex-wrap items-center gap-2">
        {screen.secondaryActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => triggerBuildAction(action)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {action.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => triggerBuildAction(screen.primaryAction)}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: design.colors.primary }}
        >
          {screen.primaryAction.label}
        </button>

        {uiState.confirmationComplete ? (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
            Flow confirmed
          </span>
        ) : null}
      </footer>
    </article>
  );
}
