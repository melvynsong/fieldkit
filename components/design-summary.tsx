"use client";

import type { NormalizedDesign } from "@/lib/design-normalizer";

interface DesignSummaryProps {
  design?: NormalizedDesign;
}

export default function DesignSummary({ design }: DesignSummaryProps) {
  if (!design) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-700">
      <h2 className="mb-4 text-base font-semibold">Design Summary</h2>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {Object.entries(design).map(([key, value]) => (
          <div key={key}>
            <dt className="font-medium capitalize text-zinc-500 dark:text-zinc-400">
              {key}
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
              {String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
