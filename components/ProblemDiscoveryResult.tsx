import type { ProblemDiscoveryResult as ProblemDiscoveryResultType } from "@/types/problem-discovery";

interface ProblemDiscoveryResultProps {
  result: ProblemDiscoveryResultType;
  fallbackUsed?: boolean;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.11em] text-slate-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ProblemDiscoveryResult({
  result,
  fallbackUsed,
}: ProblemDiscoveryResultProps) {
  return (
    <div className="space-y-4">
      {fallbackUsed ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Model response was partially malformed. Rendering normalized fallback structure.
        </p>
      ) : null}

      <Section title="AI Problem Analysis">
        <p className="text-sm leading-6 text-slate-800">{result.aiProblemAnalysis.coreProblem}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Likely Root Causes</p>
            <BulletList items={result.aiProblemAnalysis.likelyRootCauses} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Solution Directions</p>
            <BulletList items={result.aiProblemAnalysis.solutionDirections} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Assumptions</p>
            <BulletList items={result.aiProblemAnalysis.assumptions} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Uncertainties</p>
            <BulletList items={result.aiProblemAnalysis.uncertainties} />
          </div>
        </div>
      </Section>

      <Section title="Problem Discovery A">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">What is the real problem?</dt>
            <dd className="mt-1 leading-6 text-slate-700">{result.problemDiscoveryA.realProblem}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">Who is affected and why does it matter?</dt>
            <dd className="mt-1 leading-6 text-slate-700">{result.problemDiscoveryA.whoAndWhyItMatters}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">What happens if we do nothing?</dt>
            <dd className="mt-1 leading-6 text-slate-700">{result.problemDiscoveryA.doNothingImpact}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">Simplest validation</dt>
            <dd className="mt-1 leading-6 text-slate-700">{result.problemDiscoveryA.simplestValidation}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Problem Discovery B">
        <p className="text-sm leading-6 text-slate-700">{result.problemDiscoveryB.solutionApproach}</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">
          Minimum screens required: {result.problemDiscoveryB.numberOfScreensRequired}
        </p>
        <div className="mt-3 space-y-2">
          {result.problemDiscoveryB.screenBreakdown.map((screen, index) => (
            <article key={`${screen.screenName}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{screen.screenName}</p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-medium">User does:</span> {screen.userAction}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-medium">Problem solved by:</span> {screen.problemResolution}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Key Assumptions">
        <BulletList items={result.keyAssumptions} />
      </Section>

      <Section title="Validation Recommendation">
        <p className="text-sm leading-6 text-slate-700">{result.validationRecommendation}</p>
      </Section>
    </div>
  );
}
