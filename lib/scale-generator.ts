import type {
  DesignSystem,
  ProblemDiscovery,
  ScaleArtifacts,
  ScaleEpic,
  ScaleFeature,
  ScaleTestCase,
  ScaleUserStory,
  ScreenGenerationResult,
  SolutionPlan,
} from "@/types";

interface ScaleInput {
  problemDiscovery: ProblemDiscovery;
  solutionPlan: SolutionPlan;
  designSystem: DesignSystem;
  generatedScreens: ScreenGenerationResult | null;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function buildUserStoryStatement(action: string, value: string) {
  return `As an end user, I want to ${action.toLowerCase()} so that ${value.toLowerCase()}.`;
}

function buildAcceptanceCriteria(screenName: string, action: string, purpose: string): string[] {
  return [
    `${screenName} is available from the planned navigation path.`,
    `The screen allows users to ${action.toLowerCase()} without dead ends.`,
    `The screen behavior clearly supports this purpose: ${purpose}.`,
    "The screen follows the approved tone, hierarchy, and density from Stage 2 design settings.",
  ];
}

function buildTestCases(screenName: string, action: string): ScaleTestCase[] {
  return [
    {
      title: `${screenName}: happy-path completion`,
      steps: [
        `Navigate to ${screenName}.`,
        `Perform the primary action: ${action}.`,
        "Submit or complete the flow.",
      ],
      expectedResult: "The user reaches the intended outcome and receives clear feedback.",
    },
    {
      title: `${screenName}: validation and error handling`,
      steps: [
        `Open ${screenName}.`,
        "Enter incomplete or invalid input.",
        "Attempt to continue.",
      ],
      expectedResult: "Validation prevents failure and shows actionable recovery guidance.",
    },
  ];
}

function pickScreenModel(input: ScaleInput) {
  if (input.generatedScreens?.screens.length) {
    return input.generatedScreens.screens.map((screen, index) => ({
      id: screen.id || `screen-${index + 1}`,
      name: screen.screenName,
      action: screen.plannedUserAction || screen.userAction,
      purpose: screen.plannedPurpose || screen.purpose,
    }));
  }

  return input.solutionPlan.screens.map((screen) => ({
    id: screen.id,
    name: screen.screenName,
    action: screen.userAction,
    purpose: screen.problemResolution,
  }));
}

function buildFeatureFromScreen(
  epicId: string,
  screen: { id: string; name: string; action: string; purpose: string },
  index: number
): ScaleFeature {
  const storyId = `story-${slug(screen.id || `${index + 1}`)}`;
  const featureId = `${epicId}-feature-${index + 1}`;

  const userStory: ScaleUserStory = {
    id: storyId,
    title: `${screen.name} flow`,
    statement: buildUserStoryStatement(screen.action, screen.purpose),
    linkedScreenId: screen.id,
    linkedScreenName: screen.name,
    acceptanceCriteria: buildAcceptanceCriteria(screen.name, screen.action, screen.purpose),
    testCases: buildTestCases(screen.name, screen.action),
  };

  return {
    id: featureId,
    title: `${screen.name} capability`,
    summary: screen.purpose,
    userStories: [userStory],
  };
}

export function generateScaleArtifacts(input: ScaleInput): ScaleArtifacts {
  const screens = pickScreenModel(input);
  const epicId = `epic-${slug(input.problemDiscovery.analysis.coreProblem) || "core-solution"}`;

  const epic: ScaleEpic = {
    id: epicId,
    title: "Core problem resolution workflow",
    objective: input.solutionPlan.solution,
    features: screens.map((screen, index) => buildFeatureFromScreen(epicId, screen, index)),
  };

  return {
    generatedAt: new Date().toISOString(),
    contextSummary: [
      `Problem: ${input.problemDiscovery.definition.realProblem}`,
      `Solution: ${input.solutionPlan.solution}`,
      `Design tone: ${input.designSystem.tone}, density: ${input.designSystem.density}`,
    ].join(" "),
    epics: [epic],
  };
}
