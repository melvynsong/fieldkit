export interface ProblemInput {
  problemStatement: string;
  affectedUsers: string;
  businessContext?: string;
  constraints?: string;
  additionalNotes?: string;
}

export interface ProblemAnalysis {
  coreProblem: string;
  rootCauses: string[];
  solutionDirections: string[];
  assumptions: string[];
  unknowns: string[];
}

export interface ProblemDefinition {
  realProblem: string;
  affectedAndWhy: string;
  inactionImpact: string;
  simplestValidation: string;
}

export interface HypothesisScreen {
  id?: string;
  screenName: string;
  userAction: string;
  problemResolution: string;
}

export type PlannedScreen = Required<HypothesisScreen>;

export interface SolutionPlan {
  solution: string;
  numberOfScreens: number;
  screens: PlannedScreen[];
  status: "needs-refinement" | "ready-for-generation";
}

export interface DesignCues {
  tone: DesignSystem["tone"];
  density: DesignSystem["density"];
  colorDirection: string;
  typographyHierarchy: string;
  layoutRhythm: string;
  navigationStyle: string;
  cardSectionStyle: string;
}

export interface SolutionHypothesis {
  solutionApproach: string;
  numberOfScreens: number;
  screenBreakdown: HypothesisScreen[];
}

export interface ProblemDiscovery {
  analysis: ProblemAnalysis;
  definition: ProblemDefinition;
  hypothesis: SolutionHypothesis;
  keyAssumptions: string[];
  validationRecommendation: string;
}

export interface DesignSystem {
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    style: string;
    scale: string;
    weight: string;
  };
  spacing: "compact" | "comfortable" | "spacious";
  density: "compact" | "comfortable" | "spacious";
  tone: "transactional" | "media" | "hybrid";
  layoutPatterns: string[];
  components: string[];
}

export interface GeneratedScreen {
  id: string;
  screenName: string;
  userAction: string;
  purpose: string;
  plannedUserAction: string;
  plannedPurpose: string;
  keySections: string[];
  contentTypes: string[];
}

export interface ScreenGenerationResult {
  screens: GeneratedScreen[];
  navigation: string[];
  notes: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface WorkflowApiResult<T> {
  ok: boolean;
  error?: string;
  fallbackUsed?: boolean;
  rawText?: string;
  data: T;
  result?: unknown;
}

export interface BuildDesignControls {
  appStyle: "transactional" | "media" | "hybrid";
  tone: "professional" | "playful" | "premium" | "friendly";
  density: "compact" | "comfortable" | "spacious";
  emphasis: "content" | "actions" | "balanced";
  visualWeight: "light" | "balanced" | "bold";
}

export interface BuildDesignTokens {
  spacingScale: "tight" | "standard" | "airy";
  typographyPreset: "neutral" | "expressive" | "luxury" | "approachable";
  hierarchy: "content-led" | "action-led" | "balanced";
  weight: "light" | "balanced" | "bold";
  layoutRhythm: "dense" | "moderate" | "open";
}

export interface BuildScreenSection {
  id: string;
  heading: string;
  body: string;
  bullets: string[];
  fieldLabel?: string;
  fieldPlaceholder?: string;
}

export interface BuildScreenAction {
  id: string;
  label: string;
  intent: "next" | "back" | "jump" | "toggle" | "confirm";
  targetIndex?: number;
  stateKey?: string;
}

export interface BuildScreen {
  id: string;
  sourceScreenId: string;
  screenName: string;
  title: string;
  subtitle: string;
  description: string;
  sections: BuildScreenSection[];
  chips: string[];
  primaryAction: BuildScreenAction;
  secondaryActions: BuildScreenAction[];
}

export type WorkflowStage = "problem-discovery" | "design" | "build-iterate" | "scale";

export interface ScaleTestCase {
  title: string;
  steps: string[];
  expectedResult: string;
}

export interface ScaleUserStory {
  id: string;
  title: string;
  statement: string;
  linkedScreenId: string;
  linkedScreenName: string;
  acceptanceCriteria: string[];
  testCases: ScaleTestCase[];
}

export interface ScaleFeature {
  id: string;
  title: string;
  summary: string;
  userStories: ScaleUserStory[];
}

export interface ScaleEpic {
  id: string;
  title: string;
  objective: string;
  features: ScaleFeature[];
}

export interface ScaleArtifacts {
  generatedAt: string;
  contextSummary: string;
  epics: ScaleEpic[];
}
