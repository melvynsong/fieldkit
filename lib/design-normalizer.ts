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

export interface ColorSet {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface Colors {
  observed: ColorSet;
  recommended: ColorSet;
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
  colors: Colors;
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

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const COLOR_DEFAULTS: ColorSet = {
  primary: "#1f3a5f",
  secondary: "#eaf1f8",
  accent: "#5b7cfa",
  background: "#f5f7fb",
  surface: "#ffffff",
};

function toHexColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return HEX_RE.test(trimmed) ? trimmed : fallback;
}

function normalizeColorSet(value: unknown): ColorSet {
  const raw = isRecord(value) ? value : {};
  return {
    primary: toHexColor(raw.primary, COLOR_DEFAULTS.primary),
    secondary: toHexColor(raw.secondary, COLOR_DEFAULTS.secondary),
    accent: toHexColor(raw.accent, COLOR_DEFAULTS.accent),
    background: toHexColor(raw.background, COLOR_DEFAULTS.background),
    surface: toHexColor(raw.surface, COLOR_DEFAULTS.surface),
  };
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
  const rawColors = isRecord(source.colors) ? source.colors : {};
  const navigation = isRecord(source.navigation) ? source.navigation : {};
  const layout = isRecord(source.layout) ? source.layout : {};
  const contentHints = isRecord(source.contentHints) ? source.contentHints : {};

  const normalizedSections = Array.isArray(layout.sections)
    ? layout.sections.map(normalizeSection)
    : [];

  // Derive observed colors: prefer explicit colors.observed, fall back to theme fields
  const observedSource = isRecord(rawColors.observed)
    ? rawColors.observed
    : {
        primary: theme.primaryColor,
        secondary: theme.secondaryColor,
        accent: theme.accentColor,
      };
  const observedColors = normalizeColorSet(observedSource);

  const recommendedColors = normalizeColorSet(
    isRecord(rawColors.recommended) ? rawColors.recommended : observedSource
  );

  return {
    brand: {
      name: toStringValue(brand.name, "Unknown Brand"),
      tone: toStringValue(brand.tone, "neutral"),
      personality: toStringArray(brand.personality),
    },
    theme: {
      primaryColor: toHexColor(theme.primaryColor, COLOR_DEFAULTS.primary),
      secondaryColor: toHexColor(theme.secondaryColor, COLOR_DEFAULTS.secondary),
      accentColor: toHexColor(theme.accentColor, COLOR_DEFAULTS.accent),
      backgroundStyle: toStringValue(theme.backgroundStyle, "solid"),
      borderRadius: toStringValue(theme.borderRadius, "medium"),
      spacing: toEnumValue(
        theme.spacing,
        ["compact", "comfortable", "spacious"],
        "comfortable"
      ),
    },
    colors: {
      observed: observedColors,
      recommended: recommendedColors,
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
