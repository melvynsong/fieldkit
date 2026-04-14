import type {
  BuildScreen,
  EnhancedBuildScreen,
  UIComponent,
  InteractionAction,
  ScreenRationale,
  UIState,
} from "@/types";

/**
 * Infer domain from screen metadata for contextual content
 */
export function inferDomain(
  screen: BuildScreen
): "commerce" | "booking" | "food" | "finance" | "workspace" | "general" {
  const source = `${screen.screenName} ${screen.title} ${screen.subtitle}`.toLowerCase();

  if (/menu|order|restaurant|dish|delivery/.test(source)) return "food";
  if (/hotel|trip|stay|flight|booking|reservation/.test(source)) return "booking";
  if (/cart|checkout|shop|product|catalog|store/.test(source)) return "commerce";
  if (/wallet|payment|invoice|billing|finance|subscription/.test(source)) return "finance";
  if (/workspace|dashboard|project|task|team|admin/.test(source)) return "workspace";

  return "general";
}

/**
 * Convert legacy BuildScreen to new EnhancedBuildScreen format
 * Transforms generic prose descriptions into structured UI components
 */
export function enhanceBuildScreen(
  screen: BuildScreen,
  index: number,
  total: number
): EnhancedBuildScreen {
  const domain = inferDomain(screen);
  const heroComponent = createHeroComponent(screen, domain);
  const formComponent = createFormComponent(screen, domain);
  const listComponent = createListComponent(screen, domain);
  const cardsComponent = createCardsComponent(screen, domain);

  const components: UIComponent[] = [
    heroComponent,
    formComponent,
    listComponent,
    cardsComponent,
  ].filter((c): c is UIComponent => c !== null);

  const actions = createInteractionActions(screen);
  const rationale = extractRationale(screen);

  return {
    id: screen.id,
    sourceScreenId: screen.sourceScreenId,
    screenName: screen.screenName,
    title: screen.title,
    subtitle: screen.subtitle,
    description: screen.description,
    purpose: screen.subtitle || "Screen purpose",
    components,
    interactions: actions.reduce(
      (acc, action) => {
        acc[action.id] = action;
        return acc;
      },
      {} as Record<string, InteractionAction>
    ),
    rationale,
    uiState: "default",
    mockData: generateMockData(screen, domain),
    metadata: {
      index,
      total,
      domain,
    },
    // Keep legacy fields for backward compatibility
    sections: screen.sections,
    chips: screen.chips,
    primaryAction: screen.primaryAction,
    secondaryActions: screen.secondaryActions,
  };
}

/**
 * Create a hero/header component from screen metadata
 */
function createHeroComponent(screen: BuildScreen, domain: string): UIComponent | null {
  const title = screen.title.replace(/^[^:]*:\s*/, ""); // Remove tone prefix
  const subtitle = screen.subtitle || getContextualSubtitle(domain, screen.screenName);

  return {
    id: `${screen.id}-hero`,
    type: "hero",
    title,
    subtitle,
    content: subtitle,
  };
}

/**
 * Create a form component from screen sections
 */
function createFormComponent(screen: BuildScreen, domain: string): UIComponent | null {
  const formSection = screen.sections.find(
    (s) => /form|input|details|profile|search|create/i.test(s.heading)
  );

  if (!formSection) return null;

  return {
    id: `${screen.id}-form`,
    type: "form",
    title: formSection.heading,
    content: formSection.body,
    fields: createFormFields(screen, domain),
    actions: [
      {
        id: `${screen.id}-submit`,
        label: getContextualActionLabel("submit", domain, screen.screenName),
        intent: "submit",
        feedback: {
          type:"success",
          message: "Changes saved successfully",
        },
      },
    ],
  };
}

/**
 * Create a list component from screen sections
 */
function createListComponent(screen: BuildScreen, domain: string): UIComponent | null {
  const listSection = screen.sections.find(
    (s) => /list|overview|recommended|popular|items/i.test(s.heading)
  );

  if (!listSection) return null;

  const items = getContextualListItems(domain);

  return {
    id: `${screen.id}-list`,
    type: "list",
    title: listSection.heading,
    content: listSection.body,
    items: items.map((title, idx) => ({
      id: `item-${idx}`,
      title,
      subtitle: getContextualItemSubtitle(domain),
      metadata: getContextualItemMetadata(domain),
    })),
  };
}

/**
 * Create a cards component from screen sections
 */
function createCardsComponent(screen: BuildScreen, domain: string): UIComponent | null {
  const cardSection = screen.sections.find(
    (s) => /card|content|grid|showcase|highlight/i.test(s.heading)
  );

  if (!cardSection) return null;

  const items = getContextualCardItems(domain);

  return {
    id: `${screen.id}-cards`,
    type: "cards",
    title: cardSection.heading,
    content: cardSection.body,
    items: items.map((item, idx) => ({
      id: `card-${idx}`,
      title: item.title,
      subtitle: item.subtitle || getContextualCardSubtitle(domain),
      metadata: item.metadata,
    })),
  };
}

/**
 * Create form fields based on domain and screen context
 */
function createFormFields(screen: BuildScreen, domain: string) {
  const fieldLabel = getContextualInputLabel(domain, screen.screenName);
  const fieldPlaceholder = getContextualInputPlaceholder(domain, screen.screenName);

  return [
    {
      id: `${screen.id}-input`,
      name: "primary",
      type: "text" as const,
      label: fieldLabel,
      placeholder: fieldPlaceholder,
      required: true,
      helperText: getContextualHelperText(domain),
    },
  ];
}

/**
 * Create interaction actions from screen actions
 */
function createInteractionActions(screen: BuildScreen): InteractionAction[] {
  const actions: InteractionAction[] = [];

  // Primary action
  actions.push({
    id: screen.primaryAction.id,
    label: screen.primaryAction.label,
    intent: (screen.primaryAction.intent as any) || "submit",
  });

  // Secondary actions
  screen.secondaryActions.forEach((action) => {
    actions.push({
      id: action.id,
      label: action.label,
      intent: (action.intent as any) || "back",
    });
  });

  return actions;
}

/**
 * Extract or create rationale from screen description
 */
function extractRationale(screen: BuildScreen): ScreenRationale {
  return {
    whyThisScreen: screen.description || "This screen guides users through a key step.",
    userBenefit: screen.subtitle || "Helps users progress toward their goal",
    designDecisions: screen.chips || [],
    contentIntent: screen.sections.map((s) => s.heading).join(" • ") || "Clear user guidance",
  };
}

/**
 * Generate domain-aware mock data for the screen session
 */
function generateMockData(
  screen: BuildScreen,
  domain: string
): Record<string, unknown> {
  return {
    listItems: getContextualListItems(domain),
    cardItems: getContextualCardItems(domain),
    formLabel: getContextualInputLabel(domain, screen.screenName),
    itemSubtitle: getContextualItemSubtitle(domain),
    cardSubtitle: getContextualCardSubtitle(domain),
    actionLabels: {
      primary: getContextualActionLabel("primary", domain, screen.screenName),
      submit: getContextualActionLabel("submit", domain, screen.screenName),
    },
  };
}

// ============================================================================
// DOMAIN-SPECIFIC CONTENT GENERATORS
// ============================================================================

function getContextualSubtitle(domain: string, screenName: string): string {
  const name = screenName.toLowerCase();

  if (domain === "food") {
    if (/menu|browse|search/.test(name)) return "Explore restaurants and dishes near you";
    if (/cart|order/.test(name)) return "Review your order and proceed to checkout";
    if (/delivery/.test(name)) return "Track your delivery in real-time";
    return "Order food from your favorite restaurants";
  }

  if (domain === "booking") {
    if (/search|find/.test(name)) return "Find and compare available options";
    if (/details|view/.test(name)) return "View detailed information and reviews";
    if (/confirm/.test(name)) return "Complete your reservation";
    return "Book your next trip or stay";
  }

  if (domain === "commerce") {
    if (/browse|search/.test(name)) return "Discover products that match your needs";
    if (/detail|view/.test(name)) return "See detailed product information";
    if (/cart|checkout/.test(name)) return "Review items and complete purchase";
    return "Shop for products you love";
  }

  if (domain === "finance") {
    if (/send|transfer/.test(name)) return "Transfer money securely and quickly";
    if (/pay|invoice/.test(name)) return "Manage your payments and bills";
    if (/balance|view/.test(name)) return "Review your account and transaction history";
    return "Manage your finances";
  }

  if (domain === "workspace") {
    if (/create|new/.test(name)) return "Create and manage your work items";
    if (/assign|task/.test(name)) return "Organize tasks and collaborate with your team";
    if (/dashboard|view/.test(name)) return "Get an overview of your progress";
    return "Manage your workspace and projects";
  }

  return "Continue with your task";
}

function getContextualInputLabel(domain: string, screenName: string): string {
  if (domain === "food") return "Search dishes or restaurants";
  if (domain === "booking") return "Destination or property";
  if (domain === "commerce") return "Search products";
  if (domain === "finance") return "Amount or recipient";
  if (domain === "workspace") return "Task name or project";
  return "Enter information";
}

function getContextualInputPlaceholder(domain: string, screenName: string): string {
  if (domain === "food") return "e.g., Pizza, Sushi, Italian near me";
  if (domain === "booking") return "e.g., New York, Beach house, 5-star hotel";
  if (domain === "commerce") return "e.g., Laptop, Blue shirt, Running shoes";
  if (domain === "finance") return "e.g., $500 to savings";
  if (domain === "workspace") return "e.g., Finish Q1 roadmap";
  return "Type something...";
}

function getContextualListItems(domain: string): string[] {
  if (domain === "food") return ["Popular near you", "Chef specials", "Fastest delivery", "Best value combos"];
  if (domain === "booking") return ["Top-rated stays", "Free cancellation", "Great for families", "Last-minute deals"];
  if (domain === "commerce") return ["Best sellers", "Trending now", "New arrivals", "Saved for later"];
  if (domain === "finance") return ["Recent payments", "Upcoming bills", "Spending alerts", "Savings progress"];
  if (domain === "workspace") return ["Assigned to you", "Due this week", "Blocked tasks", "Recently updated"];
  return ["Top picks", "Recently viewed", "Recommended", "Saved for later"];
}

function getContextualCardItems(domain: string) {
  if (domain === "food") {
    return [
      { title: "Specialty Pizzeria", subtitle: "Italian • 4.8⭐ • 20-30 min", metadata: "2.1 km away" },
      { title: "Sushi Master", subtitle: "Japanese • 4.9⭐ • 25-35 min", metadata: "1.8 km away" },
      { title: "Taco House", subtitle: "Mexican • 4.7⭐ • 15-25 min", metadata: "0.9 km away" },
      { title: "Thai Kitchen", subtitle: "Thai • 4.6⭐ • 30-40 min", metadata: "2.5 km away" },
    ];
  }

  if (domain === "booking") {
    return [
      { title: "Ocean View Resort", subtitle: "Instant confirmation • 4.9⭐", metadata: "$89/night" },
      { title: "Downtown Hotel", subtitle: "Free cancellation • 4.8⭐", metadata: "$120/night" },
      { title: "Cozy B&B", subtitle: "Popular choice • 4.7⭐", metadata: "$65/night" },
      { title: "Luxury Suite", subtitle: "Premium amenities • 5.0⭐", metadata: "$250/night" },
    ];
  }

  if (domain === "commerce") {
    return [
      { title: "Premium Wireless Headphones", subtitle: "In stock and ready to ship", metadata: "$99.99" },
      { title: "Ergonomic Keyboard", subtitle: "In stock and ready to ship", metadata: "$79.99" },
      { title: "Monitor Stand", subtitle: "In stock and ready to ship", metadata: "$34.99" },
      { title: "USB-C Hub", subtitle: "In stock and ready to ship", metadata: "$49.99" },
    ];
  }

  if (domain === "finance") {
    return [
      { title: "Netflix Subscription", subtitle: "Updated a few seconds ago", metadata: "-$15.99" },
      { title: "Salary Deposit", subtitle: "Updated a few seconds ago", metadata: "+$3,500.00" },
      { title: "Grocery Purchase", subtitle: "Updated a few seconds ago", metadata: "-$67.42" },
      { title: "Utility Payment", subtitle: "Updated a few seconds ago", metadata: "-$120.00" },
    ];
  }

  if (domain === "workspace") {
    return [
      { title: "Design system documentation", subtitle: "High priority", metadata: "Due tomorrow" },
      { title: "Q1 planning meeting", subtitle: "In progress", metadata: "Due in 3 days" },
      { title: "Code review: feature-x", subtitle: "Awaiting review", metadata: "Review needed" },
      { title: "Team standup", subtitle: "Recurring", metadata: "Every weekday" },
    ];
  }

  return [
    { title: "Option 1", subtitle: "Description here", metadata: "$99" },
    { title: "Option 2", subtitle: "Description here", metadata: "$199" },
    { title: "Option 3", subtitle: "Description here", metadata: "$299" },
    { title: "Option 4", subtitle: "Description here", metadata: "$399" },
  ];
}

function getContextualItemSubtitle(domain: string): string {
  if (domain === "food") return "Open • 4.5⭐ • 20-30 min delivery";
  if (domain === "booking") return "Instant confirmation available";
  if (domain === "commerce") return "In stock and ready to ship";
  if (domain === "finance") return "Updated moments ago";
  if (domain === "workspace") return "Synced with your latest updates";
  return "Open to view more details";
}

function getContextualItemMetadata(domain: string): string {
  if (domain === "food") return "2.1 km away";
  if (domain === "booking") return "$89/night";
  if (domain === "commerce") return "$99.99";
  if (domain === "finance") return "Active";
  if (domain === "workspace") return "Due today";
  return "Learn more";
}

function getContextualCardSubtitle(domain: string): string {
  if (domain === "food") return "Ready in 20-30 min";
  if (domain === "booking") return "Instant confirmation available";
  if (domain === "commerce") return "In stock and ready to ship";
  if (domain === "finance") return "Updated a few seconds ago";
  if (domain === "workspace") return "Synced with your latest updates";
  return "Open to view more details";
}

function getContextualActionLabel(
  type: "primary" | "submit" | "secondary",
  domain: string,
  screenName: string
): string {
  const name = screenName.toLowerCase();

  if (type === "submit" || type === "primary") {
    if (domain === "food") return "Proceed to checkout";
    if (domain === "booking") return "Confirm reservation";
    if (domain === "commerce") return "Add to cart";
    if (domain === "finance") return "Send money";
    if (domain === "workspace") return "Create";
  }

  return "Continue";
}

function getContextualHelperText(domain: string): string {
  if (domain === "food") return "Search by cuisine, restaurant name, or dish";
  if (domain === "booking") return "Enter your destination or search by property name";
  if (domain === "commerce") return "Browse products by category or search by keywords";
  if (domain === "finance") return "Enter the amount and confirm recipient";
  if (domain === "workspace") return "Name this task clearly for your team";
  return "Complete this field to proceed";
}
