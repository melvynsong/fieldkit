"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ScaleWorkspace() {
  const artifacts = useWorkflowStore((state) => state.scaleArtifacts);
  const generateScaleArtifacts = useWorkflowStore((state) => state.generateScaleArtifacts);
  const isGeneratingScale = useWorkflowStore((state) => state.isGeneratingScale);
  const hasInputs = useWorkflowStore(
    (state) => Boolean(state.problemDiscovery) && Boolean(state.designSystem)
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stage 4. Scale</h2>
          <p className="mt-1 text-sm text-slate-600">
            Generate delivery artifacts from the problem definition, planned screens, and design direction.
          </p>
        </div>

        <button
          type="button"
          onClick={generateScaleArtifacts}
          disabled={!hasInputs || isGeneratingScale}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isGeneratingScale ? "Generating..." : "Generate Scale Artifacts"}
        </button>
      </div>

      {!artifacts ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No scale artifacts yet. Generate artifacts after completing Problem Discovery and Design.
        </p>
      ) : null}

      {artifacts ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            {artifacts.contextSummary}
          </p>

          {artifacts.epics.map((epic) => (
            <article key={epic.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.11em] text-slate-500">Epic</h3>
              <p className="mt-1 text-base font-semibold text-slate-900">{epic.title}</p>
              <p className="mt-1 text-sm text-slate-700">{epic.objective}</p>

              <div className="mt-3 space-y-3">
                {epic.features.map((feature) => (
                  <section key={feature.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Feature
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{feature.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{feature.summary}</p>

                    <div className="mt-3 space-y-3">
                      {feature.userStories.map((story) => (
                        <article key={story.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <h5 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                            User Story
                          </h5>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{story.title}</p>
                          <p className="mt-1 text-sm text-slate-700">{story.statement}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Linked screen: {story.linkedScreenName}
                          </p>

                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                              Acceptance Criteria
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {story.acceptanceCriteria.map((criterion) => (
                                <li key={criterion}>{criterion}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                              Test Cases
                            </p>
                            <div className="mt-2 space-y-2">
                              {story.testCases.map((testCase) => (
                                <section
                                  key={testCase.title}
                                  className="rounded-md border border-slate-200 bg-white p-2"
                                >
                                  <p className="text-sm font-semibold text-slate-800">{testCase.title}</p>
                                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-slate-600">
                                    {testCase.steps.map((step) => (
                                      <li key={step}>{step}</li>
                                    ))}
                                  </ol>
                                  <p className="mt-2 text-xs text-slate-700">
                                    Expected: {testCase.expectedResult}
                                  </p>
                                </section>
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
