import { NextRequest, NextResponse } from "next/server";
import { buildProblemDiscoveryPrompt } from "@/lib/problem-discovery-prompt";
import type { ProblemDiscovery, WorkflowApiResult } from "@/types";

function toLegacyResultShape(data: ProblemDiscovery) {
  return {
    aiProblemAnalysis: {
      coreProblem: data.analysis.coreProblem,
      likelyRootCauses: data.analysis.rootCauses,
      solutionDirections: data.analysis.solutionDirections,
      assumptions: data.analysis.assumptions,
      uncertainties: data.analysis.unknowns,
    },
    problemDiscoveryA: {
      realProblem: data.definition.realProblem,
      whoAndWhyItMatters: data.definition.affectedAndWhy,
      doNothingImpact: data.definition.inactionImpact,
      simplestValidation: data.definition.simplestValidation,
    },
    problemDiscoveryB: {
      solutionApproach: data.hypothesis.solutionApproach,
      numberOfScreensRequired: data.hypothesis.numberOfScreens,
      screenBreakdown: data.hypothesis.screenBreakdown,
    },
    keyAssumptions: data.keyAssumptions,
    validationRecommendation: data.validationRecommendation,
  };
}

interface OpenAIResponsesPayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

function toOutputText(payload: OpenAIResponsesPayload): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((entry) => entry.type === "output_text" && typeof entry.text === "string")
      .map((entry) => entry.text as string)
      .join("\n") ?? ""
  ).trim();
}

function parseJsonSafe(rawText: string): unknown | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first < 0 || last <= first) return null;

    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      return null;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function toArray(value: unknown, fallback: string): string[] {
  if (!Array.isArray(value)) return [fallback];
  const out = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return out.length ? out : [fallback];
}

function normalizeProblemDiscovery(raw: unknown): ProblemDiscovery {
  const source = isRecord(raw) ? raw : {};
  const analysis = isRecord(source.analysis) ? source.analysis : {};
  const definition = isRecord(source.definition) ? source.definition : {};
  const hypothesis = isRecord(source.hypothesis) ? source.hypothesis : {};

  const screenBreakdownRaw = Array.isArray(hypothesis.screenBreakdown)
    ? hypothesis.screenBreakdown
    : [];

  return {
    analysis: {
      coreProblem: toStringValue(analysis.coreProblem, "Core problem not clearly identified."),
      rootCauses: toArray(analysis.rootCauses, "Potential root cause not specified."),
      solutionDirections: toArray(
        analysis.solutionDirections,
        "Potential solution direction not specified."
      ),
      assumptions: toArray(analysis.assumptions, "No explicit assumption provided."),
      unknowns: toArray(analysis.unknowns, "Unknowns were not specified."),
    },
    definition: {
      realProblem: toStringValue(definition.realProblem, "Real problem not stated."),
      affectedAndWhy: toStringValue(definition.affectedAndWhy, "Affected users not stated."),
      inactionImpact: toStringValue(definition.inactionImpact, "Inaction impact not stated."),
      simplestValidation: toStringValue(
        definition.simplestValidation,
        "Run a small user validation experiment."
      ),
    },
    hypothesis: {
      solutionApproach: toStringValue(
        hypothesis.solutionApproach,
        "Solution approach not provided."
      ),
      numberOfScreens: Number.isFinite(hypothesis.numberOfScreens)
        ? Math.max(1, Number(hypothesis.numberOfScreens))
        : Math.max(1, screenBreakdownRaw.length),
      screenBreakdown: screenBreakdownRaw.length
        ? screenBreakdownRaw.map((screen, index) => {
            const sourceScreen = isRecord(screen) ? screen : {};
            return {
              screenName: toStringValue(sourceScreen.screenName, `Screen ${index + 1}`),
              userAction: toStringValue(sourceScreen.userAction, "User action not specified."),
              problemResolution: toStringValue(
                sourceScreen.problemResolution,
                "Resolution path not specified."
              ),
            };
          })
        : [
            {
              screenName: "Core Flow",
              userAction: "Complete key action",
              problemResolution: "Addresses the core problem path.",
            },
          ],
    },
    keyAssumptions: toArray(source.keyAssumptions, "Key assumptions were not provided."),
    validationRecommendation: toStringValue(
      source.validationRecommendation,
      "Run one lightweight validation experiment with target users."
    ),
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing OPENAI_API_KEY configuration.",
        data: normalizeProblemDiscovery(null),
        result: toLegacyResultShape(normalizeProblemDiscovery(null)),
      } satisfies WorkflowApiResult<ProblemDiscovery>,
      { status: 500 }
    );
  }

  const body = (await request.json()) as {
    problemStatement?: string;
    affectedUsers?: string;
    businessContext?: string;
    constraints?: string;
    additionalNotes?: string;
  };

  if (!body.problemStatement?.trim() || !body.affectedUsers?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Problem Statement and Who Is Affected are required.",
        data: normalizeProblemDiscovery(null),
        result: toLegacyResultShape(normalizeProblemDiscovery(null)),
      } satisfies WorkflowApiResult<ProblemDiscovery>,
      { status: 400 }
    );
  }

  const prompt = buildProblemDiscoveryPrompt({
    problemStatement: body.problemStatement,
    affectedUsers: body.affectedUsers,
    businessContext: body.businessContext,
    constraints: body.constraints,
    additionalNotes: body.additionalNotes,
  });

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "You are a senior Product Manager practicing disciplined problem-first thinking.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "OpenAI Responses API request failed.",
          data: normalizeProblemDiscovery(null),
          result: toLegacyResultShape(normalizeProblemDiscovery(null)),
        } satisfies WorkflowApiResult<ProblemDiscovery>,
        { status: 502 }
      );
    }

    const payload = (await response.json()) as OpenAIResponsesPayload;
    const rawText = toOutputText(payload);
    const parsed = parseJsonSafe(rawText);
    const normalized = normalizeProblemDiscovery(parsed);

    return NextResponse.json({
      ok: true,
      data: normalized,
      result: toLegacyResultShape(normalized),
      rawText,
      fallbackUsed: !parsed,
    } satisfies WorkflowApiResult<ProblemDiscovery>);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Problem discovery request failed unexpectedly.",
        data: normalizeProblemDiscovery(null),
        result: toLegacyResultShape(normalizeProblemDiscovery(null)),
      } satisfies WorkflowApiResult<ProblemDiscovery>,
      { status: 500 }
    );
  }
}
