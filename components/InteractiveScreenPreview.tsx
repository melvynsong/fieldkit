"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { BuildScreen, BuildScreenAction } from "@/types";

// ─── types ────────────────────────────────────────────────────────────────────

interface ScreenState {
  selectedItem: number | null;
  formValues: Record<string, string>;
  lastActionId: string | null;
  submitted: boolean;
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

// ─── content type helpers ─────────────────────────────────────────────────────

function hasType(types: string[], ...matchers: RegExp[]): boolean {
  return types.some((t) => matchers.some((re) => re.test(t.toLowerCase())));
}

// ─── contextual list items ────────────────────────────────────────────────────

function inferListItems(screenName: string, keySections: string[]): string[] {
  // Prefer actual section names from Stage 2 if they look like real UI items
  const usable = keySections.filter(
    (s) => s.length > 3 && !/header|footer|nav|action|button/i.test(s)
  );
  if (usable.length >= 2) return usable.slice(0, 4);

  // Fall back to contextual defaults
  const ctx = screenName.toLowerCase();
  if (/menu|order|food|dish/.test(ctx))
    return ["Starters", "Main courses", "Sides & extras", "Drinks & desserts"];
  if (/hotel|stay|accommodation/.test(ctx))
    return ["Standard room", "Deluxe room", "Suite", "Family room"];
  if (/flight|travel|trip/.test(ctx))
    return ["Upcoming trips", "Past bookings", "Saved searches", "Special offers"];
  if (/product|shop|store|catalog/.test(ctx))
    return ["New arrivals", "Best sellers", "On sale", "Your wishlist"];
  if (/task|project|board|kanban/.test(ctx))
    return ["To do", "In progress", "Under review", "Completed"];
  if (/notification|alert|message/.test(ctx))
    return ["Unread messages", "System alerts", "Reminders", "Activity feed"];
  if (/report|analytics|insight|stat/.test(ctx))
    return ["Overview", "Performance metrics", "User activity", "Export options"];
  if (/setting|profile|account/.test(ctx))
    return ["Personal details", "Preferences", "Security", "Connected apps"];

  return ["All items", "Recent activity", "Saved items", "Recommendations"];
}

// ─── contextual card data ─────────────────────────────────────────────────────

interface CardData { title: string; subtitle: string }

function inferCards(screenName: string, keySections: string[]): CardData[] {
  const usable = keySections.filter((s) => !/header|footer|nav|action/i.test(s)).slice(0, 4);
  if (usable.length >= 2) {
    return usable.map((s) => ({ title: s, subtitle: "Tap to view details" }));
  }

  const ctx = screenName.toLowerCase();
  if (/dashboard|home|overview/.test(ctx))
    return [
      { title: "Recent activity", subtitle: "Last updated just now" },
      { title: "Quick actions", subtitle: "Frequently used" },
      { title: "Notifications", subtitle: "2 unread items" },
      { title: "Your progress", subtitle: "On track this week" },
    ];
  if (/profile|account|setting/.test(ctx))
    return [
      { title: "Personal info", subtitle: "Name, email, phone" },
      { title: "Security", subtitle: "Password & 2FA" },
      { title: "Preferences", subtitle: "Notifications, language" },
      { title: "Connected apps", subtitle: "3 apps connected" },
    ];

  return [
    { title: "Overview", subtitle: "Summary view" },
    { title: "Details", subtitle: "In-depth information" },
    { title: "Actions", subtitle: "Available next steps" },
    { title: "History", subtitle: "Past activity" },
  ];
}

// ─── subcomponents ────────────────────────────────────────────────────────────

function ScreenHeader({
  title,
  subtitle,
  navItems,
  primaryColor,
}: {
  title: string;
  subtitle: string;
  navItems: string[];
  primaryColor: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 leading-5">{subtitle}</p>}
      {navItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {navItems.slice(0, 4).map((item, i) => (
            <span
              key={item}
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={
                i === 0
                  ? { backgroundColor: primaryColor, color: "#fff", borderColor: primaryColor }
                  : { color: "#64748b", borderColor: "#e2e8f0" }
              }
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FormSection({
  sections,
  screenName,
  formValues,
  onChange,
}: {
  sections: BuildScreen["sections"];
  screenName: string;
  formValues: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  const formSections = sections.filter((s) => s.fieldLabel);
  if (!formSections.length) return null;

  return (
    <div className="space-y-3">
      {formSections.map((section) => (
        <div key={section.id}>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {section.fieldLabel}
          </label>
          <input
            type={/password/i.test(section.fieldLabel ?? "") ? "password" : "text"}
            value={formValues[section.id] ?? ""}
            onChange={(e) => onChange(section.id, e.target.value)}
            placeholder={section.fieldPlaceholder ?? `Enter ${(section.fieldLabel ?? "").toLowerCase()}…`}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ))}
    </div>
  );
}

function ListSection({
  heading,
  items,
  selectedItem,
  onSelect,
}: {
  heading: string;
  items: string[];
  selectedItem: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{heading}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(idx)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              selectedItem === idx
                ? "border-blue-400 bg-blue-50 font-semibold text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardsSection({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((card, idx) => (
        <button
          key={idx}
          type="button"
          className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-800">{card.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{card.subtitle}</p>
        </button>
      ))}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600 font-bold">✓</span>
        <p className="text-sm font-semibold text-emerald-800">{message}</p>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

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
    formValues: {},
    lastActionId: null,
    submitted: false,
  });

  const designSystem = useWorkflowStore((s) => s.designSystem);
  const generatedScreens = useWorkflowStore((s) => s.generatedScreens);

  // Look up the original Stage 2 screen for context
  const sourceScreen = generatedScreens?.screens.find((s) => s.id === screen.sourceScreenId);
  const contentTypes: string[] = sourceScreen?.contentTypes ?? screen.chips ?? [];
  const keySections: string[] = sourceScreen?.keySections ?? [];
  const navigation: string[] = generatedScreens?.navigation ?? [];

  if (!designSystem) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">Complete Stage 2 to preview screens.</p>
      </div>
    );
  }

  // ── decide what to render from contentTypes ────────────────────────────────
  const showForm =
    edit?.showForm ??
    (hasType(contentTypes, /form/, /input/, /search/, /login/, /register/, /sign.?up/, /entry/, /filter/) ||
      screen.sections.some((s) => s.fieldLabel));

  const showList =
    edit?.showList ??
    hasType(contentTypes, /list/, /feed/, /results/, /items/, /catalog/, /grid/, /browse/);

  const showCards =
    edit?.showCards ??
    hasType(contentTypes, /card/, /tile/, /overview/, /dashboard/, /summary/);

  // Fall back to list if nothing specific was indicated
  const showFallbackList = !showForm && !showList && !showCards;

  const title = edit?.title ?? screen.title;
  const subtitle = edit?.subtitle ?? screen.subtitle;
  const primaryLabel = edit?.primaryLabel ?? screen.primaryAction.label;

  const listItems = inferListItems(screen.screenName, keySections);
  const cards = inferCards(screen.screenName, keySections);

  // ── action handler ─────────────────────────────────────────────────────────
  function handleAction(action: BuildScreenAction) {
    setState((prev) => ({ ...prev, lastActionId: action.id }));

    const overrideTarget = actionTargetOverrides?.[action.id];
    if (typeof overrideTarget === "number") {
      onNavigate(overrideTarget);
      return;
    }

    if (action.intent === "jump" && typeof action.targetIndex === "number") {
      onNavigate(action.targetIndex);
      return;
    }

    if (action.intent === "confirm") {
      setState((prev) => ({ ...prev, submitted: true }));
      onTriggerAction(action);
      return;
    }

    if (action.intent === "next") {
      onNavigate(currentIndex + 1);
      return;
    }

    if (action.intent === "back") {
      onNavigate(Math.max(0, currentIndex - 1));
      return;
    }

    onTriggerAction(action);
  }

  // ── frame classes ──────────────────────────────────────────────────────────
  const frameClass =
    deviceMode === "mobile"
      ? "max-w-[390px] mx-auto rounded-[2.5rem] border-[8px] border-slate-900 overflow-hidden shadow-2xl bg-white"
      : "rounded-2xl border border-slate-300 overflow-hidden shadow-lg bg-white";

  return (
    <div className={frameClass}>
      {/* Status bar — mobile only */}
      {deviceMode === "mobile" && (
        <div className="flex items-center justify-between bg-slate-900 px-5 py-1.5 text-white">
          <span className="text-[11px] font-semibold">9:41</span>
          <span className="text-[11px] font-semibold">LTE ▪ 100%</span>
        </div>
      )}

      {/* App nav bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: designSystem.colors.primary }}
      >
        <span className="text-sm font-bold text-white">{screen.screenName}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          Prototype
        </span>
      </div>

      {/* Screen body */}
      <div
        className="space-y-4 overflow-y-auto p-4"
        style={{
          backgroundColor: designSystem.colors.background,
          color: designSystem.colors.text,
          minHeight: deviceMode === "mobile" ? "480px" : "520px",
          maxHeight: deviceMode === "mobile" ? "600px" : "680px",
        }}
        key={`${screen.id}-${currentIndex}`}
      >
        {/* Header */}
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          navItems={navigation}
          primaryColor={designSystem.colors.primary}
        />

        {/* Success banner (post-submit) */}
        {state.submitted && (
          <SuccessBanner
            message={`${screen.primaryAction.intent === "confirm" ? "Submitted" : "Done"} — ${screen.screenName}`}
          />
        )}

        {/* Form */}
        {showForm && !state.submitted && (
          <FormSection
            sections={screen.sections}
            screenName={screen.screenName}
            formValues={state.formValues}
            onChange={(id, val) =>
              setState((prev) => ({
                ...prev,
                formValues: { ...prev.formValues, [id]: val },
              }))
            }
          />
        )}

        {/* List */}
        {(showList || showFallbackList) && !state.submitted && (
          <ListSection
            heading={keySections[0] || screen.screenName}
            items={listItems}
            selectedItem={state.selectedItem}
            onSelect={(idx) => setState((prev) => ({ ...prev, selectedItem: idx }))}
          />
        )}

        {/* Cards */}
        {showCards && !state.submitted && <CardsSection cards={cards} />}
      </div>

      {/* Action bar */}
      <div
        className="flex gap-2 border-t border-slate-100 px-4 py-3"
        style={{ backgroundColor: designSystem.colors.surface }}
      >
        {screen.secondaryActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              state.lastActionId === action.id
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {edit?.secondaryLabels?.[action.id] ?? action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleAction(screen.primaryAction)}
          disabled={state.submitted}
          className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{
            backgroundColor:
              state.lastActionId === screen.primaryAction.id
                ? designSystem.colors.accent
                : designSystem.colors.primary,
          }}
        >
          {primaryLabel}
        </button>
      </div>

      {/* Home bar — mobile only */}
      {deviceMode === "mobile" && (
        <div className="flex justify-center bg-white pb-2 pt-1">
          <div className="h-1 w-28 rounded-full bg-slate-300" />
        </div>
      )}
    </div>
  );
}
