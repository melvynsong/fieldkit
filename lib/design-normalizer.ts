export type Spacing = "compact" | "comfortable" | "spacious";
export type NavigationType = "top-nav" | "side-nav" | "mixed" | "unknown";
export type LayoutStructure =
  | "single-column"
  | "two-column"
  | "dashboard"
  | "form-heavy"
  | "unknown";
export type SectionType =
  | "header"
  | "hero"
  | "content"
  | "list"
  | "side-panel"
  | "form"
  | "table"
  | "cards"
  | "footer"
  | "unknown";
export type Importance = "high" | "medium" | "low";
export type DataDensity = "low" | "medium" | "high";
export type InteractionStyle =
  | "browse"
  | "transact"
  | "review"
  | "edit"
  | "mixed";

export interface DesignSection {
  type: SectionType;
  label: string;
  importance: Importance;
}

export interface DesignExtraction {
  brand: {
    name: string;
    tone: string;
    personality: string[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
    borderRadius: string;
    spacing: Spacing;
  };
  navigation: {
    type: NavigationType;
    items: string[];
  };
  layout: {
    structure: LayoutStructure;
    sections: DesignSection[];
  };
  contentHints: {
    likelyPurpose: string;
    dataDensity: DataDensity;
    interactionStyle: InteractionStyle;
  };
}

export type NormalizedDesign = DesignExtraction;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string") {
    return fallback;
  }

  const candidate = value.trim() as T;
  return allowed.includes(candidate) ? candidate : fallback;
}

function normalizeSection(value: unknown): DesignSection {
  const raw = isRecord(value) ? value : {};

  return {
    type: toEnumValue(
      raw.type,
      [
        "header",
        "hero",
        "content",
        "list",
        "side-panel",
        "form",
        "table",
        "cards",
        "footer",
        "unknown",
      ],
      "unknown"
    ),
    label: toStringValue(raw.label, "Untitled Section"),
    importance: toEnumValue(raw.importance, ["high", "medium", "low"], "medium"),
  };
}

export function parseDesignJson(rawText: string): unknown | null {
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

export function normalizeDesign(raw: unknown): DesignExtraction {
  const source = isRecord(raw) ? raw : {};
  const brand = isRecord(source.brand) ? source.brand : {};
  const theme = isRecord(source.theme) ? source.theme : {};
  const navigation = isRecord(source.navigation) ? source.navigation : {};
  const layout = isRecord(source.layout) ? source.layout : {};
  const contentHints = isRecord(source.contentHints) ? source.contentHints : {};

  const normalizedSections = Array.isArray(layout.sections)
    ? layout.sections.map(normalizeSection)
    : [];

  return {
    brand: {
      name: toStringValue(brand.name, "Unknown Brand"),
      tone: toStringValue(brand.tone, "neutral"),
      personality: toStringArray(brand.personality),
    },
    theme: {
      primaryColor: toStringValue(theme.primaryColor, "#1f2937"),
      secondaryColor: toStringValue(theme.secondaryColor, "#64748b"),
      accentColor: toStringValue(theme.accentColor, "#0ea5e9"),
      backgroundStyle: toStringValue(theme.backgroundStyle, "solid"),
      borderRadius: toStringValue(theme.borderRadius, "medium"),
      spacing: toEnumValue(
        theme.spacing,
        ["compact", "comfortable", "spacious"],
        "comfortable"
      ),
    },
    navigation: {
      type: toEnumValue(
        navigation.type,
        ["top-nav", "side-nav", "mixed", "unknown"],
        "unknown"
      ),
      items: toStringArray(navigation.items),
    },
    layout: {
      structure: toEnumValue(
        layout.structure,
        ["single-column", "two-column", "dashboard", "form-heavy", "unknown"],
        "unknown"
      ),
      sections: normalizedSections,
    },
    contentHints: {
      likelyPurpose: toStringValue(contentHints.likelyPurpose, "General interface"),
      dataDensity: toEnumValue(contentHints.dataDensity, ["low", "medium", "high"], "medium"),
      interactionStyle: toEnumValue(
        contentHints.interactionStyle,
        ["browse", "transact", "review", "edit", "mixed"],
        "mixed"
      ),
    },
  };
}
