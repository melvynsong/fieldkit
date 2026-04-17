"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function DesignWorkspace() {
  const problemDiscovery = useWorkflowStore((state) => state.problemDiscovery);
  const solutionPlan = useWorkflowStore((state) => state.solutionPlan);
  const generatedScreens = useWorkflowStore((state) => state.generatedScreens);
  const selectedScreenId = useWorkflowStore((state) => state.selectedScreenId);
  const setSelectedScreenId = useWorkflowStore((state) => state.setSelectedScreenId);
  const generateScreens = useWorkflowStore((state) => state.generateScreens);
  const isGeneratingScreens = useWorkflowStore((state) => state.isGeneratingScreens);
  const tone = useWorkflowStore((state) => state.designSystem?.tone ?? "hybrid");
  const density = useWorkflowStore((state) => state.designSystem?.density ?? "comfortable");
  const setDesignTone = useWorkflowStore((state) => state.setDesignTone);
  const setDesignDensity = useWorkflowStore((state) => state.setDesignDensity);
  const setDesignFiles = useWorkflowStore((state) => state.setDesignFiles);
  const isExtracting = useWorkflowStore((state) => state.isExtractingDesign);
  const extractDesign = useWorkflowStore((state) => state.extractDesign);
  const design = useWorkflowStore((state) => state.designSystem);

  const canGenerate =
    Boolean(problemDiscovery) && solutionPlan.status === "ready-for-generation";
  const activeId = selectedScreenId ?? solutionPlan.screens[0]?.id;
  const generatedCount = generatedScreens?.screens.length ?? 0;

  const activeScreen =
    generatedScreens?.screens.find((s) => s.id === activeId) ??
    generatedScreens?.screens[0] ??
    null;

  return (
    <section className="rounded-[10px] border border-gov-border bg-white">

      {/* ── top bar: screen tabs + generate ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gov-border px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {solutionPlan.screens.length ? (
            solutionPlan.screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => setSelectedScreenId(screen.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  activeId === screen.id
                    ? "border-gov-navy bg-gov-navy text-white"
                    : "border-gov-border bg-gov-page-bg text-gov-navy hover:bg-gov-navy-light"
                }`}
              >
                {screen.screenName}
              </button>
            ))
          ) : (
            <p className="text-xs text-gov-muted">No screens planned yet — complete Stage 1 first.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void generateScreens()}
          disabled={!canGenerate || isGeneratingScreens}
          className="rounded-[6px] bg-gov-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a8222b] disabled:opacity-50"
        >
          {isGeneratingScreens
            ? "Generating…"
            : generatedCount
            ? `Regenerate Screens (${generatedCount})`
            : "Generate Screens →"}
        </button>
      </div>

      {/* ── style controls bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gov-border bg-gov-page-bg px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gov-muted">Tone</span>
          <select
            value={tone}
            onChange={(e) =>
              setDesignTone(e.target.value as "transactional" | "media" | "hybrid")
            }
            className="rounded-[6px] border border-gov-border bg-white px-2.5 py-1.5 text-xs text-gov-navy focus:outline-none"
          >
            <option value="transactional">Transactional</option>
            <option value="media">Media</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gov-muted">Density</span>
          <select
            value={density}
            onChange={(e) =>
              setDesignDensity(e.target.value as "compact" | "comfortable" | "spacious")
            }
            className="rounded-[6px] border border-gov-border bg-white px-2.5 py-1.5 text-xs text-gov-navy focus:outline-none"
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor="design-ref-upload"
            className="cursor-pointer rounded-[6px] border border-gov-border bg-white px-3 py-1.5 text-[11px] font-semibold text-gov-navy hover:bg-gov-navy-light transition"
          >
            Upload reference image
          </label>
          <input
            id="design-ref-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              setDesignFiles(Array.from(e.target.files ?? []));
              void extractDesign();
            }}
          />
          {isExtracting && (
            <span className="text-[11px] text-gov-muted">Extracting style…</span>
          )}
        </div>
      </div>

      {/* ── main: screen preview or generation status ──────────────────── */}
      <div className="p-5">
        {!generatedCount ? (
          /* empty state */
          <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-gov-border bg-gov-page-bg py-16 text-center">
            <p className="text-sm font-semibold text-gov-navy">No screens generated yet</p>
            <p className="mt-1 text-xs text-gov-muted">
              {canGenerate
                ? 'Click "Generate Screens →" above to create your prototype screens.'
                : "Complete Stage 1 and approve the solution plan first."}
            </p>
          </div>
        ) : (
          /* generated screens list */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gov-muted">
                {generatedCount} screen{generatedCount > 1 ? "s" : ""} generated — ready for Stage 3
              </p>
              {design && (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: design.colors.primary }}
                  />
                  <span className="text-[11px] text-gov-muted">
                    {design.tone} · {design.density}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {generatedScreens!.screens.map((screen, idx) => {
                const isActive = screen.id === activeId;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => setSelectedScreenId(screen.id)}
                    className={`rounded-[8px] border p-3 text-left transition ${
                      isActive
                        ? "border-gov-navy bg-gov-navy-light"
                        : "border-gov-border bg-white hover:bg-gov-page-bg"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold ${
                          isActive ? "text-gov-navy" : "text-gov-muted"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-gov-navy" : "text-slate-800"
                        }`}
                      >
                        {screen.screenName}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gov-muted line-clamp-2">
                      {screen.plannedPurpose || screen.userAction}
                    </p>
                    {screen.keySections?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {screen.keySections.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-gov-border bg-white px-2 py-0.5 text-[10px] text-gov-muted"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {activeScreen && (
              <div className="mt-2 rounded-[8px] border border-gov-border bg-gov-page-bg p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gov-muted mb-1">
                  Selected · {activeScreen.screenName}
                </p>
                <p className="text-sm text-slate-700 leading-6">{activeScreen.plannedPurpose}</p>
                {activeScreen.contentTypes?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeScreen.contentTypes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-gov-navy-light px-2 py-0.5 text-[10px] font-semibold text-gov-navy"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
