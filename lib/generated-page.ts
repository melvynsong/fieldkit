import type {
  DesignExtraction,
  DesignSection,
  NavigationType,
  Spacing,
} from "@/lib/design-normalizer";

export type PreviewMode = "desktop" | "mobile";
export type NavigationOverride = "auto" | "top-nav" | "side-nav";
export type EmphasisOverride = "auto" | "dashboard" | "transactional" | "form-heavy";
export type EmphasisMode = "dashboard" | "transactional" | "form-heavy";

export interface PrototypeControlState {
  previewMode: PreviewMode;
  density: Spacing;
  navigationOverride: NavigationOverride;
  emphasis: EmphasisOverride;
  showLabels: boolean;
}

export interface GeneratedPageModel {
  previewMode: PreviewMode;
  navigation: {
    type: "top-nav" | "side-nav";
    items: string[];
  };
  density: Spacing;
  emphasis: EmphasisMode;
  hero: {
    title: string;
    subtitle: string;
    showSummaryCards: boolean;
  };
  actions: {
    primary: string;
    secondary: string;
  };
  sections: Array<{
    id: string;
    type: DesignSection["type"];
    label: string;
    importance: DesignSection["importance"];
  }>;
  showLabels: boolean;
}

function inferDefaultNavigation(type: NavigationType): "top-nav" | "side-nav" {
  if (type === "side-nav") {
    return "side-nav";
  }

  if (type === "mixed") {
    return "side-nav";
  }

  return "top-nav";
}

function inferDefaultEmphasis(design: DesignExtraction): EmphasisMode {
  if (design.layout.structure === "form-heavy") {
    return "form-heavy";
  }

  if (design.layout.structure === "dashboard") {
    return "dashboard";
  }

  const hasTransactionalSection = design.layout.sections.some(
    (section) => section.type === "list" || section.type === "table"
  );

  if (hasTransactionalSection) {
    return "transactional";
  }

  return "dashboard";
}

function fallbackSections(emphasis: EmphasisMode): DesignSection[] {
  if (emphasis === "form-heavy") {
    return [
      { type: "header", label: "Header", importance: "high" },
      { type: "form", label: "Form Section", importance: "high" },
      { type: "content", label: "Supporting Information", importance: "medium" },
      { type: "footer", label: "Footer", importance: "low" },
    ];
  }

  if (emphasis === "transactional") {
    return [
      { type: "header", label: "Header", importance: "high" },
      { type: "table", label: "Records Table", importance: "high" },
      { type: "side-panel", label: "Details Panel", importance: "medium" },
      { type: "footer", label: "Footer", importance: "low" },
    ];
  }

  return [
    { type: "header", label: "Header", importance: "high" },
    { type: "cards", label: "Summary Cards", importance: "high" },
    { type: "content", label: "Content Section", importance: "medium" },
    { type: "side-panel", label: "Supporting Information", importance: "medium" },
    { type: "footer", label: "Footer", importance: "low" },
  ];
}

export function createDefaultPrototypeControls(
  design: DesignExtraction
): PrototypeControlState {
  return {
    previewMode: "desktop",
    density: design.theme.spacing,
    navigationOverride: "auto",
    emphasis: "auto",
    showLabels: true,
  };
}

export function buildGeneratedPageModel(
  design: DesignExtraction,
  controls: PrototypeControlState
): GeneratedPageModel {
  const autoNavigation = inferDefaultNavigation(design.navigation.type);
  const navigationType =
    controls.navigationOverride === "auto"
      ? autoNavigation
      : controls.navigationOverride;

  const autoEmphasis = inferDefaultEmphasis(design);
  const emphasis = controls.emphasis === "auto" ? autoEmphasis : controls.emphasis;

  const sourceSections =
    design.layout.sections.length > 0 ? design.layout.sections : fallbackSections(emphasis);

  const sections = sourceSections.map((section, index) => ({
    id: `${section.type}-${index}`,
    type: section.type,
    label: section.label || "Section",
    importance: section.importance,
  }));

  const hasCards = sections.some((section) => section.type === "cards");

  return {
    previewMode: controls.previewMode,
    navigation: {
      type: navigationType,
      items:
        design.navigation.items.length > 0
          ? design.navigation.items
          : ["Overview", "Records", "Insights", "Settings"],
    },
    density: controls.density,
    emphasis,
    hero: {
      title: "Page Title",
      subtitle: "Page Subtitle",
      showSummaryCards: hasCards || emphasis === "dashboard",
    },
    actions: {
      primary: "Primary Action",
      secondary: "Secondary Action",
    },
    sections,
    showLabels: controls.showLabels,
  };
}
