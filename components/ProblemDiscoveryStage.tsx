"use client";

import { useEffect, useRef } from "react";
import ProblemForm from "@/components/ProblemForm";
import SolutionPlanEditor from "@/components/SolutionPlanEditor";
import { useWorkflowStore } from "@/lib/workflowStore";

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-[8px] border border-gov-border bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ProblemDiscoveryStage() {
  const discovery = useWorkflowStore((state) => state.problemDiscovery);
  const isAnalyzingProblem = useWorkflowStore((state) => state.isAnalyzingProblem);
  const setCurrentStage = useWorkflowStore((state) => state.setCurrentStage);
  const resultsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!discovery || isAnalyzingProblem) {
      return;
    }

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [discovery, isAnalyzingProblem]);

  return (
    <section className="rounded-[10px] border border-gov-border bg-white p-4 sm:p-6">
      <ProblemForm />

      {isAnalyzingProblem ? (
        <section className="mt-4 rounded-[8px] border border-gov-border bg-gov-page-bg p-4">
          <p className="text-sm font-semibold text-gov-navy">Analysing problem and generating solution plan...</p>
          <p className="mt-1 text-xs text-gov-muted">Please wait while Stage 1 outputs are prepared.</p>
        </section>
      ) : null}

      {discovery ? (
        <section ref={resultsRef} className="mt-4 space-y-4 rounded-[8px] border border-gov-border bg-gov-page-bg p-4">
          <header>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gov-muted">AI Problem Analysis</h3>
          </header>

          <article className="rounded-[8px] border border-gov-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">Core Problem</p>
            <p className="mt-2 text-sm text-slate-700">{discovery.analysis.coreProblem}</p>
          </article>

          <div className="grid gap-3 md:grid-cols-2">
            <ListSection title="Root Causes" items={discovery.analysis.rootCauses} />
            <ListSection title="Solution Directions" items={discovery.analysis.solutionDirections} />
            <ListSection title="Assumptions" items={discovery.analysis.assumptions} />
            <ListSection title="Unknowns" items={discovery.analysis.unknowns} />
          </div>

          <header>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gov-muted">Problem Definition</h3>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-[8px] border border-gov-border bg-white p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">Real Problem</p>
              <p className="mt-2 text-sm text-slate-700">{discovery.definition.realProblem}</p>
            </article>
            <article className="rounded-[8px] border border-gov-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">Who Is Affected</p>
              <p className="mt-2 text-sm text-slate-700">{discovery.definition.affectedAndWhy}</p>
            </article>
            <article className="rounded-[8px] border border-gov-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">If We Do Nothing</p>
              <p className="mt-2 text-sm text-slate-700">{discovery.definition.inactionImpact}</p>
            </article>
            <article className="rounded-[8px] border border-gov-border bg-white p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">Validation Approach</p>
              <p className="mt-2 text-sm text-slate-700">{discovery.definition.simplestValidation}</p>
            </article>
          </div>

          <SolutionPlanEditor />

          <section className="rounded-[8px] border border-gov-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-gov-muted">Checkpoint Action</p>
            <p className="mt-1 text-sm text-gov-muted">
              Review and refine the solution plan before moving to Stage 2 Design.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCurrentStage("problem-discovery")}
                className="rounded-[6px] border border-gov-border bg-white px-4 py-2 text-sm font-semibold text-gov-navy"
              >
                Refine Solution
              </button>
              <button
                type="button"
                onClick={() => setCurrentStage("design")}
                className="rounded-[6px] bg-gov-navy px-4 py-2 text-sm font-semibold text-white"
              >
                Proceed to Design
              </button>
            </div>
          </section>
        </section>
      ) : null}
    </section>
  );
}
