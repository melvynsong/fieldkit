import type { DesignSystem } from "@/types";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function buildDesignExtractPrompt(referenceUrls: string[]): string {
  return [
    "You are a design extraction analyst.",
    "Analyze all provided image references and extract a blended, consistent design system.",
    "Do not generate UI code.",
    "",
    "Extract:",
    "- Color palette",
    "- Typography style",
    "- Spacing system",
    "- UI density (compact/comfortable/spacious)",
    "- App tone (transactional/media/hybrid)",
    "- Layout patterns",
    "",
    "Return strict JSON only with this schema:",
    JSON.stringify(
      {
        theme: "string",
        colors: {
          primary: "#1f3a5f",
          secondary: "#eaf1f8",
          accent: "#5b7cfa",
          background: "#f5f7fb",
          surface: "#ffffff",
          text: "#0f172a",
        },
        typography: {
          style: "string",
          scale: "string",
          weight: "string",
        },
        spacing: "comfortable",
        density: "comfortable",
        tone: "hybrid",
        layoutPatterns: ["string"],
        components: ["string"],
      },
      null,
      2
    ),
    "",
    `Reference URLs (if any): ${referenceUrls.length ? referenceUrls.join(", ") : "N/A"}`,
  ].join("\n");
}

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

function toHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return HEX_RE.test(trimmed) ? trimmed : fallback;
}

function toDensity(value: unknown): DesignSystem["density"] {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function toTone(value: unknown): DesignSystem["tone"] {
  return value === "transactional" || value === "media" ? value : "hybrid";
}

export function normalizeDesignSystem(raw: unknown): DesignSystem {
  const source = isRecord(raw) ? raw : {};
  const colors = isRecord(source.colors) ? source.colors : {};
  const typography = isRecord(source.typography) ? source.typography : {};

  return {
    theme: toStringValue(source.theme, "Balanced modern interface"),
    colors: {
      primary: toHex(colors.primary, "#1f3a5f"),
      secondary: toHex(colors.secondary, "#eaf1f8"),
      accent: toHex(colors.accent, "#5b7cfa"),
      background: toHex(colors.background, "#f5f7fb"),
      surface: toHex(colors.surface, "#ffffff"),
      text: toHex(colors.text, "#0f172a"),
    },
    typography: {
      style: toStringValue(typography.style, "Clean sans-serif"),
      scale: toStringValue(typography.scale, "Medium"),
      weight: toStringValue(typography.weight, "Semi-bold headings"),
    },
    spacing: toDensity(source.spacing),
    density: toDensity(source.density),
    tone: toTone(source.tone),
    layoutPatterns: toArray(source.layoutPatterns, "Two-level hierarchy"),
    components: toArray(source.components, "Card"),
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
