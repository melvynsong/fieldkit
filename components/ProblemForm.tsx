"use client";

import { useWorkflowStore } from "@/lib/workflowStore";

export default function ProblemForm() {
  const input = useWorkflowStore((state) => state.problemInput);
  const isLoading = useWorkflowStore((state) => state.isAnalyzingProblem);
  const setProblemField = useWorkflowStore((state) => state.setProblemField);
  const analyzeProblem = useWorkflowStore((state) => state.analyzeProblem);

  return (
    <section className="rounded-[10px] border border-gov-border bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-gov-red" />
        <hr className="flex-1 border-t border-gov-border" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Problem Statement <span className="text-gov-red">*</span>
          </span>
          <textarea
            rows={4}
            required
            value={input.problemStatement}
            onChange={(event) => setProblemField("problemStatement", event.target.value)}
            placeholder="Describe the core problem to be solved…"
            className="mt-1 w-full rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-2 text-sm transition placeholder:text-gov-muted focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Who is Affected <span className="text-gov-red">*</span>
          </span>
          <textarea
            rows={4}
            required
            value={input.affectedUsers}
            onChange={(event) => setProblemField("affectedUsers", event.target.value)}
            placeholder="Who experiences this problem and how does it affect them…"
            className="mt-1 w-full rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-2 text-sm transition placeholder:text-gov-muted focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Business Context</span>
          <textarea
            rows={3}
            value={input.businessContext}
            onChange={(event) => setProblemField("businessContext", event.target.value)}
            placeholder="Relevant organisational or strategic context…"
            className="mt-1 w-full rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-2 text-sm transition placeholder:text-gov-muted focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Constraints</span>
          <textarea
            rows={3}
            value={input.constraints}
            onChange={(event) => setProblemField("constraints", event.target.value)}
            placeholder="Technical, regulatory, or resource constraints…"
            className="mt-1 w-full rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-2 text-sm transition placeholder:text-gov-muted focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-800">Additional Notes</span>
        <textarea
          rows={3}
          value={input.additionalNotes}
          onChange={(event) => setProblemField("additionalNotes", event.target.value)}
          placeholder="Any other context, references, or background that may help…"
          className="mt-1 w-full rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-2 text-sm transition placeholder:text-gov-muted focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
        />
      </label>

      <button
        type="button"
        onClick={() => void analyzeProblem()}
        disabled={isLoading}
        className="mt-5 rounded-[6px] bg-gov-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a8222b] disabled:opacity-60"
      >
        {isLoading ? "Analysing & Generating..." : "Analyse & Generate Solution Plan"}
      </button>
    </section>
  );
}
