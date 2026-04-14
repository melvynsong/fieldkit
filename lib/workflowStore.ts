"use client";

import { create } from "zustand";
import { applyBuildInteraction } from "@/lib/interaction-engine";
import { generateBuildScreens } from "@/lib/screen-content-generator";
import { generateScaleArtifacts as buildScaleArtifacts } from "@/lib/scale-generator";
import { enhanceBuildScreen } from "@/lib/screen-enhancement";
import type {
  BuildScreen,
  BuildScreenAction,
  BuildDesignControls,
  BuildDesignTokens,
  ChatMessage,
  DesignCues,
  DesignSystem,
  EnhancedBuildScreen,
  GeneratedScreen,
  PlannedScreen,
  ProblemDiscovery,
  ProblemInput,
  ScaleArtifacts,
  ScreenGenerationResult,
  SolutionPlan,
  WorkflowStage,
  WorkflowApiResult,
} from "@/types";

interface WorkflowStore {
  currentStage: WorkflowStage;
  problemInput: ProblemInput;
  problemDiscovery: ProblemDiscovery | null;
  solutionPlan: SolutionPlan;
  designSystem: DesignSystem | null;
  activeDesignCues: DesignCues;
  buildDesignControls: BuildDesignControls;
  buildDesignTokens: BuildDesignTokens;
  buildScreens: BuildScreen[];
  buildCurrentScreenIndex: number;
  buildNavigationHistory: number[];
  buildUiState: Record<string, boolean>;
  buildAiHistory: string[];
  generatedScreens: ScreenGenerationResult | null;
  scaleArtifacts: ScaleArtifacts | null;
  selectedScreenId: string | null;
  chatHistory: ChatMessage[];
  referenceUrls: string;
  designFiles: File[];
  generationReady: boolean;
  isGeneratingScale: boolean;
  isAnalyzingProblem: boolean;
  isExtractingDesign: boolean;
  isGeneratingScreens: boolean;
  isRefining: boolean;
  isApplyingBuildChat: boolean;
  error: string | null;
  setCurrentStage: (stage: WorkflowStage) => void;
  nextStage: () => void;
  previousStage: () => void;
  setProblemField: <K extends keyof ProblemInput>(key: K, value: ProblemInput[K]) => void;
  setReferenceUrls: (value: string) => void;
  setDesignFiles: (files: File[]) => void;
  setDesignTone: (tone: DesignSystem["tone"]) => void;
  setDesignDensity: (density: DesignSystem["density"]) => void;
  updateBuildDesignControls: (patch: Partial<BuildDesignControls>) => void;
  applyBuildDesignControls: () => void;
  resetBuildDesignControls: () => void;
  initializeBuildWorkspace: () => void;
  setBuildCurrentScreenIndex: (index: number) => void;
  goToNextBuildScreen: () => void;
  goToPreviousBuildScreen: () => void;
  triggerBuildAction: (action: BuildScreenAction) => void;
  applyBuildChatPrompt: (message: string) => Promise<void>;
  setSelectedScreenId: (id: string | null) => void;
  setSolutionText: (value: string) => void;
  setPlannedScreenCount: (count: number) => void;
  updatePlannedScreen: (id: string, patch: Partial<PlannedScreen>) => void;
  addPlannedScreen: () => void;
  removePlannedScreen: (id: string) => void;
  movePlannedScreen: (id: string, direction: "up" | "down") => void;
  analyzeProblem: () => Promise<void>;
  extractDesign: () => Promise<void>;
  generateScreens: () => Promise<void>;
  generateSingleScreen: (screenId: string) => Promise<void>;
  refineByChat: (message: string) => Promise<void>;
  generateScaleArtifacts: () => void;
}

const STAGE_ORDER: WorkflowStage[] = [
  "problem-discovery",
  "design",
  "build-iterate",
  "scale",
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePlannedScreens(screens: PlannedScreen[]): PlannedScreen[] {
  return screens
    .map((screen, index) => ({
      id: screen.id || `plan-${index + 1}`,
      screenName: (screen.screenName || `Screen ${index + 1}`).trim(),
      userAction: (screen.userAction || "Complete core user action").trim(),
      problemResolution: (screen.problemResolution || "Resolve key user pain").trim(),
    }))
    .filter((screen) => Boolean(screen.screenName));
}

function evaluatePlanStatus(plan: SolutionPlan, hasDesign: boolean): {
  status: SolutionPlan["status"];
  generationReady: boolean;
} {
  const hasSolution = plan.solution.trim().length > 0;
  const hasScreens = plan.screens.length > 0;
  const allScreensValid = plan.screens.every(
    (screen) =>
      screen.screenName.trim().length > 0 &&
      screen.userAction.trim().length > 0 &&
      screen.problemResolution.trim().length > 0
  );

  const numberValid = plan.numberOfScreens >= 1;
  const status = hasSolution && hasScreens && allScreensValid && numberValid
    ? "ready-for-generation"
    : "needs-refinement";

  return {
    status,
    generationReady: status === "ready-for-generation" && hasDesign,
  };
}

function defaultDesignCues(): DesignCues {
  return {
    tone: "hybrid",
    density: "comfortable",
    colorDirection: "Neutral mixed palette",
    typographyHierarchy: "Balanced heading-to-body contrast",
    layoutRhythm: "Consistent modular spacing",
    navigationStyle: "Balanced navigation emphasis",
    cardSectionStyle: "Moderate card framing",
  };
}

function buildDesignCues(design: DesignSystem | null): DesignCues {
  if (!design) {
    return defaultDesignCues();
  }

  return {
    tone: design.tone,
    density: design.density,
    colorDirection: `${design.colors.primary} primary with ${design.colors.accent} accents`,
    typographyHierarchy: `${design.typography.style}, ${design.typography.scale}, ${design.typography.weight}`,
    layoutRhythm: design.layoutPatterns[0] || "Consistent modular spacing",
    navigationStyle:
      design.tone === "transactional"
        ? "Task-driven structured navigation"
        : design.tone === "media"
        ? "Content-led top navigation"
        : "Balanced mixed navigation",
    cardSectionStyle:
      design.tone === "transactional"
        ? "Defined cards with clear action lanes"
        : design.tone === "media"
        ? "Visual content panels with lighter framing"
        : "Balanced cards and content blocks",
  };
}

function defaultBuildDesignControls(): BuildDesignControls {
  return {
    appStyle: "hybrid",
    tone: "professional",
    density: "comfortable",
    emphasis: "balanced",
    visualWeight: "balanced",
  };
}

function buildControlsFromDesign(design: DesignSystem | null): BuildDesignControls {
  if (!design) {
    return defaultBuildDesignControls();
  }

  return {
    appStyle: design.tone,
    tone: "professional",
    density: design.density,
    emphasis: "balanced",
    visualWeight: "balanced",
  };
}

function buildDesignTokensFromControls(controls: BuildDesignControls): BuildDesignTokens {
  return {
    spacingScale:
      controls.density === "compact"
        ? "tight"
        : controls.density === "spacious"
        ? "airy"
        : "standard",
    typographyPreset:
      controls.tone === "premium"
        ? "luxury"
        : controls.tone === "playful"
        ? "expressive"
        : controls.tone === "friendly"
        ? "approachable"
        : "neutral",
    hierarchy:
      controls.emphasis === "actions"
        ? "action-led"
        : controls.emphasis === "content"
        ? "content-led"
        : "balanced",
    weight: controls.visualWeight,
    layoutRhythm:
      controls.density === "compact"
        ? "dense"
        : controls.density === "spacious"
        ? "open"
        : "moderate",
  };
}

function fallbackDesignSystemFromControls(controls: BuildDesignControls): DesignSystem {
  const isMedia = controls.appStyle === "media";
  const isTransactional = controls.appStyle === "transactional";

  return {
    theme: isMedia
      ? "Content-led default"
      : isTransactional
      ? "Task-first default"
      : "Balanced default",
    colors: {
      primary: isMedia ? "#0f4c81" : isTransactional ? "#1f3a5f" : "#2c4d8f",
      secondary: "#d9e3f0",
      accent: isMedia ? "#f97316" : "#3b82f6",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
    },
    typography: {
      style: controls.tone === "premium" ? "Refined sans-serif" : "Modern sans-serif",
      scale: controls.density === "compact" ? "Compact scale" : controls.density === "spacious" ? "Expanded scale" : "Balanced scale",
      weight: controls.visualWeight === "bold" ? "bold" : controls.visualWeight === "light" ? "normal" : "semibold",
    },
    spacing: controls.density,
    density: controls.density,
    tone: controls.appStyle,
    layoutPatterns: [
      controls.emphasis === "actions" ? "Action-focused hierarchy" : controls.emphasis === "content" ? "Content-led hierarchy" : "Balanced hierarchy",
      controls.density === "compact" ? "Tight vertical rhythm" : controls.density === "spacious" ? "Open modular rhythm" : "Balanced modular rhythm",
    ],
    components: ["Card", "Top nav", "Button group"],
  };
}

function applyControlsToDesignSystem(
  design: DesignSystem | null,
  controls: BuildDesignControls
): DesignSystem | null {
  if (!design) {
    return null;
  }

  const typographyStyle =
    controls.tone === "premium"
      ? "Refined editorial hierarchy"
      : controls.tone === "playful"
      ? "Expressive modern hierarchy"
      : controls.tone === "friendly"
      ? "Approachable humanist hierarchy"
      : "Professional structured hierarchy";

  const typographyWeight =
    controls.visualWeight === "bold"
      ? "bold"
      : controls.visualWeight === "light"
      ? "normal"
      : "semibold";

  const typographyScale =
    controls.density === "compact"
      ? "compact scale"
      : controls.density === "spacious"
      ? "expanded scale"
      : "balanced scale";

  const layoutRhythm =
    controls.density === "compact"
      ? "Tight vertical rhythm"
      : controls.density === "spacious"
      ? "Open modular rhythm"
      : "Balanced modular rhythm";

  const emphasisPattern =
    controls.emphasis === "actions"
      ? "Action-focused hierarchy"
      : controls.emphasis === "content"
      ? "Content-led hierarchy"
      : "Balanced hierarchy";

  return {
    ...design,
    tone: controls.appStyle,
    density: controls.density,
    spacing: controls.density,
    typography: {
      style: typographyStyle,
      scale: typographyScale,
      weight: typographyWeight,
    },
    layoutPatterns: [layoutRhythm, emphasisPattern, ...design.layoutPatterns].slice(0, 4),
  };
}

function traceGeneratedScreens(
  generated: ScreenGenerationResult,
  plannedScreens: PlannedScreen[]
): ScreenGenerationResult {
  const traced: GeneratedScreen[] = generated.screens.map((screen, index) => {
    const match =
      plannedScreens.find(
        (planned) =>
          planned.screenName.toLowerCase() === screen.screenName.toLowerCase() ||
          screen.screenName.toLowerCase().includes(planned.screenName.toLowerCase())
      ) || plannedScreens[index];

    const plannedUserAction = match?.userAction || screen.userAction || "Complete key user task";
    const plannedPurpose = match?.problemResolution || screen.purpose || "Address key user problem";

    return {
      ...screen,
      userAction: screen.userAction || plannedUserAction,
      plannedUserAction,
      plannedPurpose,
    };
  });

  return {
    ...generated,
    screens: traced,
  };
}

const initialProblemInput: ProblemInput = {
  problemStatement: "",
  affectedUsers: "",
  businessContext: "",
  constraints: "",
  additionalNotes: "",
};

const initialSolutionPlan: SolutionPlan = {
  solution: "",
  numberOfScreens: 1,
  screens: [],
  status: "needs-refinement",
};

function reEvaluatePlan(
  plan: SolutionPlan,
  design: DesignSystem | null
): { solutionPlan: SolutionPlan; generationReady: boolean } {
  const normalizedPlan: SolutionPlan = {
    ...plan,
    numberOfScreens: Math.max(1, plan.numberOfScreens || 1),
    screens: normalizePlannedScreens(plan.screens),
  };

  const { status, generationReady } = evaluatePlanStatus(normalizedPlan, Boolean(design));

  return {
    solutionPlan: {
      ...normalizedPlan,
      status,
    },
    generationReady,
  };
}

function hydrateBuildScreens(snapshot: {
  generatedScreens: ScreenGenerationResult | null;
  problemDiscovery: ProblemDiscovery | null;
  solutionPlan: SolutionPlan;
  designSystem: DesignSystem | null;
  buildDesignControls: BuildDesignControls;
  buildDesignTokens: BuildDesignTokens;
}): BuildScreen[] {
  return generateBuildScreens({
    generatedScreens: snapshot.generatedScreens?.screens || [],
    problemDiscovery: snapshot.problemDiscovery,
    solutionPlan: snapshot.solutionPlan,
    designSystem: snapshot.designSystem,
    controls: snapshot.buildDesignControls,
    tokens: snapshot.buildDesignTokens,
  });
}

/**
 * Convert legacy BuildScreen[] to enhanced EnhancedBuildScreen[] format
 * Transforms generic descriptions into structured UI components
 */
function enhanceBuildScreens(screens: BuildScreen[]): EnhancedBuildScreen[] {
  return screens.map((screen, index) =>
    enhanceBuildScreen(screen, index, screens.length)
  );
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentStage: "problem-discovery",
  problemInput: initialProblemInput,
  problemDiscovery: null,
  solutionPlan: initialSolutionPlan,
  designSystem: null,
  activeDesignCues: defaultDesignCues(),
  buildDesignControls: defaultBuildDesignControls(),
  buildDesignTokens: buildDesignTokensFromControls(defaultBuildDesignControls()),
  buildScreens: [],
  buildCurrentScreenIndex: 0,
  buildNavigationHistory: [],
  buildUiState: {},
  buildAiHistory: [],
  generatedScreens: null,
  scaleArtifacts: null,
  selectedScreenId: null,
  chatHistory: [],
  referenceUrls: "",
  designFiles: [],
  generationReady: false,
  isGeneratingScale: false,
  isAnalyzingProblem: false,
  isExtractingDesign: false,
  isGeneratingScreens: false,
  isRefining: false,
  isApplyingBuildChat: false,
  error: null,

  setCurrentStage: (stage) => set({ currentStage: stage }),

  nextStage: () => {
    set((state) => {
      const index = STAGE_ORDER.indexOf(state.currentStage);
      const next = STAGE_ORDER[Math.min(index + 1, STAGE_ORDER.length - 1)];
      return { currentStage: next };
    });
  },

  previousStage: () => {
    set((state) => {
      const index = STAGE_ORDER.indexOf(state.currentStage);
      const next = STAGE_ORDER[Math.max(index - 1, 0)];
      return { currentStage: next };
    });
  },

  setProblemField: (key, value) => {
    set((state) => ({
      problemInput: {
        ...state.problemInput,
        [key]: value,
      },
    }));
  },

  setReferenceUrls: (value) => set({ referenceUrls: value }),
  setDesignFiles: (files) => set({ designFiles: files }),

  setDesignTone: (tone) => {
    set((state) => {
      const nextControls: BuildDesignControls = {
        ...state.buildDesignControls,
        appStyle: tone,
      };

      const nextDesign = state.designSystem
        ? {
            ...state.designSystem,
            tone,
          }
        : null;

      const { solutionPlan, generationReady } = reEvaluatePlan(state.solutionPlan, nextDesign);

      return {
        designSystem: nextDesign,
        activeDesignCues: buildDesignCues(nextDesign),
        buildDesignControls: nextControls,
        buildDesignTokens: buildDesignTokensFromControls(nextControls),
        solutionPlan,
        generationReady,
      };
    });
  },

  setDesignDensity: (density) => {
    set((state) => {
      const nextControls: BuildDesignControls = {
        ...state.buildDesignControls,
        density,
      };

      const nextDesign = state.designSystem
        ? {
            ...state.designSystem,
            density,
            spacing: density,
          }
        : null;

      const { solutionPlan, generationReady } = reEvaluatePlan(state.solutionPlan, nextDesign);

      return {
        designSystem: nextDesign,
        activeDesignCues: buildDesignCues(nextDesign),
        buildDesignControls: nextControls,
        buildDesignTokens: buildDesignTokensFromControls(nextControls),
        solutionPlan,
        generationReady,
      };
    });
  },

  updateBuildDesignControls: (patch) => {
    set((state) => {
      const nextControls: BuildDesignControls = {
        ...state.buildDesignControls,
        ...patch,
      };

      return {
        buildDesignControls: nextControls,
        buildDesignTokens: buildDesignTokensFromControls(nextControls),
      };
    });
  },

  applyBuildDesignControls: () => {
    set((state) => {
      const nextDesign = applyControlsToDesignSystem(state.designSystem, state.buildDesignControls);
      const { solutionPlan, generationReady } = reEvaluatePlan(state.solutionPlan, nextDesign);
      const buildScreens = hydrateBuildScreens({
        ...state,
        solutionPlan,
        designSystem: nextDesign,
      });

      return {
        designSystem: nextDesign,
        activeDesignCues: buildDesignCues(nextDesign),
        buildDesignTokens: buildDesignTokensFromControls(state.buildDesignControls),
        buildScreens,
        buildCurrentScreenIndex: Math.min(state.buildCurrentScreenIndex, Math.max(buildScreens.length - 1, 0)),
        solutionPlan,
        generationReady,
        error: null,
      };
    });
  },

  resetBuildDesignControls: () => {
    set((state) => {
      const nextControls = buildControlsFromDesign(state.designSystem);
      return {
        buildDesignControls: nextControls,
        buildDesignTokens: buildDesignTokensFromControls(nextControls),
      };
    });
  },

  initializeBuildWorkspace: () => {
    set((state) => {
      const buildScreens = hydrateBuildScreens(state);
      return {
        buildScreens,
        buildCurrentScreenIndex: Math.min(state.buildCurrentScreenIndex, Math.max(buildScreens.length - 1, 0)),
        buildNavigationHistory: [],
        buildUiState: {},
      };
    });
  },

  setBuildCurrentScreenIndex: (index) => {
    set((state) => ({
      buildCurrentScreenIndex: Math.max(0, Math.min(index, Math.max(state.buildScreens.length - 1, 0))),
    }));
  },

  goToNextBuildScreen: () => {
    set((state) => ({
      buildCurrentScreenIndex: Math.min(state.buildCurrentScreenIndex + 1, Math.max(state.buildScreens.length - 1, 0)),
      buildNavigationHistory: [...state.buildNavigationHistory, state.buildCurrentScreenIndex],
    }));
  },

  goToPreviousBuildScreen: () => {
    set((state) => {
      const fromHistory = state.buildNavigationHistory[state.buildNavigationHistory.length - 1];
      const nextIndex = typeof fromHistory === "number"
        ? fromHistory
        : Math.max(state.buildCurrentScreenIndex - 1, 0);

      return {
        buildCurrentScreenIndex: nextIndex,
        buildNavigationHistory: state.buildNavigationHistory.slice(0, -1),
      };
    });
  },

  triggerBuildAction: (action) => {
    set((state) => {
      const result = applyBuildInteraction(action, {
        currentIndex: state.buildCurrentScreenIndex,
        maxIndex: Math.max(state.buildScreens.length - 1, 0),
        history: state.buildNavigationHistory,
        uiState: state.buildUiState,
      });

      return {
        buildCurrentScreenIndex: result.currentIndex,
        buildNavigationHistory: result.history,
        buildUiState: result.uiState,
      };
    });
  },

  applyBuildChatPrompt: async (message) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const snapshot = get();
    if (!snapshot.designSystem || !snapshot.generatedScreens?.screens.length) {
      set({ error: "Generate screens in Stage 2 before using Build & Iterate chat." });
      return;
    }

    const userMessage: ChatMessage = { id: uid(), role: "user", content: trimmed };

    set((state) => ({
      isApplyingBuildChat: true,
      error: null,
      chatHistory: [...state.chatHistory, userMessage],
    }));

    try {
      const response = await fetch("/api/generate-screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          problem: snapshot.problemDiscovery,
          design: snapshot.designSystem,
          plannedScreens: snapshot.solutionPlan.screens.map((screen) => ({
            screenName: screen.screenName,
            userAction: screen.userAction,
            purpose: screen.problemResolution,
          })),
          chatInstruction: trimmed,
        }),
      });

      const payload = (await response.json()) as WorkflowApiResult<ScreenGenerationResult>;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Build chat update failed.");
      }

      const traced = traceGeneratedScreens(payload.data, snapshot.solutionPlan.screens);

      set((state) => {
        const buildScreens = hydrateBuildScreens({
          ...state,
          generatedScreens: traced,
        });

        return {
          generatedScreens: traced,
          buildScreens,
          buildCurrentScreenIndex: Math.min(state.buildCurrentScreenIndex, Math.max(buildScreens.length - 1, 0)),
          buildNavigationHistory: [],
          isApplyingBuildChat: false,
          error: null,
          buildAiHistory: [...state.buildAiHistory, trimmed],
          chatHistory: [
            ...state.chatHistory,
            {
              id: uid(),
              role: "assistant",
              content: "Applied AI iteration to Stage 3 content and flow.",
            },
          ],
        };
      });
    } catch (error) {
      set((state) => ({
        isApplyingBuildChat: false,
        error: error instanceof Error ? error.message : "Build chat update failed unexpectedly.",
        chatHistory: [
          ...state.chatHistory,
          {
            id: uid(),
            role: "assistant",
            content: "Unable to apply build-stage chat updates.",
          },
        ],
      }));
    }
  },

  setSelectedScreenId: (id) => set({ selectedScreenId: id }),

  setSolutionText: (value) => {
    set((state) => {
      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          solution: value,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  setPlannedScreenCount: (count) => {
    set((state) => {
      const nextCount = Math.max(1, Math.floor(count) || 1);
      let nextScreens = [...state.solutionPlan.screens];

      while (nextScreens.length < nextCount) {
        const idx = nextScreens.length + 1;
        nextScreens.push({
          id: `plan-${uid()}`,
          screenName: `Screen ${idx}`,
          userAction: "Complete user action",
          problemResolution: "Resolve part of the problem",
        });
      }

      if (nextScreens.length > nextCount) {
        nextScreens = nextScreens.slice(0, nextCount);
      }

      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          numberOfScreens: nextCount,
          screens: nextScreens,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  updatePlannedScreen: (id, patch) => {
    set((state) => {
      const nextScreens = state.solutionPlan.screens.map((screen) =>
        screen.id === id
          ? {
              ...screen,
              ...patch,
            }
          : screen
      );

      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          screens: nextScreens,
          numberOfScreens: nextScreens.length || 1,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  addPlannedScreen: () => {
    set((state) => {
      const nextScreens = [
        ...state.solutionPlan.screens,
        {
          id: `plan-${uid()}`,
          screenName: `Screen ${state.solutionPlan.screens.length + 1}`,
          userAction: "Complete user action",
          problemResolution: "Resolve part of the problem",
        },
      ];

      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          screens: nextScreens,
          numberOfScreens: nextScreens.length,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  removePlannedScreen: (id) => {
    set((state) => {
      const nextScreens = state.solutionPlan.screens.filter((screen) => screen.id !== id);
      const safeScreens = nextScreens.length
        ? nextScreens
        : [
            {
              id: `plan-${uid()}`,
              screenName: "Screen 1",
              userAction: "Complete user action",
              problemResolution: "Resolve part of the problem",
            },
          ];

      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          screens: safeScreens,
          numberOfScreens: safeScreens.length,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  movePlannedScreen: (id, direction) => {
    set((state) => {
      const index = state.solutionPlan.screens.findIndex((screen) => screen.id === id);
      if (index < 0) {
        return state;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.solutionPlan.screens.length) {
        return state;
      }

      const nextScreens = [...state.solutionPlan.screens];
      const [current] = nextScreens.splice(index, 1);
      nextScreens.splice(targetIndex, 0, current);

      const { solutionPlan, generationReady } = reEvaluatePlan(
        {
          ...state.solutionPlan,
          screens: nextScreens,
          numberOfScreens: nextScreens.length,
        },
        state.designSystem
      );

      return { solutionPlan, generationReady };
    });
  },

  analyzeProblem: async () => {
    const { problemInput } = get();

    set({ isAnalyzingProblem: true, error: null });

    try {
      const response = await fetch("/api/problem-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problemInput),
      });

      const payload = (await response.json()) as WorkflowApiResult<ProblemDiscovery>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Problem analysis failed.");
      }

      const aiScreens = (payload.data.hypothesis.screenBreakdown || []).map((screen, index) => ({
        id: `plan-${uid()}-${index}`,
        screenName: screen.screenName,
        userAction: screen.userAction,
        problemResolution: screen.problemResolution,
      }));

      const nextPlanBase: SolutionPlan = {
        solution: payload.data.hypothesis.solutionApproach,
        numberOfScreens: Math.max(1, payload.data.hypothesis.numberOfScreens || aiScreens.length || 1),
        screens: aiScreens.length
          ? aiScreens
          : [
              {
                id: `plan-${uid()}`,
                screenName: "Screen 1",
                userAction: "Complete key user action",
                problemResolution: "Resolve a core problem step",
              },
            ],
        status: "needs-refinement",
      };

      set((state) => {
        const { solutionPlan, generationReady } = reEvaluatePlan(nextPlanBase, state.designSystem);
        return {
          problemDiscovery: payload.data,
          solutionPlan,
          selectedScreenId: solutionPlan.screens[0]?.id ?? null,
          currentStage: "problem-discovery",
          generationReady,
          isAnalyzingProblem: false,
          error: null,
        };
      });
    } catch (error) {
      set({
        isAnalyzingProblem: false,
        error: error instanceof Error ? error.message : "Problem analysis failed unexpectedly.",
      });
    }
  },

  extractDesign: async () => {
    const { designFiles, referenceUrls } = get();

    set({ isExtractingDesign: true, error: null });

    try {
      const formData = new FormData();
      designFiles.forEach((file) => formData.append("images", file));
      formData.append("referenceUrls", referenceUrls);

      const response = await fetch("/api/design-extract", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as WorkflowApiResult<DesignSystem>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Design extraction failed.");
      }

      set((state) => {
        const { solutionPlan, generationReady } = reEvaluatePlan(state.solutionPlan, payload.data);
        const nextControls = buildControlsFromDesign(payload.data);
        return {
          designSystem: payload.data,
          activeDesignCues: buildDesignCues(payload.data),
          buildDesignControls: nextControls,
          buildDesignTokens: buildDesignTokensFromControls(nextControls),
          solutionPlan,
          currentStage: "design",
          generationReady,
          isExtractingDesign: false,
          error: null,
        };
      });
    } catch (error) {
      set({
        isExtractingDesign: false,
        error: error instanceof Error ? error.message : "Design extraction failed unexpectedly.",
      });
    }
  },

  generateScreens: async () => {
    const { problemDiscovery, designSystem, solutionPlan, buildDesignControls } = get();

    if (!problemDiscovery) {
      set({ error: "Complete Problem Discovery first." });
      return;
    }

    if (solutionPlan.status !== "ready-for-generation") {
      set({ error: "Refine the Solution Plan before generating screens." });
      return;
    }

    const effectiveDesign = designSystem || fallbackDesignSystemFromControls(buildDesignControls);

    if (!designSystem) {
      set((state) => {
        const { solutionPlan: nextPlan, generationReady } = reEvaluatePlan(state.solutionPlan, effectiveDesign);
        return {
          designSystem: effectiveDesign,
          activeDesignCues: buildDesignCues(effectiveDesign),
          solutionPlan: nextPlan,
          generationReady,
        };
      });
    }

    set({ isGeneratingScreens: true, error: null });

    try {
      const response = await fetch("/api/generate-screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemDiscovery,
          design: effectiveDesign,
          plannedScreens: solutionPlan.screens.map((screen) => ({
            screenName: screen.screenName,
            userAction: screen.userAction,
            purpose: screen.problemResolution,
          })),
        }),
      });

      const payload = (await response.json()) as WorkflowApiResult<ScreenGenerationResult>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Screen generation failed.");
      }

      const traced = traceGeneratedScreens(payload.data, solutionPlan.screens);
      const selectedId =
        traced.screens.find((screen) => screen.id === get().selectedScreenId)?.id ||
        traced.screens[0]?.id ||
        null;

      set({
        generatedScreens: traced,
        buildScreens: hydrateBuildScreens({
          ...get(),
          generatedScreens: traced,
        }),
        buildCurrentScreenIndex: 0,
        buildNavigationHistory: [],
        buildUiState: {},
        selectedScreenId: selectedId,
        isGeneratingScreens: false,
        error: null,
      });
    } catch (error) {
      set({
        isGeneratingScreens: false,
        error: error instanceof Error ? error.message : "Screen generation failed unexpectedly.",
      });
    }
  },

  generateSingleScreen: async (screenId) => {
    const { problemDiscovery, designSystem, solutionPlan, generationReady } = get();

    if (!problemDiscovery || !designSystem || !generationReady) {
      set({ error: "Refine the Solution Plan and ensure design extraction is done first." });
      return;
    }

    const target = solutionPlan.screens.find((screen) => screen.id === screenId);
    if (!target) {
      set({ error: "Selected planned screen is missing." });
      return;
    }

    set({ isGeneratingScreens: true, error: null });

    try {
      const response = await fetch("/api/generate-screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemDiscovery,
          design: designSystem,
          plannedScreens: [
            {
              screenName: target.screenName,
              userAction: target.userAction,
              purpose: target.problemResolution,
            },
          ],
          chatInstruction: `Generate one focused screen for: ${target.screenName}`,
        }),
      });

      const payload = (await response.json()) as WorkflowApiResult<ScreenGenerationResult>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Single screen generation failed.");
      }

      const traced = traceGeneratedScreens(payload.data, [target]);
      const one = traced.screens.slice(0, 1);

      set({
        generatedScreens: {
          ...traced,
          screens: one,
        },
        buildScreens: hydrateBuildScreens({
          ...get(),
          generatedScreens: {
            ...traced,
            screens: one,
          },
        }),
        buildCurrentScreenIndex: 0,
        buildNavigationHistory: [],
        buildUiState: {},
        selectedScreenId: one[0]?.id ?? null,
        isGeneratingScreens: false,
        error: null,
      });
    } catch (error) {
      set({
        isGeneratingScreens: false,
        error:
          error instanceof Error
            ? error.message
            : "Single screen generation failed unexpectedly.",
      });
    }
  },

  refineByChat: async (message) => {
    const { problemDiscovery, designSystem, chatHistory, solutionPlan } = get();
    if (!problemDiscovery || !designSystem) {
      set({ error: "Generate baseline screens before chat refinement." });
      return;
    }

    const userMessage: ChatMessage = { id: uid(), role: "user", content: message };

    set({
      isRefining: true,
      error: null,
      chatHistory: [...chatHistory, userMessage],
    });

    try {
      const response = await fetch("/api/generate-screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemDiscovery,
          design: designSystem,
          plannedScreens: solutionPlan.screens.map((screen) => ({
            screenName: screen.screenName,
            userAction: screen.userAction,
            purpose: screen.problemResolution,
          })),
          chatInstruction: message,
        }),
      });

      const payload = (await response.json()) as WorkflowApiResult<ScreenGenerationResult>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Refinement failed.");
      }

      const traced = traceGeneratedScreens(payload.data, solutionPlan.screens);
      const nextControls = buildControlsFromDesign(designSystem);

      set((state) => ({
        generatedScreens: traced,
        buildScreens: hydrateBuildScreens({
          ...state,
          generatedScreens: traced,
        }),
        buildCurrentScreenIndex: 0,
        buildNavigationHistory: [],
        buildUiState: {},
        selectedScreenId: traced.screens[0]?.id ?? state.selectedScreenId,
        buildDesignControls: nextControls,
        buildDesignTokens: buildDesignTokensFromControls(nextControls),
        isRefining: false,
        error: null,
        chatHistory: [
          ...state.chatHistory,
          { id: uid(), role: "assistant", content: "Preview updated based on your instruction." },
        ],
      }));
    } catch (error) {
      set((state) => ({
        isRefining: false,
        error: error instanceof Error ? error.message : "Refinement failed unexpectedly.",
        chatHistory: [
          ...state.chatHistory,
          { id: uid(), role: "assistant", content: "Unable to apply refinement." },
        ],
      }));
    }
  },

  generateScaleArtifacts: () => {
    const snapshot = get();

    if (!snapshot.problemDiscovery || !snapshot.designSystem) {
      set({
        error:
          "Scale requires completed Problem Discovery and Design stages before generating artifacts.",
      });
      return;
    }

    set({ isGeneratingScale: true, error: null });

    const artifacts = buildScaleArtifacts({
      problemDiscovery: snapshot.problemDiscovery,
      solutionPlan: snapshot.solutionPlan,
      designSystem: snapshot.designSystem,
      generatedScreens: snapshot.generatedScreens,
    });

    set({
      scaleArtifacts: artifacts,
      isGeneratingScale: false,
      currentStage: "scale",
      error: null,
    });
  },
}));
