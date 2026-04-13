export interface ProblemDiscoveryInput {
  problemStatement: string;
  affectedUsers: string;
  businessContext?: string;
  constraints?: string;
  additionalNotes?: string;
}

export interface AIProblemAnalysis {
  coreProblem: string;
  likelyRootCauses: string[];
  solutionDirections: string[];
  assumptions: string[];
  uncertainties: string[];
}

export interface ProblemDiscoveryA {
  realProblem: string;
  whoAndWhyItMatters: string;
  doNothingImpact: string;
  simplestValidation: string;
}

export interface ProblemDiscoveryBScreen {
  screenName: string;
  userAction: string;
  problemResolution: string;
}

export interface ProblemDiscoveryB {
  solutionApproach: string;
  numberOfScreensRequired: number;
  screenBreakdown: ProblemDiscoveryBScreen[];
}

export interface ProblemDiscoveryResult {
  aiProblemAnalysis: AIProblemAnalysis;
  problemDiscoveryA: ProblemDiscoveryA;
  problemDiscoveryB: ProblemDiscoveryB;
  keyAssumptions: string[];
  validationRecommendation: string;
}

export interface ProblemDiscoveryApiResponse {
  ok: boolean;
  result: ProblemDiscoveryResult;
  rawText?: string;
  fallbackUsed?: boolean;
  error?: string;
}

const FALLBACK_RESULT: ProblemDiscoveryResult = {
  aiProblemAnalysis: {
    coreProblem: "Problem analysis unavailable from model output.",
    likelyRootCauses: ["Insufficient structured response from AI model."],
    solutionDirections: ["Re-run analysis with a clearer problem statement."],
    assumptions: ["The current input may be missing context."],
    uncertainties: ["No validated model output could be parsed."],
  },
  problemDiscoveryA: {
    realProblem: "Unable to determine reliably from response.",
    whoAndWhyItMatters: "Affected users and impact were not clearly parsed.",
    doNothingImpact: "Risk of continuing unresolved pain points.",
    simplestValidation: "Run one user interview and one usability walkthrough.",
  },
  problemDiscoveryB: {
    solutionApproach: "Insufficient output to derive a valid approach.",
    numberOfScreensRequired: 1,
    screenBreakdown: [
      {
        screenName: "Core Problem Validation",
        userAction: "Describe the current workflow and pain.",
        problemResolution: "Creates clarity before defining solution scope.",
      },
    ],
  },
  keyAssumptions: ["Response could not be parsed into required structure."],
  validationRecommendation: "Collect missing details and run the analysis again.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toStringArray(value: unknown, fallback: string): string[] {
  if (!Array.isArray(value)) {
    return [fallback];
  }

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.length ? cleaned : [fallback];
}

function normalizeScreen(value: unknown): ProblemDiscoveryBScreen {
  const source = isRecord(value) ? value : {};

  return {
    screenName: toStringValue(source.screenName, "Untitled Screen"),
    userAction: toStringValue(source.userAction, "Action not specified."),
    problemResolution: toStringValue(
      source.problemResolution,
      "Resolution contribution not specified."
    ),
  };
}

export function normalizeProblemDiscoveryResult(raw: unknown): ProblemDiscoveryResult {
  const source = isRecord(raw) ? raw : {};
  const analysis = isRecord(source.aiProblemAnalysis) ? source.aiProblemAnalysis : {};
  const discoveryA = isRecord(source.problemDiscoveryA) ? source.problemDiscoveryA : {};
  const discoveryB = isRecord(source.problemDiscoveryB) ? source.problemDiscoveryB : {};

  const screenBreakdown = Array.isArray(discoveryB.screenBreakdown)
    ? discoveryB.screenBreakdown.map(normalizeScreen)
    : FALLBACK_RESULT.problemDiscoveryB.screenBreakdown;

  const numberOfScreensRaw =
    typeof discoveryB.numberOfScreensRequired === "number"
      ? discoveryB.numberOfScreensRequired
      : Number.parseInt(String(discoveryB.numberOfScreensRequired ?? "0"), 10);

  return {
    aiProblemAnalysis: {
      coreProblem: toStringValue(
        analysis.coreProblem,
        FALLBACK_RESULT.aiProblemAnalysis.coreProblem
      ),
      likelyRootCauses: toStringArray(
        analysis.likelyRootCauses,
        FALLBACK_RESULT.aiProblemAnalysis.likelyRootCauses[0]
      ),
      solutionDirections: toStringArray(
        analysis.solutionDirections,
        FALLBACK_RESULT.aiProblemAnalysis.solutionDirections[0]
      ),
      assumptions: toStringArray(
        analysis.assumptions,
        FALLBACK_RESULT.aiProblemAnalysis.assumptions[0]
      ),
      uncertainties: toStringArray(
        analysis.uncertainties,
        FALLBACK_RESULT.aiProblemAnalysis.uncertainties[0]
      ),
    },
    problemDiscoveryA: {
      realProblem: toStringValue(
        discoveryA.realProblem,
        FALLBACK_RESULT.problemDiscoveryA.realProblem
      ),
      whoAndWhyItMatters: toStringValue(
        discoveryA.whoAndWhyItMatters,
        FALLBACK_RESULT.problemDiscoveryA.whoAndWhyItMatters
      ),
      doNothingImpact: toStringValue(
        discoveryA.doNothingImpact,
        FALLBACK_RESULT.problemDiscoveryA.doNothingImpact
      ),
      simplestValidation: toStringValue(
        discoveryA.simplestValidation,
        FALLBACK_RESULT.problemDiscoveryA.simplestValidation
      ),
    },
    problemDiscoveryB: {
      solutionApproach: toStringValue(
        discoveryB.solutionApproach,
        FALLBACK_RESULT.problemDiscoveryB.solutionApproach
      ),
      numberOfScreensRequired:
        Number.isFinite(numberOfScreensRaw) && numberOfScreensRaw > 0
          ? numberOfScreensRaw
          : Math.max(screenBreakdown.length, 1),
      screenBreakdown,
    },
    keyAssumptions: toStringArray(
      source.keyAssumptions,
      FALLBACK_RESULT.keyAssumptions[0]
    ),
    validationRecommendation: toStringValue(
      source.validationRecommendation,
      FALLBACK_RESULT.validationRecommendation
    ),
  };
}

export function parseProblemDiscoveryJson(rawText: string): unknown | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

export function getFallbackProblemDiscoveryResult(): ProblemDiscoveryResult {
  return FALLBACK_RESULT;
}
