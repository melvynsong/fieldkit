"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildScreen, BuildScreenAction } from "@/types";

interface ScreenState {
  selectedItem: number | null;
  formValue: string;
  lastActionId: string | null;
}

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

function PrimaryActionButton({
  label,
  onClick,
  disabled,
  isPressed,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isPressed: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition ${
        isPressed
          ? "scale-[0.98] bg-blue-600 text-white shadow-lg"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function SecondaryActionButton({
  label,
  onClick,
  isPressed,
}: {
  label: string;
  onClick: () => void;
  isPressed: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 font-semibold transition ${
        isPressed
          ? "border-blue-400 bg-blue-50 text-blue-700"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function HeroSection({
  title,
  subtitle,
  showAnnotations,
}: {
  title: string;
  subtitle: string;
  showAnnotations: boolean;
}) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
      {showAnnotations && (
        <span className="mb-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          Hero Section
        </span>
      )}
      <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-lg text-slate-600">{subtitle}</p>
    </section>
  );
}

function ListSection({
  title,
  items,
  showAnnotations,
}: {
  title: string;
  items: string[];
  showAnnotations: boolean;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-6">
      {showAnnotations && (
        <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          List Section
        </span>
      )}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function cleanDisplayText(value: string): string {
  const cleaned = value
    .replace(/^(User intent|Outcome target|Flow context):\s*/i, "")
    .replace(/^This area helps users\s*/i, "")
    .replace(/while staying aligned with:.*/i, "")
    .replace(/with\s+.*emphasis\.?/i, "")
    .trim();

  if (/^step\s+\d+\s+of\s+\d+/i.test(cleaned)) {
    return "";
  }

  return cleaned;
}

export default function InteractiveScreenPreview({
  screen,
  deviceMode = "mobile",
  currentIndex,
  onNavigate,
  onTriggerAction,
  actionTargetOverrides,
  edit,
  uiState,
  showAnnotations = false,
}: {
  screen: BuildScreen;
  deviceMode?: "mobile" | "desktop";
  currentIndex: number;
  onNavigate: (index: number) => void;
  onTriggerAction: (action: BuildScreenAction) => void;
  actionTargetOverrides?: Record<string, number>;
  edit?: ScreenEditState;
  uiState?: Record<string, boolean>;
  showAnnotations?: boolean;
}) {
  const [state, setState] = useState<ScreenState>({
    selectedItem: null,
    formValue: "",
    lastActionId: null,
  });

  const designSystem = useWorkflowStore((state) => state.designSystem);

  if (!designSystem) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          Design system not found. Complete Stage 2 first.
        </p>
      </div>
    );
  }

  const hasForm = Boolean(screen.sections.find((section) => section.fieldPlaceholder));
  const canSubmit = !hasForm || state.formValue.trim().length > 0;
  const showForm = edit?.showForm ?? hasForm;
  const showList = edit?.showList ?? true;
  const showCards = edit?.showCards ?? true;

  const title = edit?.title || screen.title;
  const subtitle = edit?.subtitle || screen.subtitle;
  const primaryLabel = edit?.primaryLabel || screen.primaryAction.label;
  const listItems = screen.sections
    .flatMap((section) => section.bullets)
    .map(cleanDisplayText)
    .filter(Boolean)
    .slice(0, 4);

  function handleAction(action: BuildScreenAction) {
    setState((prev) => ({ ...prev, lastActionId: action.id }));

    const mappedTarget = actionTargetOverrides?.[action.id];
    if (typeof mappedTarget === "number") {
      onNavigate(mappedTarget);
      return;
    }

    if (action.intent === "jump" && typeof action.targetIndex === "number") {
      onNavigate(action.targetIndex);
      return;
    }

    if ((action.intent === "next" || action.intent === "confirm") && !canSubmit) {
      return;
    }

    onTriggerAction(action);
  };

  const containerClasses = deviceMode === "mobile"
    ? "max-w-md mx-auto rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden bg-black"
    : "rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-lg";

  return (
    <div className={containerClasses} style={{ borderColor: designSystem.colors.secondary }}>
      {/* Device Frame Header for Mobile */}
      {deviceMode === "mobile" && (
        <div className="flex items-center justify-between bg-black px-4 py-1.5 text-white">
          <span className="text-xs font-semibold">9:41</span>
          <span className="text-xs font-semibold">LTE 100%</span>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white" style={{ backgroundColor: designSystem.colors.surface }}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h3 className="font-semibold text-slate-900">{screen.screenName}</h3>
          <span className="text-xs font-semibold text-slate-500">Prototype</span>
        </div>

        {/* Screen Content */}
        <div
          key={`${screen.id}-${currentIndex}`}
          className="space-y-4 p-4 transition-opacity duration-200 md:p-6"
          style={{ color: designSystem.colors.text }}
        >
          {/* Render based on screen sections */}
          <HeroSection
            title={title}
            subtitle={subtitle}
            showAnnotations={showAnnotations}
          />

          {/* Render sections */}
          {showForm && (
            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              {showAnnotations ? (
                <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                  Form Section
                </span>
              ) : null}
              <label className="block text-sm font-semibold text-slate-700">
                {screen.sections[0]?.fieldLabel || "Input"}
              </label>
              <input
                type="text"
                value={state.formValue}
                onChange={(event) => setState((prev) => ({ ...prev, formValue: event.target.value }))}
                placeholder={screen.sections[0]?.fieldPlaceholder || "Enter value"}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </section>
          )}

          {showList && (
            <ListSection
              title={edit?.sectionHeadings?.[screen.sections[0]?.id] || screen.sections[0]?.heading || "Options"}
              items={listItems.length ? listItems : ["Top picks", "Recently viewed", "Recommended", "Saved for later"]}
              showAnnotations={showAnnotations}
            />
          )}

          {showCards && (
            <section>
              {showAnnotations ? (
                <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                  Card Grid
                </span>
              ) : null}
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {screen.sections.slice(0, 4).map((section, idx) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, selectedItem: idx }))}
                    className={`rounded-lg border bg-white p-4 text-left transition ${
                      state.selectedItem === idx
                        ? "border-blue-400 shadow-md"
                        : "border-slate-200 shadow-sm hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-semibold text-slate-900">
                      {edit?.sectionHeadings?.[section.id] || section.heading}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600">{cleanDisplayText(section.body) || "Open to view more details"}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {uiState?.confirmationComplete ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              Action confirmed. Prototype state updated.
            </div>
          ) : null}

          {/* Actions */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <PrimaryActionButton
              label={primaryLabel}
              onClick={() => handleAction(screen.primaryAction)}
              isPressed={state.lastActionId === screen.primaryAction.id}
              disabled={!canSubmit && (screen.primaryAction.intent === "next" || screen.primaryAction.intent === "confirm")}
            />
            {screen.secondaryActions.length > 0 && (
              <div className="flex gap-2">
                {screen.secondaryActions.map((action) => (
                  <SecondaryActionButton
                    key={action.id}
                    label={edit?.secondaryLabels?.[action.id] || action.label}
                    onClick={() => handleAction(action)}
                    isPressed={state.lastActionId === action.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Frame Footer for Mobile */}
      {deviceMode === "mobile" && (
        <div className="h-6 bg-black" />
      )}
    </div>
  );
}
