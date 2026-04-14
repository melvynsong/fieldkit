"use client";

import { useEffect, useState } from "react";
import InteractiveScreenPreview from "@/components/InteractiveScreenPreview";
import ScreenListNavigator from "@/components/ScreenListNavigator";
import DeviceModeSelector from "@/components/DeviceModeSelector";
import { BUILD_VERSION } from "@/lib/build-version";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildDesignControls, BuildScreen } from "@/types";

interface ScreenEditState {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabels?: Record<string, string>;
  sectionHeadings?: Record<string, string>;
  showForm?: boolean;
  showList?: boolean;
  showCards?: boolean;
}

function inferDeviceSupport(screen: BuildScreen | null): { mobile: boolean; desktop: boolean } {
  if (!screen) {
    return { mobile: true, desktop: true };
  }

  const source = `${screen.screenName} ${screen.title} ${screen.subtitle} ${screen.description}`.toLowerCase();
  const mobileHints = ["mobile", "onboarding", "checkout", "search", "feed"];
  const desktopHints = ["dashboard", "table", "admin", "analytics", "workspace"];
  const hasMobile = mobileHints.some((hint) => source.includes(hint));
  const hasDesktop = desktopHints.some((hint) => source.includes(hint));

  if (hasMobile && !hasDesktop) {
    return { mobile: true, desktop: false };
  }

  if (hasDesktop && !hasMobile) {
    return { mobile: false, desktop: true };
  }

  return { mobile: true, desktop: true };
}

function ControlRow<T extends keyof BuildDesignControls>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: BuildDesignControls[T];
  options: BuildDesignControls[T][];
  onChange: (next: BuildDesignControls[T]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                active
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BuildWorkspace() {
  const initializeBuildWorkspace = useWorkflowStore((state) => state.initializeBuildWorkspace);
  const screens = useWorkflowStore((state) => state.buildScreens);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);
  const setCurrentStage = useWorkflowStore((state) => state.setCurrentStage);
  const controls = useWorkflowStore((state) => state.buildDesignControls);
  const tokens = useWorkflowStore((state) => state.buildDesignTokens);
  const updateControls = useWorkflowStore((state) => state.updateBuildDesignControls);
  const applyControls = useWorkflowStore((state) => state.applyBuildDesignControls);
  const resetControls = useWorkflowStore((state) => state.resetBuildDesignControls);
  const triggerBuildAction = useWorkflowStore((state) => state.triggerBuildAction);
  const buildUiState = useWorkflowStore((state) => state.buildUiState);
  const setBuildCurrentScreenIndex = useWorkflowStore((state) => state.setBuildCurrentScreenIndex);

  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [flowMap, setFlowMap] = useState<Record<string, number>>({});
  const [screenEdits, setScreenEdits] = useState<Record<string, ScreenEditState>>({});
  const [isPlayFlowRunning, setIsPlayFlowRunning] = useState(false);
  const [showDesignInsights, setShowDesignInsights] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    initializeBuildWorkspace();
  }, [initializeBuildWorkspace]);

  const activeScreen = screens[currentIndex] || null;
  const activeEdit = activeScreen ? screenEdits[activeScreen.id] || {} : {};
  const support = inferDeviceSupport(activeScreen);
  const effectiveDeviceMode = support[deviceMode] ? deviceMode : support.mobile ? "mobile" : "desktop";

  useEffect(() => {
    if (!isPlayFlowRunning || !screens.length) {
      return;
    }

    if (currentIndex >= screens.length - 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setBuildCurrentScreenIndex(currentIndex + 1);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [isPlayFlowRunning, currentIndex, screens.length, setBuildCurrentScreenIndex]);

  const activeActions = activeScreen
    ? [activeScreen.primaryAction, ...activeScreen.secondaryActions]
    : [];

  function updateScreenEdit(next: Partial<ScreenEditState>) {
    if (!activeScreen) return;
    setScreenEdits((prev) => ({
      ...prev,
      [activeScreen.id]: {
        ...prev[activeScreen.id],
        ...next,
      },
    }));
  }

  function updateSecondaryLabel(actionId: string, value: string) {
    if (!activeScreen) return;
    const current = screenEdits[activeScreen.id] || {};
    setScreenEdits((prev) => ({
      ...prev,
      [activeScreen.id]: {
        ...current,
        secondaryLabels: {
          ...(current.secondaryLabels || {}),
          [actionId]: value,
        },
      },
    }));
  }

  function updateSectionHeading(sectionId: string, value: string) {
    if (!activeScreen) return;
    const current = screenEdits[activeScreen.id] || {};
    setScreenEdits((prev) => ({
      ...prev,
      [activeScreen.id]: {
        ...current,
        sectionHeadings: {
          ...(current.sectionHeadings || {}),
          [sectionId]: value,
        },
      },
    }));
  }

  function updateFlow(actionId: string, target: string) {
    if (!target) {
      setFlowMap((prev) => {
        const next = { ...prev };
        delete next[actionId];
        return next;
      });
      return;
    }

    setFlowMap((prev) => ({
      ...prev,
      [actionId]: Number(target),
    }));
  }

  if (!screens.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stage 3. Build & Iterate</h2>
            <p className="mt-1 text-sm text-slate-600">Transform your design into an interactive prototype.</p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Build {BUILD_VERSION}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Generate screens in Stage 2 first. Stage 3 turns planned screens into an interactive prototype flow.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Readiness: Generated screens {generatedScreens?.screens.length || 0} / Build screens {screens.length}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStage("design")}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go To Stage 2 (Design)
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Stage 3. Build & Iterate
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Interactive prototype • Screen {currentIndex + 1} of {screens.length}
            </p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Build {BUILD_VERSION}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-0 lg:grid-cols-[300px_1fr_380px]">
        {/* LEFT: Screen Navigator */}
        <aside className="border-r border-slate-200 bg-slate-50 p-4">
          <ScreenListNavigator />
        </aside>

        {/* CENTER: Interactive Preview */}
        <main className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 min-h-[600px] lg:min-h-[700px]">
          {activeScreen ? (
            <div className="w-full max-w-2xl">
              <InteractiveScreenPreview
                screen={activeScreen}
                deviceMode={effectiveDeviceMode}
                currentIndex={currentIndex}
                onNavigate={setBuildCurrentScreenIndex}
                onTriggerAction={triggerBuildAction}
                actionTargetOverrides={flowMap}
                edit={activeEdit}
                uiState={buildUiState}
                showAnnotations={showAnnotations}
              />
            </div>
          ) : null}

          {/* Device Mode Selector Below Preview */}
          <div className="mt-6 w-full max-w-md">
            <DeviceModeSelector
              value={effectiveDeviceMode}
              onChange={setDeviceMode}
              supports={support}
            />
          </div>

          <div className="mt-3 flex w-full max-w-md gap-2">
            <button
              type="button"
              onClick={() => {
                setBuildCurrentScreenIndex(0);
                setIsPlayFlowRunning((value) => !value);
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isPlayFlowRunning ? "Stop Flow" : "Play Flow"}
            </button>
            <button
              type="button"
              onClick={() => {
                const shareUrl = `${window.location.origin}/workflow?stage=build-iterate`;
                if (navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(shareUrl);
                }
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Share Prototype
            </button>
          </div>

        </main>

        {/* RIGHT: Controls Panel */}
        <aside className="border-l border-slate-200 bg-white p-4 space-y-4 overflow-y-auto max-h-[700px]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">View Modes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowDesignInsights((value) => !value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  showDesignInsights
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {showDesignInsights ? "Hide Design Insights" : "Show Design Insights"}
              </button>
              <button
                type="button"
                onClick={() => setShowAnnotations((value) => !value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  showAnnotations
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {showAnnotations ? "Hide Annotations" : "Show Annotations"}
              </button>
            </div>
          </div>

          {showDesignInsights && activeScreen ? (
            <div className="rounded-lg border border-slate-300 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Design Insights</p>
              <div className="mt-2 space-y-2 text-xs text-slate-700">
                <p><span className="font-semibold text-slate-900">Tone:</span> {controls.tone}</p>
                <p><span className="font-semibold text-slate-900">Style:</span> {controls.appStyle}</p>
                <p><span className="font-semibold text-slate-900">Density:</span> {controls.density}</p>
                <p><span className="font-semibold text-slate-900">Rhythm:</span> {tokens.layoutRhythm}</p>
                <p><span className="font-semibold text-slate-900">Design reasoning:</span> {activeScreen.description}</p>
                <p><span className="font-semibold text-slate-900">Screen contribution:</span> {activeScreen.subtitle}</p>
                <p><span className="font-semibold text-slate-900">Metadata:</span> {activeScreen.chips.join(" • ")}</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
              Design Controls
            </h3>
            <p className="text-xs text-slate-600">
              Refine prototype styling and interaction behavior.
            </p>

            <div className="space-y-3">
              <ControlRow<"appStyle">
                label="App Style"
                value={controls.appStyle}
                options={["transactional", "media", "hybrid"]}
                onChange={(appStyle) => updateControls({ appStyle })}
              />

              <ControlRow<"tone">
                label="Tone"
                value={controls.tone}
                options={["professional", "playful", "premium", "friendly"]}
                onChange={(tone) => updateControls({ tone })}
              />

              <ControlRow<"density">
                label="Density"
                value={controls.density}
                options={["compact", "comfortable", "spacious"]}
                onChange={(density) => updateControls({ density })}
              />

              <ControlRow<"emphasis">
                label="Emphasis"
                value={controls.emphasis}
                options={["content", "actions", "balanced"]}
                onChange={(emphasis) => updateControls({ emphasis })}
              />

              <ControlRow<"visualWeight">
                label="Visual Weight"
                value={controls.visualWeight}
                options={["light", "balanced", "bold"]}
                onChange={(visualWeight) => updateControls({ visualWeight })}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyControls}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={resetControls}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

          </div>

          {/* Advanced Options */}
          <details className="group">
            <summary className="cursor-pointer select-none rounded-lg bg-slate-50 px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-100">
              <span className="text-sm uppercase tracking-[0.08em]">
                Advanced Options
              </span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-600">Edit labels, section titles, layout blocks, and flow targets.</p>

              {activeScreen ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Screen Title</label>
                    <input
                      value={activeEdit.title ?? activeScreen.title}
                      onChange={(event) => updateScreenEdit({ title: event.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Subtitle</label>
                    <input
                      value={activeEdit.subtitle ?? activeScreen.subtitle}
                      onChange={(event) => updateScreenEdit({ subtitle: event.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Primary Button Label</label>
                    <input
                      value={activeEdit.primaryLabel ?? activeScreen.primaryAction.label}
                      onChange={(event) => updateScreenEdit({ primaryLabel: event.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                    />
                  </div>

                  {activeScreen.secondaryActions.map((action) => (
                    <div key={action.id} className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Secondary Button</label>
                      <input
                        value={activeEdit.secondaryLabels?.[action.id] ?? action.label}
                        onChange={(event) => updateSecondaryLabel(action.id, event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  ))}

                  {activeScreen.sections.slice(0, 2).map((section) => (
                    <div key={section.id} className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Section Title</label>
                      <input
                        value={activeEdit.sectionHeadings?.[section.id] ?? section.heading}
                        onChange={(event) => updateSectionHeading(section.id, event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={activeEdit.showForm ?? true}
                        onChange={(event) => updateScreenEdit({ showForm: event.target.checked })}
                      />
                      Form
                    </label>
                    <label className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={activeEdit.showList ?? true}
                        onChange={(event) => updateScreenEdit({ showList: event.target.checked })}
                      />
                      List
                    </label>
                    <label className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={activeEdit.showCards ?? true}
                        onChange={(event) => updateScreenEdit({ showCards: event.target.checked })}
                      />
                      Cards
                    </label>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200 pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Flow Targets</p>
                    {activeActions.map((action) => (
                      <div key={action.id} className="grid grid-cols-[1fr_130px] items-center gap-2">
                        <p className="truncate text-[11px] text-slate-700">{action.label}</p>
                        <select
                          value={flowMap[action.id] ?? ""}
                          onChange={(event) => updateFlow(action.id, event.target.value)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700"
                        >
                          <option value="">Default</option>
                          {screens.map((screen, idx) => (
                            <option key={screen.id} value={idx}>
                              {screen.screenName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-3">
            <p className="text-xs font-semibold text-blue-900">Tip</p>
            <p className="mt-1 text-xs text-blue-700">
              Use the toggle in each screen to show design annotations. Use AI Assistant dock to refine screens.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
