"use client";

import { useWorkspaceStore } from "@/lib/workspace-store";
import type { DesignTokens } from "@/lib/workspace-types";
import type { CSSProperties } from "react";

function cssVars(tokens: DesignTokens) {
  const spacing =
    tokens.spacing === "compact" ? "0.65rem" : tokens.spacing === "spacious" ? "1.2rem" : "0.9rem";

  const shadow =
    tokens.shadow === "strong"
      ? "0 14px 32px rgba(15, 23, 42, 0.18)"
      : tokens.shadow === "medium"
      ? "0 8px 20px rgba(15, 23, 42, 0.12)"
      : "0 4px 12px rgba(15, 23, 42, 0.08)";

  return {
    "--color-primary": tokens.colors.primary,
    "--color-secondary": tokens.colors.secondary,
    "--color-accent": tokens.colors.accent,
    "--color-background": tokens.colors.background,
    "--color-surface": tokens.colors.surface,
    "--color-text": tokens.colors.text,
    "--color-muted": tokens.colors.muted,
    "--color-border": tokens.colors.border,
    "--radius-md": tokens.borderRadius,
    "--space-md": spacing,
    "--shadow-md": shadow,
  } as CSSProperties;
}

function SectionCard({ label }: { label: string }) {
  return (
    <article className="workspace-card rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-md)] shadow-[var(--shadow-md)]">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Section</p>
      <h4 className="mt-1 text-sm font-semibold text-[var(--color-text)]">{label}</h4>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Adaptive content block driven by live design tokens.
      </p>
      <button
        type="button"
        className="mt-3 rounded-[calc(var(--radius-md)-2px)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
      >
        Action
      </button>
    </article>
  );
}

export default function LivePreviewPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const setPreviewViewport = useWorkspaceStore((store) => store.setPreviewViewport);

  const isMobile = state.previewModel.viewport === "mobile";
  const navItems = state.designExtraction.navigation.items.length
    ? state.designExtraction.navigation.items.slice(0, isMobile ? 3 : 6)
    : ["Overview", "Dashboard", "Settings"];

  const sections = state.designExtraction.layout.sections.length
    ? state.designExtraction.layout.sections
    : [
        { type: "header", label: "Header", importance: "high" as const },
        { type: "content", label: "Main Content", importance: "medium" as const },
        { type: "cards", label: "Cards", importance: "medium" as const },
      ];

  const widthClass = isMobile ? "mx-auto max-w-[430px]" : "w-full";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-600">Instantly synced with tokens + preview model.</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPreviewViewport("desktop")}
            className={`rounded-full px-3 py-1 ${!isMobile ? "bg-white text-slate-900" : "text-slate-600"}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewViewport("mobile")}
            className={`rounded-full px-3 py-1 ${isMobile ? "bg-white text-slate-900" : "text-slate-600"}`}
          >
            Mobile
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-2">
        <div className={`${widthClass} rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-2`} style={cssVars(state.designTokens)}>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-md)] py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-text)]">{state.designExtraction.brand.name}</p>
                {state.previewModel.showLabels ? (
                  <span className="rounded-full bg-[var(--color-secondary)] px-2 py-1 text-[10px] font-semibold text-[var(--color-muted)]">
                    {state.previewModel.navStyle} nav
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-secondary)] px-3 py-1 text-xs text-[var(--color-text)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </nav>

            <section className="bg-[var(--color-surface)] px-[var(--space-md)] py-5">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{state.designExtraction.brand.tone}</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-text)]">{state.previewModel.heroTitle}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{state.previewModel.heroSubtitle}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white">
                  Primary
                </button>
                <button className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]">
                  Secondary
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-[var(--space-md)] bg-[var(--color-background)] p-[var(--space-md)] sm:grid-cols-2">
              {sections.map((section, index) => (
                <SectionCard key={`${section.type}-${index}`} label={section.label} />
              ))}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
