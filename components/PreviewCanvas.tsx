"use client";

import DesignCuesPanel from "@/components/DesignCuesPanel";
import { sectionColumnsForTone, spacingClass, wireframeStyleForDesign } from "@/lib/preview-style";
import { useWorkflowStore } from "@/lib/workflowStore";

function PlaceholderRow({ tone }: { tone: "transactional" | "media" | "hybrid" }) {
  const widthClass =
    tone === "transactional"
      ? "w-11/12"
      : tone === "media"
      ? "w-9/12"
      : "w-10/12";

  return (
    <div className="space-y-2">
      <div className={`h-2 rounded bg-slate-300/60 ${widthClass}`} />
      <div className="h-2 w-7/12 rounded bg-slate-300/40" />
    </div>
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
  const setSelectedScreenId = useWorkflowStore((state) => state.setSelectedScreenId);

  if (!design) {
    return null;
  }

  const fallbackPlanned =
    plannedScreens.find((screen) => screen.id === selectedScreenId) || plannedScreens[0];

  const selectedScreen =
    screens?.screens.find((screen) => screen.id === selectedScreenId) ||
    screens?.screens[0] || {
      id: fallbackPlanned?.id || "planned-screen",
      screenName: fallbackPlanned?.screenName || "Planned Screen",
      userAction: fallbackPlanned?.userAction || "Complete key action",
      purpose: fallbackPlanned?.problemResolution || "Resolve a key user problem",
      plannedUserAction: fallbackPlanned?.userAction || "Complete key action",
      plannedPurpose: fallbackPlanned?.problemResolution || "Resolve a key user problem",
      keySections: ["Header", "Primary Content", "Action Area"],
      contentTypes: ["text", "actions", "list"],
    };

  const screenOptions = screens?.screens.length
    ? screens.screens.map((screen) => ({ id: screen.id, name: screen.screenName }))
    : plannedScreens.map((screen) => ({ id: screen.id, name: screen.screenName }));

  const navigationItems = screens?.navigation?.length
    ? screens.navigation
    : ["Overview", "Workflow", "Settings"];

  const style = wireframeStyleForDesign(design);
  const toneColumnClass = sectionColumnsForTone(design.tone);
  const densityClass = spacingClass(design.density);

  const navBg = `${design.colors.secondary}66`;
  const sectionBg = `${design.colors.surface}D9`;
  const accentSoft = `${design.colors.accent}66`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            Live Screen Preview
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Low-fidelity structure with medium-fidelity design cues from extraction.
          </p>
        </div>
        <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          Preview Mode
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={tone}
          onChange={(event) =>
            setDesignTone(event.target.value as "transactional" | "media" | "hybrid")
          }
          className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs"
        >
          <option value="transactional">transactional</option>
          <option value="media">media</option>
          <option value="hybrid">hybrid</option>
        </select>

        <select
          value={density}
          onChange={(event) =>
            setDesignDensity(event.target.value as "compact" | "comfortable" | "spacious")
          }
          className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs"
        >
          <option value="compact">compact</option>
          <option value="comfortable">comfortable</option>
          <option value="spacious">spacious</option>
        </select>

        <select
          value={selectedScreen.id}
          onChange={(event) => setSelectedScreenId(event.target.value)}
          className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs"
        >
          {screenOptions.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <DesignCuesPanel />

        <div
          className={`${style.frameClass} ${densityClass}`}
          style={{
            borderColor: `${design.colors.secondary}`,
            backgroundColor: `${design.colors.background}`,
            color: design.colors.text,
          }}
        >
          <nav
            className={`${style.navClass} p-3`}
            style={{ borderColor: design.colors.secondary, backgroundColor: navBg }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">Top Bar / Navigation</p>
              <span className="rounded-full border border-slate-400/30 bg-white/60 px-2 py-0.5 text-[10px]">
                {design.tone}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {navigationItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-2 py-0.5 text-[10px]"
                  style={{ borderColor: design.colors.secondary, backgroundColor: sectionBg }}
                >
                  {item}
                </span>
              ))}
            </div>
          </nav>

          <article
            className={`${style.sectionClass} p-4`}
            style={{ borderColor: design.colors.secondary, backgroundColor: sectionBg }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Screen
                </p>
                <h3 className="text-sm font-semibold" style={{ color: design.colors.primary }}>
                  {selectedScreen.screenName}
                </h3>
              </div>
              <span className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: design.colors.secondary }}>
                Wireframe
              </span>
            </div>

            <div className="mt-3 rounded-md border border-slate-300/40 bg-white/70 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Planned User Action
              </p>
              <p className="mt-1 text-xs text-slate-700">{selectedScreen.plannedUserAction}</p>
            </div>

            <div className="mt-2 rounded-md border border-slate-300/40 bg-white/70 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Why this screen exists
              </p>
              <p className="mt-1 text-xs text-slate-700">{selectedScreen.plannedPurpose}</p>
            </div>

            <div className={`mt-3 grid gap-2 ${toneColumnClass}`}>
              {selectedScreen.keySections.map((section, idx) => (
                <section
                  key={`${selectedScreen.id}-${section}-${idx}`}
                  className={`${style.sectionClass} p-3`}
                  style={{ borderColor: `${design.colors.secondary}`, backgroundColor: `${design.colors.surface}BF` }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-700">{section}</p>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">Section</span>
                  </div>
                  <PlaceholderRow tone={design.tone} />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedScreen.contentTypes.slice(0, 3).map((type) => (
                      <span
                        key={`${section}-${type}`}
                        className={style.actionClass}
                        style={{ borderColor: design.colors.accent, backgroundColor: accentSoft }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
