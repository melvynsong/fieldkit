"use client";

import ProblemForm from "@/components/ProblemForm";
import SolutionPlanEditor from "@/components/SolutionPlanEditor";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function ProblemDiscoveryStage() {
  const discovery = useWorkflowStore((state) => state.problemDiscovery);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Stage 1. Problem Discovery</h2>
        <p className="mt-1 text-sm text-slate-600">
          Define the problem, solution, and screen-level responsibilities that drive downstream stages.
        </p>
      </header>

      <ProblemForm />
      <SolutionPlanEditor />

      {discovery ? (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Stage 1 Output Snapshot
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Real Problem</p>
              <p className="mt-1 text-sm text-slate-700">{discovery.definition.realProblem}</p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposed Solution</p>
              <p className="mt-1 text-sm text-slate-700">{discovery.hypothesis.solutionApproach}</p>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  );
}
