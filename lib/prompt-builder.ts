import type { ProblemDiscoveryInput } from "@/types/problem-discovery";

export function buildPrompt(imageUrl: string): string {
  return `You are a design analysis assistant. Analyze the following design image and extract its key visual properties.

Image: ${imageUrl}

Return a JSON object with the following fields:
- colors: primary and secondary color palette (hex values)
- typography: font families and sizes used
- layout: overall layout structure (e.g. card, grid, list)
- spacing: spacing scale used (tight, normal, loose)
- components: list of UI components identified

Respond with valid JSON only.`;
}

export function buildProblemDiscoveryPrompt(input: ProblemDiscoveryInput): string {
  const sections = [
    "You are a senior Product Manager practicing disciplined, problem-first thinking.",
    "First, analyse the problem using AI reasoning, then structure the output.",
    "",
    "0. AI Problem Analysis",
    "- What is the core problem?",
    "- What are the likely root causes?",
    "- What solution directions or hypotheses exist?",
    "- What assumptions are being made?",
    "- What uncertainties or missing information exist?",
    "",
    "1. Problem Discovery A",
    "1. What is the real problem?",
    "2. Who is experiencing it and why does it matter?",
    "3. What happens if we do nothing?",
    "4. What is the simplest way to validate this?",
    "",
    "2. Problem Discovery B",
    "a. Solution Approach (Paragraph)",
    "- High-level approach",
    "- How it helps the user",
    "- No UI or technical detail",
    "b. Number of Screens Required",
    "- Minimum number only",
    "c. Screen Breakdown",
    "For each screen:",
    "- Screen Name",
    "- What the user does",
    "- How it solves the problem",
    "",
    "3. Key Assumptions",
    "",
    "4. Validation Recommendation",
    "",
    "STRICT RULES",
    "- No UI design details",
    "- No technical architecture",
    "- No over-engineering",
    "- Stay concise and structured",
    "- Clearly distinguish facts, assumptions, hypotheses",
    "",
    "OUTPUT FORMAT",
    "Return structured JSON only using these exact top-level sections and keys:",
    "{",
    '  "aiProblemAnalysis": {',
    '    "coreProblem": "string",',
    '    "likelyRootCauses": ["string"],',
    '    "solutionDirections": ["string"],',
    '    "assumptions": ["string"],',
    '    "uncertainties": ["string"]',
    "  },",
    '  "problemDiscoveryA": {',
    '    "realProblem": "string",',
    '    "whoAndWhyItMatters": "string",',
    '    "doNothingImpact": "string",',
    '    "simplestValidation": "string"',
    "  },",
    '  "problemDiscoveryB": {',
    '    "solutionApproach": "string",',
    '    "numberOfScreensRequired": 1,',
    '    "screenBreakdown": [',
    "      {",
    '        "screenName": "string",',
    '        "userAction": "string",',
    '        "problemResolution": "string"',
    "      }",
    "    ]",
    "  },",
    '  "keyAssumptions": ["string"],',
    '  "validationRecommendation": "string"',
    "}",
    "",
    "PROBLEM INPUT",
    `Problem Statement: ${input.problemStatement}`,
    `Who is affected: ${input.affectedUsers}`,
    `Business Context: ${input.businessContext || "N/A"}`,
    `Constraints: ${input.constraints || "N/A"}`,
    `Additional Notes: ${input.additionalNotes || "N/A"}`,
  ];

  return sections.join("\n");
}
