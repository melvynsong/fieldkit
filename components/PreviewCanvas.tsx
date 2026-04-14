"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

type PreviewViewport = "mobile" | "desktop";

function inferViewportSupport(text: string): { supportsMobile: boolean; supportsDesktop: boolean } {
  const normalized = text.toLowerCase();
  const supportsMobile = /(mobile|ios|android|app|phone)/.test(normalized);
  const supportsDesktop = /(desktop|web|portal|dashboard|laptop)/.test(normalized);

  if (!supportsMobile && !supportsDesktop) {
    return { supportsMobile: true, supportsDesktop: true };
  }

  return { supportsMobile, supportsDesktop };
}

function sectionContent(section: string, types: string[]) {
  const lower = section.toLowerCase();
  if (lower.includes("header") || lower.includes("hero")) {
    return "hero";
  }
  if (lower.includes("form") || types.includes("form")) {
    return "form";
  }
  if (lower.includes("list") || lower.includes("feed") || types.includes("list")) {
    return "list";
  }
  if (lower.includes("action") || types.includes("actions")) {
    return "actions";
  }
  return "cards";
}

function ScreenSection({
  section,
  contentTypes,
  showAnnotations,
  colors,
}: {
  section: string;
  contentTypes: string[];
  showAnnotations: boolean;
  colors: { primary: string; secondary: string; accent: string; surface: string; text: string };
}) {
  const kind = sectionContent(section, contentTypes);

  return (
    <section className="rounded-xl border bg-white p-3" style={{ borderColor: `${colors.secondary}` }}>
      {showAnnotations ? <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{section}</p> : null}

      {kind === "hero" ? (
        <div>
          <h4 className="text-sm font-semibold" style={{ color: colors.primary }}>Get started faster</h4>
          <p className="mt-1 text-xs text-slate-600">Complete the next key action in one step.</p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
              Continue
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700" style={{ borderColor: colors.secondary }}>
              Later
            </button>
          </div>
        </div>
      ) : null}

      {kind === "form" ? (
        <div className="space-y-2">
          <div className="rounded-md border px-2.5 py-2 text-xs text-slate-500" style={{ borderColor: `${colors.secondary}` }}>Email address</div>
          <div className="rounded-md border px-2.5 py-2 text-xs text-slate-500" style={{ borderColor: `${colors.secondary}` }}>Password</div>
          <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Submit
          </button>
        </div>
      ) : null}

      {kind === "list" ? (
        <div className="space-y-2">
          {["Recent activity", "Open tasks", "Recommended next step"].map((item) => (
            <div key={item} className="rounded-lg border bg-slate-50 px-3 py-2" style={{ borderColor: `${colors.secondary}` }}>
              <p className="text-xs font-semibold text-slate-800">{item}</p>
              <p className="text-[11px] text-slate-500">Updated just now</p>
            </div>
          ))}
        </div>
      ) : null}

      {kind === "actions" ? (
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Primary Action
          </button>
          <button className="rounded-full border px-3 py-1.5 text-xs font-semibold text-slate-700" style={{ borderColor: `${colors.secondary}` }}>
            Secondary
          </button>
          <button className="rounded-full border px-3 py-1.5 text-xs font-semibold text-slate-700" style={{ borderColor: `${colors.accent}` }}>
            Tertiary
          </button>
        </div>
      ) : null}

      {kind === "cards" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {["Insight", "Status", "Recommendation", "Summary"].map((label) => (
            <article key={label} className="rounded-lg border p-2.5" style={{ borderColor: `${colors.secondary}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-xs" style={{ color: colors.text }}>Representative content block</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function PreviewCanvas() {
  const design = useWorkflowStore((state) => state.designSystem);
  const screens = useWorkflowStore((state) => state.generatedScreens);
  const plannedScreens = useWorkflowStore((state) => state.solutionPlan.screens);
  const selectedScreenId = useWorkflowStore((state) => state.selectedScreenId);
  const tone = useWorkflowStore((state) => state.designSystem?.tone || "hybrid");
  const density = useWorkflowStore((state) => state.designSystem?.density || "comfortable");
  const setDesignTone = useWorkflowStore((state) => state.setDesignTone);
  const setDesignDensity = useWorkflowStore((state) => state.setDesignDensity);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const fallbackPlanned = plannedScreens.find((screen) => screen.id === selectedScreenId) || plannedScreens[0];
  const selectedScreen =
    screens?.screens.find((screen) => screen.id === selectedScreenId) ||
    screens?.screens[0] || {
      id: fallbackPlanned?.id || "planned-screen",
      screenName: fallbackPlanned?.screenName || "Planned Screen",
      userAction: fallbackPlanned?.userAction || "Complete key action",
      purpose: fallbackPlanned?.problemResolution || "Resolve a key user problem",
      plannedUserAction: fallbackPlanned?.userAction || "Complete key action",
      plannedPurpose: fallbackPlanned?.problemResolution || "Resolve a key user problem",
      keySections: ["Header", "Main Content", "Action Area"],
      contentTypes: ["cards", "actions", "list"],
    };

  const viewportSupport = inferViewportSupport(
    [selectedScreen.screenName, selectedScreen.plannedPurpose, selectedScreen.plannedUserAction].join(" ")
  );

  const [requestedViewport, setRequestedViewport] = useState<PreviewViewport>(
    viewportSupport.supportsMobile ? "mobile" : "desktop"
  );

  const viewport: PreviewViewport = !viewportSupport.supportsMobile
    ? "desktop"
    : !viewportSupport.supportsDesktop
    ? "mobile"
    : requestedViewport;

  if (!design) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Live Screen Preview</h2>
        <p className="mt-2 text-sm text-slate-600">Extract design direction first to render a realistic screen preview.</p>
      </section>
    );
  }

  const canToggleViewport = viewportSupport.supportsMobile && viewportSupport.supportsDesktop;
  const densityClass = density === "compact" ? "space-y-2" : density === "spacious" ? "space-y-4" : "space-y-3";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Live Screen Preview</h2>
          <p className="mt-1 text-sm text-slate-600">Visual mockup for the selected planned screen.</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            disabled={!canToggleViewport && viewport !== "desktop"}
            onClick={() => setRequestedViewport("desktop")}
            className={`rounded-full px-3 py-1 ${viewport === "desktop" ? "bg-white text-slate-900" : "text-slate-600"}`}
          >
            Desktop
          </button>
          <button
            type="button"
            disabled={!canToggleViewport && viewport !== "mobile"}
            onClick={() => setRequestedViewport("mobile")}
            className={`rounded-full px-3 py-1 ${viewport === "mobile" ? "bg-white text-slate-900" : "text-slate-600"}`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{selectedScreen.screenName}</p>
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
        >
          {showAdvanced ? "Hide Advanced Preview Controls" : "Show Advanced Preview Controls"}
        </button>
      </div>

      {showAdvanced ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
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

          <button
            type="button"
            onClick={() => setShowAnnotations((value) => !value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            {showAnnotations ? "Hide Design Annotations" : "Show Design Annotations"}
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-2.5">
        <div className={`${viewport === "mobile" ? "mx-auto max-w-[390px]" : "w-full"} rounded-2xl border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.12)]`} style={{ borderColor: `${design.colors.secondary}` }}>
          <header className="border-b px-4 py-3" style={{ borderColor: `${design.colors.secondary}`, backgroundColor: `${design.colors.surface}` }}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold" style={{ color: design.colors.primary }}>{selectedScreen.screenName}</h3>
              <button className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: design.colors.primary }}>
                Continue
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-600">{selectedScreen.plannedPurpose}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(screens?.navigation?.length ? screens.navigation : ["Overview", "Workflow", "Settings"]).slice(0, viewport === "mobile" ? 3 : 5).map((item) => (
                <span key={item} className="rounded-full border px-2 py-0.5 text-[10px] text-slate-700" style={{ borderColor: `${design.colors.secondary}`, backgroundColor: `${design.colors.background}` }}>
                  {item}
                </span>
              ))}
            </div>
          </header>

          <main className={`p-3 ${densityClass}`} style={{ backgroundColor: `${design.colors.background}` }}>
            {(selectedScreen.keySections.length ? selectedScreen.keySections : ["Main Content", "Action Area"]).map((section, idx) => (
              <ScreenSection
                key={`${selectedScreen.id}-${section}-${idx}`}
                section={section}
                contentTypes={selectedScreen.contentTypes}
                showAnnotations={showAnnotations}
                colors={{
                  primary: design.colors.primary,
                  secondary: design.colors.secondary,
                  accent: design.colors.accent,
                  surface: design.colors.surface,
                  text: design.colors.text,
                }}
              />
            ))}
          </main>
        </div>
      </div>
    </section>
  );
}
