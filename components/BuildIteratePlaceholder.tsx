"use client";
import { useMemo, useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildDesignControls, BuildDesignTokens, GeneratedScreen } from "@/types";

interface BaselineSnapshot {
  tokens: BuildDesignTokens;
  controls: BuildDesignControls;
  design: {
    primary: string;
    secondary: string;
    background: string;
  };
  capturedAtLabel: string;
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

function spacingClasses(tokens: BuildDesignTokens): string {
  if (tokens.spacingScale === "tight") {
    return "space-y-2";
  }

  if (tokens.spacingScale === "airy") {
    return "space-y-5";
  }

  return "space-y-3";
}

function sectionPadding(tokens: BuildDesignTokens): string {
  if (tokens.spacingScale === "tight") {
    return "p-2.5";
  }

  if (tokens.spacingScale === "airy") {
    return "p-5";
  }

  return "p-4";
}

function headingWeight(tokens: BuildDesignTokens): string {
  if (tokens.weight === "bold") {
    return "font-bold";
  }

  if (tokens.weight === "light") {
    return "font-medium";
  }

  return "font-semibold";
}

function layoutClass(tokens: BuildDesignTokens): string {
  if (tokens.hierarchy === "action-led") {
    return "xl:grid-cols-[1fr_220px]";
  }

  if (tokens.hierarchy === "content-led") {
    return "xl:grid-cols-[240px_1fr]";
  }

  return "xl:grid-cols-[1fr_1fr]";
}

function ScreenCanvas({
  screen,
  tokens,
  primary,
  secondary,
  background,
}: {
  screen: GeneratedScreen;
  tokens: BuildDesignTokens;
  primary: string;
  secondary: string;
  background: string;
}) {
  const structureItems = screen.keySections.length
    ? screen.keySections
    : ["Header", "Primary Content", "Action Area"];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header
        className={`rounded-lg border border-slate-200 ${sectionPadding(tokens)}`}
        style={{ backgroundColor: `${background}` }}
      >
        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Generated Screen</p>
        <h3 className={`mt-1 text-base text-slate-900 ${headingWeight(tokens)}`}>{screen.screenName}</h3>
        <p className="mt-1 text-sm text-slate-600">Purpose: {screen.plannedPurpose || screen.purpose}</p>
        <p className="mt-1 text-sm text-slate-600">Primary action: {screen.plannedUserAction || screen.userAction}</p>
      </header>

      <div className={`mt-3 grid grid-cols-1 gap-3 ${layoutClass(tokens)}`}>
        <section className={`rounded-lg border border-slate-200 bg-slate-50 ${sectionPadding(tokens)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Structure</p>
          <div className={`mt-2 ${spacingClasses(tokens)}`}>
            {structureItems.map((section) => (
              <div
                key={section}
                className={`rounded-md border ${sectionPadding(tokens)}`}
                style={{ borderColor: secondary, backgroundColor: "#ffffff" }}
              >
                <p className={`text-sm text-slate-800 ${headingWeight(tokens)}`}>{section}</p>
                <div className="mt-2 h-2 rounded bg-slate-200" />
                <div className="mt-1 h-2 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>

        <section className={`rounded-lg border border-slate-200 bg-white ${sectionPadding(tokens)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Interaction Model</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {screen.contentTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize text-slate-700"
                style={{ borderColor: primary, backgroundColor: `${primary}22` }}
              >
                {type}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Primary Action
          </button>
        </section>
      </div>
    </article>
  );
}

export default function BuildIteratePlaceholder() {
  const [chatMessage, setChatMessage] = useState("");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [baseline, setBaseline] = useState<BaselineSnapshot | null>(null);
  const design = useWorkflowStore((state) => state.designSystem);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const selectedScreenId = useWorkflowStore((state) => state.selectedScreenId);
  const setSelectedScreenId = useWorkflowStore((state) => state.setSelectedScreenId);
  const controls = useWorkflowStore((state) => state.buildDesignControls);
  const tokens = useWorkflowStore((state) => state.buildDesignTokens);
  const updateControls = useWorkflowStore((state) => state.updateBuildDesignControls);
  const applyControls = useWorkflowStore((state) => state.applyBuildDesignControls);
  const resetControls = useWorkflowStore((state) => state.resetBuildDesignControls);
  const applyBuildChatPrompt = useWorkflowStore((state) => state.applyBuildChatPrompt);
  const isApplyingBuildChat = useWorkflowStore((state) => state.isApplyingBuildChat);
  const chatHistory = useWorkflowStore((state) => state.chatHistory);

  const screens = generatedScreens?.screens || [];
  const selected = screens.find((screen) => screen.id === selectedScreenId) || screens[0] || null;
  const selectedIndex = selected ? screens.findIndex((screen) => screen.id === selected.id) : -1;

  const interactionTips = useMemo(() => {
    if (!selected) {
      return [];
    }

    const tips: string[] = [
      `Start with ${selected.screenName} and keep the user action explicit: ${selected.plannedUserAction || selected.userAction}.`,
      `Check layout rhythm after each apply; your current rhythm is ${tokens.layoutRhythm}.`,
      "Use AI chat to request intent-level changes like \"make this flow feel more premium\" before applying controls again.",
    ];

    if (tokens.hierarchy === "action-led") {
      tips.push("Action-led emphasis is active. Validate that primary CTAs stay visually dominant in each section.");
    }

    if (tokens.hierarchy === "content-led") {
      tips.push("Content-led emphasis is active. Verify information hierarchy is clear before action placement.");
    }

    if (tokens.spacingScale === "tight") {
      tips.push("Compact spacing works best for power users; confirm touch targets still feel accessible.");
    }

    if (tokens.spacingScale === "airy") {
      tips.push("Spacious layouts improve scanability; ensure key actions are still above the fold.");
    }

    return tips;
  }, [selected, tokens.hierarchy, tokens.layoutRhythm, tokens.spacingScale]);

  const quickPrompts = [
    "Make this screen feel more premium while preserving structure.",
    "Increase action emphasis but keep content readable.",
    "Tighten spacing for faster task completion.",
    "Use a friendlier tone without changing screen purpose.",
  ];

  const recentBuildMessages = chatHistory.slice(-8);

  const compareChanges = useMemo(() => {
    if (!baseline) {
      return [] as string[];
    }

    const changes: string[] = [];
    if (baseline.tokens.spacingScale !== tokens.spacingScale) {
      changes.push(`Spacing: ${baseline.tokens.spacingScale} -> ${tokens.spacingScale}`);
    }
    if (baseline.tokens.typographyPreset !== tokens.typographyPreset) {
      changes.push(`Typography: ${baseline.tokens.typographyPreset} -> ${tokens.typographyPreset}`);
    }
    if (baseline.tokens.hierarchy !== tokens.hierarchy) {
      changes.push(`Hierarchy: ${baseline.tokens.hierarchy} -> ${tokens.hierarchy}`);
    }
    if (baseline.tokens.weight !== tokens.weight) {
      changes.push(`Weight: ${baseline.tokens.weight} -> ${tokens.weight}`);
    }
    if (baseline.tokens.layoutRhythm !== tokens.layoutRhythm) {
      changes.push(`Rhythm: ${baseline.tokens.layoutRhythm} -> ${tokens.layoutRhythm}`);
    }

    return changes;
  }, [baseline, tokens]);

  function captureBaseline() {
    if (!design) {
      return;
    }

    setBaseline({
      tokens: { ...tokens },
      controls: { ...controls },
      design: {
        primary: design.colors.primary,
        secondary: design.colors.secondary,
        background: design.colors.background,
      },
      capturedAtLabel: new Date().toLocaleTimeString(),
    });
  }

  function moveSelection(direction: "prev" | "next") {
    if (!selected || !screens.length) {
      return;
    }

    const index = screens.findIndex((screen) => screen.id === selected.id);
    const nextIndex = direction === "prev" ? Math.max(index - 1, 0) : Math.min(index + 1, screens.length - 1);
    setSelectedScreenId(screens[nextIndex]?.id || selected.id);
  }

  function submitBuildChat(message: string) {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    captureBaseline();
    void applyBuildChatPrompt(trimmed);
    setChatMessage("");
  }

  if (!screens.length || !design) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">Stage 3. Build & Iterate</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Generate screens in Stage 2 first. Stage 3 applies reusable design controls to concrete generated
          screens without another AI generation step.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Stage 3. Build & Iterate</h2>
        <p className="mt-1 text-sm text-slate-600">
          Refine concrete generated screens one-by-one. Keep structure fixed, and tune spacing, hierarchy, tone,
          and rhythm for build readiness.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Controls</h3>
            <p className="mt-1 text-xs text-slate-600">
              Build-stage controls are applied to existing generated screens without regenerating structure.
            </p>

            <div className="mt-4 space-y-4">
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

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  captureBaseline();
                  applyControls();
                }}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Apply Controls
              </button>
              <button
                type="button"
                onClick={resetControls}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </button>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={captureBaseline}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Set Baseline
              </button>
              <button
                type="button"
                disabled={!baseline}
                onClick={() => setIsCompareMode((value) => !value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                {isCompareMode ? "Hide Compare" : "Compare Before / After"}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Tip: Apply after each control change to compare before/after behavior on the active screen.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Applied Token State</p>
            <p className="mt-2 text-xs text-slate-600">
              Spacing: {tokens.spacingScale} | Typography: {tokens.typographyPreset} | Hierarchy: {tokens.hierarchy}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Visual Weight: {tokens.weight} | Layout Rhythm: {tokens.layoutRhythm}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">How To Use Stage 3</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600">
              <li>Select one generated screen and keep its purpose intact.</li>
              <li>Adjust controls to tune hierarchy and spacing for implementation.</li>
              <li>Click Apply Controls and inspect interaction blocks on the right.</li>
              <li>Use AI chat for nuanced style direction, then apply controls again.</li>
            </ol>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Interactive Hints</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
              {interactionTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">AI Build Chat</p>
            <p className="mt-1 text-xs text-slate-600">
              Prompt style changes while preserving screen structure, purpose, and user actions.
            </p>

            <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              {!recentBuildMessages.length ? (
                <p className="text-xs text-slate-500">No chat messages yet.</p>
              ) : (
                recentBuildMessages.map((item) => (
                  <p
                    key={item.id}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      item.role === "user"
                        ? "ml-5 bg-slate-900 text-white"
                        : "mr-5 border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item.content}
                  </p>
                ))
              )}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="e.g. make hierarchy more action-led"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={isApplyingBuildChat || !chatMessage.trim()}
                onClick={() => submitBuildChat(chatMessage)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isApplyingBuildChat ? "Applying..." : "Send"}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitBuildChat(prompt)}
                  className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {isCompareMode && baseline ? (
            <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Compare Summary</p>
              <p className="mt-1 text-xs text-slate-600">Baseline captured at {baseline.capturedAtLabel}.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                {compareChanges.length ? (
                  compareChanges.map((change) => <li key={change}>{change}</li>)
                ) : (
                  <li>No token-level differences yet. Try changing controls or using AI build chat.</li>
                )}
              </ul>
            </section>
          ) : null}

          <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Generated Screens</p>
              <p className="text-xs text-slate-500">
                Screen {selectedIndex + 1} of {screens.length}
              </p>
            </div>
            <select
              value={selected?.id || ""}
              onChange={(event) => setSelectedScreenId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {screens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.screenName}
                </option>
              ))}
            </select>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => moveSelection("prev")}
                disabled={selectedIndex <= 0}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Previous Screen
              </button>
              <button
                type="button"
                onClick={() => moveSelection("next")}
                disabled={selectedIndex < 0 || selectedIndex >= screens.length - 1}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Next Screen
              </button>
            </div>

            {selected ? (
              <p className="mt-2 text-xs text-slate-600">
                Usage hint: Validate that <span className="font-semibold">{selected.plannedUserAction || selected.userAction}</span> remains clear while iterating visual tone.
              </p>
            ) : null}
          </div>

          {selected && isCompareMode && baseline ? (
            <div className="grid gap-3 xl:grid-cols-2">
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Before</p>
                <ScreenCanvas
                  screen={selected}
                  tokens={baseline.tokens}
                  primary={baseline.design.primary}
                  secondary={baseline.design.secondary}
                  background={baseline.design.background}
                />
              </section>
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">After</p>
                <ScreenCanvas
                  screen={selected}
                  tokens={tokens}
                  primary={design.colors.primary}
                  secondary={design.colors.secondary}
                  background={design.colors.background}
                />
              </section>
            </div>
          ) : selected ? (
            <ScreenCanvas
              screen={selected}
              tokens={tokens}
              primary={design.colors.primary}
              secondary={design.colors.secondary}
              background={design.colors.background}
            />
          ) : null}
        </section>
      </div>
    </section>
  );
}
