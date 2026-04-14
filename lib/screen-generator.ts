import type { DesignSystem, GeneratedScreen, ProblemDiscovery, ScreenGenerationResult } from "@/types";

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
  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned : [fallback];
}

export function buildGenerateScreensPrompt(
  problem: ProblemDiscovery,
  design: DesignSystem,
  plannedScreens?: Array<{ screenName: string; userAction: string; purpose: string }>,
  chatInstruction?: string
): string {
  return [
    "You are a product flow planner and prototype scaffolding assistant.",
    "Use the provided problem discovery and design system to generate practical screen definitions.",
    "Match the number of screens to the planned screen count provided.",
    "No code.",
    "No technical architecture.",
    "",
    "Return strict JSON only:",
    JSON.stringify(
      {
        screens: [
          {
            id: "screen-1",
            screenName: "string",
            userAction: "string",
            purpose: "string",
            keySections: ["string"],
            contentTypes: ["text", "list", "actions"],
          },
          {
            id: "screen-2",
            screenName: "string",
            userAction: "string",
            purpose: "string",
            keySections: ["string"],
            contentTypes: ["text", "list", "actions"],
          },
          {
            id: "screen-3",
            screenName: "string",
            userAction: "string",
            purpose: "string",
            keySections: ["string"],
            contentTypes: ["text", "list", "actions"],
          },
        ],
        navigation: ["string"],
        notes: ["string"],
      },
      null,
      2
    ),
    "",
    "Rules:",
    "- Tie each screen back to the problem",
    "- Preserve planned screen intent: screenName + userAction + purpose alignment",
    "- Generate EXACTLY as many screens as planned (do not reduce or add beyond what is planned)",
    "- Apply tone/density/layout consistency from design system",
    "- If chat instruction exists, refine existing direction accordingly",
    "",
    "Problem Discovery:",
    JSON.stringify(problem, null, 2),
    "",
    "Design System:",
    JSON.stringify(design, null, 2),
    "",
    "Planned Screens (generate this many screens, preserving their intent):",
    JSON.stringify(plannedScreens || [], null, 2),
    "",
    `Chat Instruction: ${chatInstruction || "N/A"}`,
  ].join("\n");
}

export function normalizeScreenGeneration(raw: unknown): ScreenGenerationResult {
  const source = isRecord(raw) ? raw : {};

  const rawScreens = Array.isArray(source.screens) ? source.screens : [];
  const screens: GeneratedScreen[] = rawScreens.map((value, index) => {
    const screen = isRecord(value) ? value : {};
    return {
      id: toStringValue(screen.id, `screen-${index + 1}`),
      screenName: toStringValue(screen.screenName, `Screen ${index + 1}`),
      userAction: toStringValue(screen.userAction, "Complete the intended user task."),
      purpose: toStringValue(screen.purpose, "Purpose not specified."),
      plannedUserAction: toStringValue(
        screen.plannedUserAction,
        toStringValue(screen.userAction, "Complete the intended user task.")
      ),
      plannedPurpose: toStringValue(
        screen.plannedPurpose,
        toStringValue(screen.purpose, "Purpose not specified.")
      ),
      keySections: toArray(screen.keySections, "Primary content"),
      contentTypes: toArray(screen.contentTypes, "text"),
    };
  });

  const safeScreens = screens.length
    ? screens
    : [
        {
          id: "screen-1",
          screenName: "Core Flow",
          userAction: "Complete the core task",
          purpose: "Provide a minimal path to solve the identified problem.",
          plannedUserAction: "Complete the core task",
          plannedPurpose: "Provide a minimal path to solve the identified problem.",
          keySections: ["Header", "Main Content", "Action Area"],
          contentTypes: ["text", "actions"],
        },
      ];

  return {
    screens: safeScreens,
    navigation: toArray(source.navigation, "Home"),
    notes: toArray(source.notes, "Generated using available problem and design context."),
  };
}

export function parseJsonSafe(rawText: string): unknown | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      return null;
    }

    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
}
