"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildScreen } from "@/types";

interface ScreenState {
  activeStates: Record<string, boolean>;
  showAnnotations: boolean;
}

const MOCK_CONTENT = {
  hero: {
    heading: "Discover Amazing Products",
    subheading: "Find exactly what you're looking for",
  },
  form: {
    fields: [
      { label: "Search...", placeholder: "What are you looking for?" },
      { label: "Category", placeholder: "Select category" },
    ],
  },
  list: {
    items: ["Premium Option", "Popular Choice", "Best Value", "New Arrival"],
  },
  actions: {
    primary: ["Explore", "Get Started", "Continue", "Save", "Submit"],
    secondary: ["Learn More", "View Details", "Dismiss", "Cancel", "Skip"],
  },
};

function PrimaryActionButton({
  action,
  onClick,
  isActive,
}: {
  action: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition ${
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {action}
    </button>
  );
}

function SecondaryActionButton({
  action,
  onClick,
}: {
  action: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {action}
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

function FormSection({
  showAnnotations,
}: {
  showAnnotations: boolean;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {showAnnotations && (
        <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          Form Section
        </span>
      )}
      {MOCK_CONTENT.form.fields.map((field, idx) => (
        <div key={idx}>
          <label className="block text-sm font-semibold text-slate-700">
            {field.label}
          </label>
          <input
            type="text"
            placeholder={field.placeholder}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            readOnly
          />
        </div>
      ))}
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

function ChipSection({
  chips,
  showAnnotations,
}: {
  chips: string[];
  showAnnotations: boolean;
}) {
  if (!chips.length) return null;

  return (
    <section className="flex flex-wrap gap-2">
      {showAnnotations && (
        <span className="w-full rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          Tags/Context
        </span>
      )}
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
        >
          {chip}
        </span>
      ))}
    </section>
  );
}

function CardGridSection({
  count = 3,
  showAnnotations,
}: {
  count?: number;
  showAnnotations: boolean;
}) {
  return (
    <section>
      {showAnnotations && (
        <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          Card Grid
        </span>
      )}
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-square rounded-md bg-gradient-to-br from-slate-100 to-slate-200" />
            <h4 className="mt-3 font-semibold text-slate-900">Item {idx + 1}</h4>
            <p className="mt-1 text-xs text-slate-600">Meaningful description</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function InteractiveScreenPreview({
  screen,
  deviceMode = "mobile",
}: {
  screen: BuildScreen;
  deviceMode?: "mobile" | "desktop";
}) {
  const [state, setState] = useState<ScreenState>({
    activeStates: {},
    showAnnotations: false,
  });

  const designSystem = useWorkflowStore((state) => state.designSystem);
  const setBuildCurrentScreenIndex = useWorkflowStore(
    (state) => state.setBuildCurrentScreenIndex
  );
  const screens = useWorkflowStore((state) => state.buildScreens);
  const currentIndex = useWorkflowStore((state) => state.buildCurrentScreenIndex);

  if (!designSystem) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          Design system not found. Complete Stage 2 first.
        </p>
      </div>
    );
  }

  const handleAction = (action: string) => {
    if (action.intent === "next") {
      const nextIndex = Math.min(currentIndex + 1, screens.length - 1);
      setBuildCurrentScreenIndex(nextIndex);
    } else if (action.intent === "back") {
      const prevIndex = Math.max(currentIndex - 1, 0);
      setBuildCurrentScreenIndex(prevIndex);
    } else if (action.intent === "jump" && action.targetIndex !== undefined) {
      setBuildCurrentScreenIndex(action.targetIndex);
    } else if (action.stateKey) {
      setState((prev) => ({
        ...prev,
        activeStates: {
          ...prev.activeStates,
          [action.stateKey!]: !prev.activeStates[action.stateKey!],
        },
      }));
    }
  };

  const containerClasses = deviceMode === "mobile"
    ? "max-w-md mx-auto rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden bg-black"
    : "rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-lg";

  const contentClasses = deviceMode === "mobile" ? "bg-white" : "bg-white";

  return (
    <div className={containerClasses}>
      {/* Device Frame Header for Mobile */}
      {deviceMode === "mobile" && (
        <div className="flex items-center justify-between bg-black px-4 py-1.5 text-white">
          <span className="text-xs font-semibold">9:41</span>
          <span className="text-xs font-semibold">📶 🔋</span>
        </div>
      )}

      {/* Main Content */}
      <div className={contentClasses}>
        {/* Annotation Toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h3 className="font-semibold text-slate-900">{screen.screenName}</h3>
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                showAnnotations: !prev.showAnnotations,
              }))
            }
            className={`text-xs font-semibold px-2 py-1 rounded transition ${
              state.showAnnotations
                ? "bg-yellow-100 text-yellow-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Annotations
          </button>
        </div>

        {/* Screen Content */}
        <div className={`space-y-4 p-4 md:p-6`}>
          {/* Render based on screen sections */}
          <HeroSection
            title={screen.title}
            subtitle={screen.subtitle}
            showAnnotations={state.showAnnotations}
          />

          {screen.description && (
            <p className="text-sm text-slate-600">{screen.description}</p>
          )}

          <ChipSection chips={screen.chips} showAnnotations={state.showAnnotations} />

          {/* Render sections */}
          {screen.sections.some((s) => s.heading?.toLowerCase().includes("form")) && (
            <FormSection showAnnotations={state.showAnnotations} />
          )}

          {screen.sections.some((s) => s.heading?.toLowerCase().includes("list")) && (
            <ListSection
              title={screen.sections.find((s) =>
                s.heading?.toLowerCase().includes("list")
              )?.heading || "Items"}
              items={MOCK_CONTENT.list.items}
              showAnnotations={state.showAnnotations}
            />
          )}

          {screen.sections.some((s) => !s.heading?.toLowerCase().includes("form")) && (
            <CardGridSection count={3} showAnnotations={state.showAnnotations} />
          )}

          {/* Actions */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <PrimaryActionButton
              action={screen.primaryAction.label}
              onClick={() => handleAction(screen.primaryAction)}
              isActive={
                state.activeStates[screen.primaryAction.id] || false
              }
            />
            {screen.secondaryActions.length > 0 && (
              <div className="flex gap-2">
                {screen.secondaryActions.map((action) => (
                  <SecondaryActionButton
                    key={action.id}
                    action={action.label}
                    onClick={() => handleAction(action)}
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
