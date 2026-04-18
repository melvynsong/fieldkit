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

// ─── contextual field inference ───────────────────────────────────────────────

function inferField(
  screenName: string,
  sectionName: string,
  userAction: string
): { label: string; placeholder: string } | null {
  const ctx = `${screenName} ${sectionName} ${userAction}`.toLowerCase();

  if (/email/.test(ctx)) return { label: "Email address", placeholder: "you@example.com" };
  if (/password/.test(ctx)) return { label: "Password", placeholder: "Enter your password" };
  if (/login|sign.?in/.test(ctx)) return { label: "Email address", placeholder: "you@example.com" };
  if (/search|find|discover|look/.test(ctx)) return { label: "Search", placeholder: `Search ${screenName}…` };
  if (/name/.test(ctx)) return { label: "Full name", placeholder: "Enter your name" };
  if (/phone|mobile/.test(ctx)) return { label: "Phone number", placeholder: "+65 9000 0000" };
  if (/amount|payment|pay|price/.test(ctx)) return { label: "Amount", placeholder: "0.00" };
  if (/date|schedule|when|time/.test(ctx)) return { label: "Date", placeholder: "Select a date" };
  if (/address|location/.test(ctx)) return { label: "Address", placeholder: "Enter address" };
  if (/description|detail|note|comment|message|feedback/.test(ctx)) return { label: "Description", placeholder: "Add details…" };
  if (/form|input|entry|submit|create|add|new|register|sign.?up/.test(ctx)) return { label: "Details", placeholder: "Enter details…" };

  return null;
}

// ─── contextual action label ──────────────────────────────────────────────────

function inferPrimaryLabel(screenName: string, userAction: string, index: number, total: number): string {
  const ctx = `${screenName} ${userAction}`.toLowerCase();

  if (index >= total - 1) {
    if (/pay|checkout|purchase|order/.test(ctx)) return "Confirm Payment";
    if (/register|sign.?up|creat/.test(ctx)) return "Create Account";
    if (/submit|send|publish/.test(ctx)) return "Submit";
    if (/book|reserve/.test(ctx)) return "Confirm Booking";
    return "Complete";
  }

  if (/search|find|look/.test(ctx)) return "Search";
  if (/login|sign.?in/.test(ctx)) return "Sign In";
  if (/select|choose|pick/.test(ctx)) return "Select & Continue";
  if (/upload|attach|add/.test(ctx)) return "Upload";
  if (/review|confirm/.test(ctx)) return "Review";
  if (/register|sign.?up/.test(ctx)) return "Get Started";

  return "Continue";
}

// ─── section builder ──────────────────────────────────────────────────────────

function buildSections(screen: GeneratedScreen, index: number): BuildScreenSection[] {
  const sectionNames = screen.keySections.length
    ? screen.keySections
    : ["Main Content", "Details", "Actions"];

  return sectionNames.map((name, sectionIndex) => {
    const lowerName = name.toLowerCase();
    const needsField =
      /form|input|detail|profile|search|entry|submit|filter|query|login|register|sign.?up|email|password/.test(
        lowerName
      ) ||
      sectionIndex === 0 && /form|input|search/.test(
        `${screen.screenName} ${screen.userAction}`.toLowerCase()
      );

    const field = needsField ? inferField(screen.screenName, name, screen.userAction) : null;

    return {
      id: `${screen.id}-section-${sectionIndex + 1}`,
      heading: name,
      body: "",
      bullets: [],
      fieldLabel: field?.label,
      fieldPlaceholder: field?.placeholder,
    };
  });
}

// ─── action builder ───────────────────────────────────────────────────────────

function buildActions(
  screen: GeneratedScreen,
  index: number,
  total: number
): { primaryAction: BuildScreenAction; secondaryActions: BuildScreenAction[] } {
  const label = inferPrimaryLabel(screen.screenName, screen.userAction, index, total);

  const primaryAction: BuildScreenAction = {
    id: `${screen.id}-primary`,
    label,
    intent: index >= total - 1 ? "confirm" : "next",
    targetIndex: index < total - 1 ? index + 1 : undefined,
  };

  const secondaryActions: BuildScreenAction[] = [];

  if (index > 0) {
    secondaryActions.push({
      id: `${screen.id}-back`,
      label: "Back",
      intent: "back",
      targetIndex: index - 1,
    });
  }

  return { primaryAction, secondaryActions };
}

// ─── main export ──────────────────────────────────────────────────────────────

export function generateBuildScreens(input: ScreenContentInput): BuildScreen[] {
  if (!input.generatedScreens.length) return [];

  return input.generatedScreens.map((screen, index) => {
    const { primaryAction, secondaryActions } = buildActions(
      screen,
      index,
      input.generatedScreens.length
    );

    return {
      id: `build-${screen.id}`,
      sourceScreenId: screen.id,
      screenName: screen.screenName,
      title: screen.screenName,
      subtitle: screen.plannedPurpose || screen.userAction,
      description: screen.plannedPurpose || "",
      sections: buildSections(screen, index),
      chips: screen.contentTypes ?? [],
      primaryAction,
      secondaryActions,
    };
  });
}
