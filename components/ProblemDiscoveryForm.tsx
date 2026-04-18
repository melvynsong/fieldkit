"use client";

import { useState } from "react";
import ProblemDiscoveryResult from "@/components/ProblemDiscoveryResult";
import type {
  ProblemDiscoveryApiResponse,
  ProblemDiscoveryInput,
  ProblemDiscoveryResult as ProblemDiscoveryResultType,
} from "@/types/problem-discovery";

const INITIAL_INPUT: ProblemDiscoveryInput = {
  problemStatement: "",
  affectedUsers: "",
  businessContext: "",
  constraints: "",
  additionalNotes: "",
};

export default function ProblemDiscoveryForm() {
  const [form, setForm] = useState<ProblemDiscoveryInput>(INITIAL_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProblemDiscoveryResultType | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  function updateField<K extends keyof ProblemDiscoveryInput>(key: K, value: ProblemDiscoveryInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/fieldkit/api/problem-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as ProblemDiscoveryApiResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Problem analysis failed.");
      }

      setResult(payload.result);
      setFallbackUsed(Boolean(payload.fallbackUsed));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unexpected failure while running problem analysis."
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Problem Statement *</span>
            <textarea
              required
              rows={4}
              value={form.problemStatement}
              onChange={(e) => updateField("problemStatement", e.target.value)}
              placeholder="Describe the product problem clearly"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Who Is Affected *</span>
            <textarea
              required
              rows={4}
              value={form.affectedUsers}
              onChange={(e) => updateField("affectedUsers", e.target.value)}
              placeholder="Identify users experiencing the problem"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Business Context</span>
            <textarea
              rows={3}
              value={form.businessContext}
              onChange={(e) => updateField("businessContext", e.target.value)}
              placeholder="Optional context: goals, KPI impact, domain"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Constraints</span>
            <textarea
              rows={3}
              value={form.constraints}
              onChange={(e) => updateField("constraints", e.target.value)}
              placeholder="Optional constraints: policy, budget, legal, time"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Additional Notes</span>
          <textarea
            rows={3}
            value={form.additionalNotes}
            onChange={(e) => updateField("additionalNotes", e.target.value)}
            placeholder="Optional notes and open questions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Analyzing..." : "Run Problem Discovery"}
          </button>
          <p className="text-xs text-slate-500">
            Focused on problem clarity only. No UI or architecture recommendations.
          </p>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </form>

      {result ? <ProblemDiscoveryResult result={result} fallbackUsed={fallbackUsed} /> : null}
    </div>
  );
}
