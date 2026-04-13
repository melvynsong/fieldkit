"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ProblemForm() {
  const input = useWorkflowStore((state) => state.problemInput);
  const isLoading = useWorkflowStore((state) => state.isAnalyzingProblem);
  const setProblemField = useWorkflowStore((state) => state.setProblemField);
  const analyzeProblem = useWorkflowStore((state) => state.analyzeProblem);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
        1. Problem Discovery
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Define the problem clearly before solution and screen generation.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Problem Statement *</span>
          <textarea
            rows={4}
            required
            value={input.problemStatement}
            onChange={(event) => setProblemField("problemStatement", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Who Is Affected *</span>
          <textarea
            rows={4}
            required
            value={input.affectedUsers}
            onChange={(event) => setProblemField("affectedUsers", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Business Context</span>
          <textarea
            rows={3}
            value={input.businessContext}
            onChange={(event) => setProblemField("businessContext", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Constraints</span>
          <textarea
            rows={3}
            value={input.constraints}
            onChange={(event) => setProblemField("constraints", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-800">Additional Notes</span>
        <textarea
          rows={3}
          value={input.additionalNotes}
          onChange={(event) => setProblemField("additionalNotes", event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="button"
        onClick={() => void analyzeProblem()}
        disabled={isLoading}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Analyzing & Generating..." : "Analyze & Generate Solution Plan"}
      </button>
    </section>
  );
}
