"use client";

import { useState } from "react";
import type { EnhancedBuildScreen, UIComponent, InteractionAction, FormField } from "@/types";

interface EnhancedInteractiveScreenProps {
  screen: EnhancedBuildScreen;
  deviceMode: "mobile" | "desktop";
  currentIndex: number;
  onNavigate: (index: number) => void;
  onTriggerAction: (action: InteractionAction) => void;
  showAnnotations?: boolean;
  showRationale?: boolean;
}

export default function EnhancedInteractiveScreen({
  screen,
  deviceMode,
  currentIndex,
  onNavigate,
  onTriggerAction,
  showAnnotations = false,
  showRationale = false,
}: EnhancedInteractiveScreenProps) {
  const [screenState, setScreenState] = useState<Record<string, unknown>>({
    selectedItem: null,
    formValue: "",
    formErrors: {},
  });

  const frameClass = deviceMode === "mobile"
    ? "w-full max-w-sm mx-auto rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden bg-white"
    : "w-full rounded-lg border border-slate-300 shadow-lg overflow-hidden bg-white";

  return (
    <div className="space-y-6">
      {/* Device Frame */}
      <div className={frameClass}>
        <div className="min-h-[600px] bg-white p-6 space-y-6 overflow-y-auto">
          {screen.components.map((component) => (
            <RenderComponent
              key={component.id}
              component={component}
              screen={screen}
              state={screenState}
              setState={setScreenState}
              onTriggerAction={onTriggerAction}
              showAnnotations={showAnnotations}
            />
          ))}

          {/* Actions */}
          {Object.values(screen.interactions).length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              {Object.values(screen.interactions).map((action) => (
                <ActionButton
                  key={action.id}
                  action={action}
                  onClick={() => onTriggerAction(action)}
                  disabled={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{screen.screenName}</p>
            <p className="text-xs text-slate-600 mt-1">
              Screen {screen.metadata?.index ? screen.metadata.index + 1 : currentIndex + 1} of{" "}
              {screen.metadata?.total || "?"}
            </p>
          </div>
          {showRationale && screen.rationale && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900">
                Why this screen?
              </summary>
              <div className="mt-2 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <p><strong>Goal:</strong> {screen.rationale.whyThisScreen}</p>
                <p><strong>User benefit:</strong> {screen.rationale.userBenefit}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

interface RenderComponentProps {
  component: UIComponent;
  screen: EnhancedBuildScreen;
  state: Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
  onTriggerAction: (action: InteractionAction) => void;
  showAnnotations: boolean;
}

function RenderComponent({
  component,
  screen,
  state,
  setState,
  onTriggerAction,
  showAnnotations,
}: RenderComponentProps) {
  const annotation = showAnnotations && (
    <span className="inline-block mb-2 rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
      {component.type.replace("-", " ")}
    </span>
  );

  switch (component.type) {
    case "hero":
      return (
        <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
          {annotation}
          {component.title && (
            <h1 className="text-3xl font-bold text-slate-900">{component.title}</h1>
          )}
          {component.subtitle && (
            <p className="mt-3 text-lg text-slate-600">{component.subtitle}</p>
          )}
        </section>
      );

    case "form":
      return (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          {annotation}
          {component.title && (
            <h2 className="text-lg font-semibold text-slate-900">{component.title}</h2>
          )}
          {component.fields && component.fields.length > 0 && (
            <div className="space-y-3">
              {component.fields.map((field) => (
                <FormFieldComponent
                  key={field.id}
                  field={field}
                  value={(state[field.id] || field.defaultValue || "") as string}
                  onChange={(value) => setState({ ...state, [field.id]: value })}
                  error={(state as Record<string, Record<string, string>>).formErrors?.[field.id]}
                />
              ))}
            </div>
          )}
        </section>
      );

    case "list":
      return (
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-6">
          {annotation}
          {component.title && (
            <h2 className="font-semibold text-slate-900">{component.title}</h2>
          )}
          {component.items && (
            <div className="space-y-2">
              {component.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setState({ ...state, selectedItem: item.id })}
                  className={`w-full text-left rounded-lg border p-3 transition ${
                    state.selectedItem === item.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-600">{item.subtitle}</p>}
                  {item.metadata && <p className="text-xs text-slate-500">{item.metadata}</p>}
                </button>
              ))}
            </div>
          )}
        </section>
      );

    case "cards":
      return (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          {annotation}
          {component.title && (
            <h2 className="font-semibold text-slate-900">{component.title}</h2>
          )}
          {component.items && (
            <div className="grid gap-3">
              {component.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 hover:shadow-md transition cursor-pointer"
                >
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-sm text-slate-600">{item.subtitle}</p>
                  )}
                  {item.metadata && (
                    <p className="text-xs text-slate-500 mt-1">{item.metadata}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      );

    case "empty-state":
      return (
        <section className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          {annotation}
          {component.emptyStateContent && (
            <>
              <p className="font-semibold text-slate-900">{component.emptyStateContent.title}</p>
              <p className="text-sm text-slate-600 mt-2">{component.emptyStateContent.description}</p>
            </>
          )}
        </section>
      );

    case "loading-state":
      return (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
          {annotation}
          {component.loadingContent?.message && (
            <p className="text-sm text-slate-600">{component.loadingContent.message}</p>
          )}
          {[...Array(component.loadingContent?.skeletonCount || 3)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-slate-200 animate-pulse" />
          ))}
        </section>
      );

    case "error-state":
      return (
        <section className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          {annotation}
          {component.errorContent && (
            <div className="flex gap-3">
              <span className="text-red-600 text-xl font-bold flex-shrink-0">!</span>
              <div className="flex-1">
                <p className="font-semibold text-red-900">{component.errorContent.title}</p>
                <p className="text-sm text-red-700 mt-1">{component.errorContent.message}</p>
              </div>
            </div>
          )}
        </section>
      );

    case "success-state":
      return (
        <section className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
          {annotation}
          {component.successContent && (
            <div className="flex gap-3">
              <span className="text-green-600 text-xl font-bold flex-shrink-0">✓</span>
              <div className="flex-1">
                <p className="font-semibold text-green-900">{component.successContent.title}</p>
                <p className="text-sm text-green-700 mt-1">{component.successContent.message}</p>
              </div>
            </div>
          )}
        </section>
      );

    default:
      return null;
  }
}

function FormFieldComponent({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const commonInputClass = `w-full rounded-lg border px-3 py-2 text-sm transition ${
    error
      ? "border-red-300 bg-red-50 text-slate-900"
      : "border-slate-300 bg-white text-slate-900"
  }`;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-600">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${commonInputClass} resize-none min-h-24`}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonInputClass}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">{field.label}</span>
        </label>
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={commonInputClass}
        />
      )}

      {field.helperText && (
        <p className="text-xs text-slate-600 mt-1">{field.helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ActionButton({
  action,
  onClick,
  disabled = false,
}: {
  action: InteractionAction;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isPrimary = action.intent === "submit" || action.intent === "confirm";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2.5 font-semibold transition ${
        isPrimary
          ? "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100"
      }`}
    >
      {action.label}
    </button>
  );
}
