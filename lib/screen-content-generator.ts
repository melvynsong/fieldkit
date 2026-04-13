import type {
  BuildDesignControls,
  BuildDesignTokens,
  BuildScreen,
  BuildScreenAction,
  BuildScreenSection,
  DesignSystem,
  GeneratedScreen,
  ProblemDiscovery,
  SolutionPlan,
} from "@/types";

interface ScreenContentInput {
  generatedScreens: GeneratedScreen[];
  problemDiscovery: ProblemDiscovery | null;
  solutionPlan: SolutionPlan;
  designSystem: DesignSystem | null;
  controls: BuildDesignControls;
  tokens: BuildDesignTokens;
}

function tonePrefix(tone: BuildDesignControls["tone"]): string {
  if (tone === "premium") return "Premium experience";
  if (tone === "playful") return "Friendly experience";
  if (tone === "friendly") return "Human-centered experience";
  return "Professional experience";
}

function toneVoice(tone: BuildDesignControls["tone"]): string {
  if (tone === "premium") return "Concise, elevated, and confidence-building.";
  if (tone === "playful") return "Warm, energetic, and easy to follow.";
  if (tone === "friendly") return "Supportive, plain-language, and reassuring.";
  return "Clear, direct, and outcome-focused.";
}

function densityHint(density: BuildDesignControls["density"]): string {
  if (density === "compact") return "Compact content density emphasizes fast completion.";
  if (density === "spacious") return "Spacious layout gives users room to scan and decide.";
  return "Balanced spacing supports readability and speed.";
}

function buildSections(screen: GeneratedScreen, input: ScreenContentInput, index: number): BuildScreenSection[] {
  const problemLine = input.problemDiscovery?.definition.realProblem || "Core user problem";
  const sectionNames = screen.keySections.length ? screen.keySections : ["Overview", "Details", "Action"];

  return sectionNames.map((name, sectionIndex) => {
    const lowerName = name.toLowerCase();
    const includeField = /form|input|details|profile|search/.test(lowerName) || sectionIndex === 0;

    return {
      id: `${screen.id}-section-${sectionIndex + 1}`,
      heading: name,
      body:
        sectionIndex === 0
          ? `This area helps users ${screen.plannedUserAction.toLowerCase()} while staying aligned with: ${problemLine}.`
          : `Focused guidance for ${screen.plannedPurpose.toLowerCase()} with ${input.controls.emphasis} emphasis.`,
      bullets: [
        `User intent: ${screen.plannedUserAction}`,
        `Outcome target: ${screen.plannedPurpose}`,
        `Flow context: Step ${index + 1} of ${Math.max(1, input.generatedScreens.length)}`,
      ],
      fieldLabel: includeField ? "Input" : undefined,
      fieldPlaceholder: includeField ? `Enter details for ${screen.screenName.toLowerCase()}...` : undefined,
    };
  });
}

function buildActions(index: number, total: number, screenName: string): {
  primaryAction: BuildScreenAction;
  secondaryActions: BuildScreenAction[];
} {
  const primaryAction: BuildScreenAction =
    index >= total - 1
      ? {
          id: `${screenName}-confirm`,
          label: "Confirm",
          intent: "confirm",
        }
      : {
          id: `${screenName}-continue`,
          label: "Continue",
          intent: "next",
        };

  const secondaryActions: BuildScreenAction[] = [];

  if (index > 0) {
    secondaryActions.push({
      id: `${screenName}-back`,
      label: "Back",
      intent: "back",
    });
  }

  secondaryActions.push({
    id: `${screenName}-details`,
    label: "View Details",
    intent: "toggle",
    stateKey: `details-${screenName}`,
  });

  return { primaryAction, secondaryActions };
}

export function generateBuildScreens(input: ScreenContentInput): BuildScreen[] {
  if (!input.generatedScreens.length) {
    return [];
  }

  const flowGoal = input.solutionPlan.solution || "Resolve the core user problem with a focused flow.";

  return input.generatedScreens.map((screen, index) => {
    const { primaryAction, secondaryActions } = buildActions(index, input.generatedScreens.length, screen.id);

    return {
      id: `build-${screen.id}`,
      sourceScreenId: screen.id,
      screenName: screen.screenName,
      title: `${tonePrefix(input.controls.tone)}: ${screen.screenName}`,
      subtitle: screen.plannedPurpose,
      description: `${toneVoice(input.controls.tone)} ${densityHint(input.controls.density)} This screen contributes to: ${flowGoal}`,
      sections: buildSections(screen, input, index),
      chips: [
        `Style: ${input.controls.appStyle}`,
        `Tone: ${input.controls.tone}`,
        `Density: ${input.controls.density}`,
        `Rhythm: ${input.tokens.layoutRhythm}`,
      ],
      primaryAction,
      secondaryActions,
    };
  });
}
