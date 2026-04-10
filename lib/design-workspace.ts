import { normalizeDesign } from "@/lib/design-normalizer";
import type { DesignExtraction } from "@/lib/design-normalizer";
import { buildPromptKit, type PromptKit } from "@/lib/prompt-kit";
import {
  DEFAULT_COLOR_TOKENS,
  blendHex,
  mapPaletteToTokens,
  extractDominantHexColors,
} from "@/lib/palette-extractor";
import type {
  ChatMessage,
  DesignControls,
  DesignTokens,
  DesignWorkspace,
  DesignWorkspacePatch,
  PreviewModel,
  UploadedImage,
} from "@/lib/workspace-types";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function asHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return HEX_RE.test(trimmed) ? trimmed : fallback;
}

export function normalizeDesignControls(
  raw: unknown,
  fallback?: DesignControls
): DesignControls {
  const prev =
    fallback ?? {
      appStyle: "hybrid",
      tone: "professional",
      density: "comfortable",
      emphasis: "balanced",
      visualWeight: "balanced",
    };

  if (!raw || typeof raw !== "object") {
    return prev;
  }

  const source = raw as Record<string, unknown>;
  return {
    appStyle:
      source.appStyle === "transactional" ||
      source.appStyle === "media" ||
      source.appStyle === "hybrid"
        ? source.appStyle
        : prev.appStyle,
    tone:
      source.tone === "professional" ||
      source.tone === "playful" ||
      source.tone === "premium" ||
      source.tone === "friendly"
        ? source.tone
        : prev.tone,
    density:
      source.density === "compact" ||
      source.density === "comfortable" ||
      source.density === "spacious"
        ? source.density
        : prev.density,
    emphasis:
      source.emphasis === "content" ||
      source.emphasis === "actions" ||
      source.emphasis === "balanced"
        ? source.emphasis
        : prev.emphasis,
    visualWeight:
      source.visualWeight === "light" ||
      source.visualWeight === "balanced" ||
      source.visualWeight === "bold"
        ? source.visualWeight
        : prev.visualWeight,
  };
}

function normalizePromptKit(raw: unknown, fallback?: PromptKit): PromptKit {
  const previous = fallback ?? {
    productPrompt: "",
    pagePrompt: "",
    designSystemPrompt: "",
  };

  if (!raw || typeof raw !== "object") {
    return previous;
  }

  const candidate = raw as Record<string, unknown>;
  return {
    productPrompt:
      typeof candidate.productPrompt === "string"
        ? candidate.productPrompt
        : previous.productPrompt,
    pagePrompt:
      typeof candidate.pagePrompt === "string"
        ? candidate.pagePrompt
        : previous.pagePrompt,
    designSystemPrompt:
      typeof candidate.designSystemPrompt === "string"
        ? candidate.designSystemPrompt
        : previous.designSystemPrompt,
  };
}

export function normalizeDesignTokens(raw: unknown, fallback?: DesignTokens): DesignTokens {
  const prev = fallback ?? {
    colors: DEFAULT_COLOR_TOKENS,
    borderRadius: "12px",
    spacing: "comfortable",
    shadow: "soft",
    typography: {
      family: "sans",
      scale: "md",
      weight: "semibold",
    },
  };

  if (!raw || typeof raw !== "object") {
    return prev;
  }

  const source = raw as Record<string, unknown>;
  const colorSource =
    source.colors && typeof source.colors === "object"
      ? (source.colors as Record<string, unknown>)
      : {};

  return {
    colors: {
      primary: asHex(colorSource.primary, prev.colors.primary),
      secondary: asHex(colorSource.secondary, prev.colors.secondary),
      accent: asHex(colorSource.accent, prev.colors.accent),
      background: asHex(colorSource.background, prev.colors.background),
      surface: asHex(colorSource.surface, prev.colors.surface),
      text: asHex(colorSource.text, prev.colors.text),
      muted: asHex(colorSource.muted, prev.colors.muted),
      border: asHex(colorSource.border, prev.colors.border),
    },
    borderRadius:
      typeof source.borderRadius === "string" && source.borderRadius.trim()
        ? source.borderRadius.trim()
        : prev.borderRadius,
    spacing:
      source.spacing === "compact" ||
      source.spacing === "comfortable" ||
      source.spacing === "spacious"
        ? source.spacing
        : prev.spacing,
    shadow:
      source.shadow === "soft" || source.shadow === "medium" || source.shadow === "strong"
        ? source.shadow
        : prev.shadow,
    typography:
      source.typography && typeof source.typography === "object"
        ? {
            family:
              (source.typography as Record<string, unknown>).family === "sans" ||
              (source.typography as Record<string, unknown>).family === "display" ||
              (source.typography as Record<string, unknown>).family === "humanist"
                ? ((source.typography as Record<string, unknown>).family as "sans" | "display" | "humanist")
                : prev.typography.family,
            scale:
              (source.typography as Record<string, unknown>).scale === "sm" ||
              (source.typography as Record<string, unknown>).scale === "md" ||
              (source.typography as Record<string, unknown>).scale === "lg"
                ? ((source.typography as Record<string, unknown>).scale as "sm" | "md" | "lg")
                : prev.typography.scale,
            weight:
              (source.typography as Record<string, unknown>).weight === "normal" ||
              (source.typography as Record<string, unknown>).weight === "semibold" ||
              (source.typography as Record<string, unknown>).weight === "bold"
                ? ((source.typography as Record<string, unknown>).weight as "normal" | "semibold" | "bold")
                : prev.typography.weight,
          }
        : prev.typography,
  };
}

export function designToTokens(design: DesignExtraction): DesignTokens {
  const observed = design.colors.observed;
  const recommended = design.colors.recommended;

  const base = {
    ...DEFAULT_COLOR_TOKENS,
    primary: asHex(recommended.primary, DEFAULT_COLOR_TOKENS.primary),
    secondary: asHex(recommended.secondary, DEFAULT_COLOR_TOKENS.secondary),
    accent: asHex(recommended.accent, DEFAULT_COLOR_TOKENS.accent),
    background: asHex(recommended.background, DEFAULT_COLOR_TOKENS.background),
    surface: asHex(recommended.surface, DEFAULT_COLOR_TOKENS.surface),
    border: blendHex(DEFAULT_COLOR_TOKENS.border, recommended.secondary, 0.2),
    muted: blendHex(DEFAULT_COLOR_TOKENS.muted, observed.secondary, 0.25),
  };

  return {
    colors: base,
    borderRadius: design.theme.borderRadius === "sharp" ? "6px" : "12px",
    spacing: design.theme.spacing,
    shadow: "soft",
    typography: {
      family: "sans",
      scale: "md",
      weight: "semibold",
    },
  };
}

export function createDefaultPreviewModel(design: DesignExtraction): PreviewModel {
  const side = design.navigation.type === "side-nav" || design.navigation.type === "mixed";
  return {
    viewport: "desktop",
    density: design.theme.spacing,
    showLabels: true,
    navStyle: side ? "side" : "top",
    layoutComposition: "balanced",
    heroTitle: "Design Workspace",
    heroSubtitle: design.contentHints.likelyPurpose,
  };
}

export function createDefaultDesignControls(design: DesignExtraction): DesignControls {
  return {
    appStyle: design.layout.structure === "dashboard" ? "transactional" : "hybrid",
    tone: "professional",
    density: design.theme.spacing,
    emphasis: "balanced",
    visualWeight: "balanced",
  };
}

export function applyDesignControls(
  tokens: DesignTokens,
  preview: PreviewModel,
  controls: DesignControls
): { designTokens: DesignTokens; previewModel: PreviewModel } {
  let nextTokens = normalizeDesignTokens(tokens, tokens);
  let nextPreview: PreviewModel = {
    ...preview,
    density: controls.density,
    layoutComposition:
      controls.emphasis === "content"
        ? "content-first"
        : controls.emphasis === "actions"
        ? "action-first"
        : "balanced",
  };

  nextTokens = {
    ...nextTokens,
    spacing: controls.density,
    shadow:
      controls.visualWeight === "light"
        ? "soft"
        : controls.visualWeight === "bold"
        ? "strong"
        : "medium",
    borderRadius:
      controls.appStyle === "transactional"
        ? "10px"
        : controls.appStyle === "media"
        ? "18px"
        : "12px",
    typography: {
      family:
        controls.appStyle === "media"
          ? "display"
          : controls.tone === "friendly"
          ? "humanist"
          : "sans",
      scale:
        controls.density === "compact"
          ? "sm"
          : controls.density === "spacious"
          ? "lg"
          : "md",
      weight:
        controls.visualWeight === "light"
          ? "normal"
          : controls.visualWeight === "bold"
          ? "bold"
          : "semibold",
    },
  };

  if (controls.appStyle === "transactional") {
    nextTokens.colors.primary = blendHex(nextTokens.colors.primary, "#1f3a5f", 0.2);
    nextTokens.colors.background = blendHex(nextTokens.colors.background, "#f5f7fb", 0.18);
    nextPreview = { ...nextPreview, navStyle: "side" };
  }

  if (controls.appStyle === "media") {
    nextTokens.colors.accent = blendHex(nextTokens.colors.accent, "#ff5a5f", 0.26);
    nextTokens.colors.secondary = blendHex(nextTokens.colors.secondary, "#fde7d6", 0.24);
    nextPreview = { ...nextPreview, navStyle: "top" };
  }

  if (controls.tone === "premium") {
    nextTokens.colors.primary = blendHex(nextTokens.colors.primary, "#111827", 0.22);
    nextTokens.colors.surface = blendHex(nextTokens.colors.surface, "#f8fafc", 0.14);
    nextTokens.colors.text = blendHex(nextTokens.colors.text, "#0b1220", 0.2);
  }

  if (controls.tone === "playful") {
    nextTokens.colors.accent = blendHex(nextTokens.colors.accent, "#f97316", 0.3);
    nextTokens.colors.secondary = blendHex(nextTokens.colors.secondary, "#fff4d8", 0.28);
  }

  if (controls.tone === "friendly") {
    nextTokens.colors.primary = blendHex(nextTokens.colors.primary, "#2563eb", 0.14);
    nextTokens.colors.background = blendHex(nextTokens.colors.background, "#f7fbff", 0.2);
  }

  if (controls.visualWeight === "light") {
    nextTokens.colors.border = blendHex(nextTokens.colors.border, "#e8edf6", 0.28);
  }

  if (controls.visualWeight === "bold") {
    nextTokens.colors.border = blendHex(nextTokens.colors.border, "#9aa9c2", 0.35);
    nextTokens.colors.text = blendHex(nextTokens.colors.text, "#0f172a", 0.25);
  }

  return {
    designTokens: normalizeDesignTokens(nextTokens, nextTokens),
    previewModel: nextPreview,
  };
}

export function createInitialWorkspace(): DesignWorkspace {
  const design = normalizeDesign(null);
  const promptKit = buildPromptKit(design);
  const designControls = createDefaultDesignControls(design);
  const initialTokens = designToTokens(design);
  const initialPreview = createDefaultPreviewModel(design);
  const applied = applyDesignControls(initialTokens, initialPreview, designControls);

  return {
    images: [],
    colorReferences: [],
    designExtraction: design,
    designControls,
    promptKit,
    designTokens: applied.designTokens,
    previewModel: applied.previewModel,
    chatHistory: [],
    isUpdating: false,
    extractionRawJson: JSON.stringify(design, null, 2),
    designTokensRawJson: JSON.stringify(applied.designTokens, null, 2),
    promptKitRawText: [
      "[Product Prompt]",
      promptKit.productPrompt,
      "",
      "[Page Prompt]",
      promptKit.pagePrompt,
      "",
      "[Design System Prompt]",
      promptKit.designSystemPrompt,
    ].join("\n"),
    errorMessage: null,
  };
}

export function toUploadedImage(file: File, previewUrl: string): UploadedImage {
  return {
    id: id(),
    file,
    previewUrl,
    tag: "other",
    useAsColorReference: false,
    createdAt: Date.now(),
  };
}

export async function applyColorReferenceBlend(
  image: UploadedImage,
  currentTokens: DesignTokens
): Promise<DesignTokens> {
  const dominant = await extractDominantHexColors(image.file);
  const nextColors = mapPaletteToTokens(dominant, currentTokens.colors);

  return {
    ...currentTokens,
    colors: nextColors,
  };
}

export function mergeWorkspacePatch(
  state: DesignWorkspace,
  patch: DesignWorkspacePatch
): Pick<
  DesignWorkspace,
  | "designExtraction"
  | "designControls"
  | "promptKit"
  | "designTokens"
  | "previewModel"
  | "extractionRawJson"
  | "designTokensRawJson"
  | "promptKitRawText"
> {
  const mergedDesign = patch.designExtraction
    ? normalizeDesign({ ...state.designExtraction, ...patch.designExtraction })
    : state.designExtraction;

  const mergedControls = patch.designControls
    ? normalizeDesignControls({ ...state.designControls, ...patch.designControls }, state.designControls)
    : state.designControls;

  const mergedPromptKit = patch.promptKit
    ? normalizePromptKit({ ...state.promptKit, ...patch.promptKit }, state.promptKit)
    : state.promptKit;

  const baseDesignTokens = patch.designTokens
    ? normalizeDesignTokens({ ...state.designTokens, ...patch.designTokens }, state.designTokens)
    : state.designTokens;

  const basePreview = patch.previewModel
    ? {
        ...state.previewModel,
        ...patch.previewModel,
      }
    : state.previewModel;

  const withControls = applyDesignControls(baseDesignTokens, basePreview, mergedControls);

  return {
    designExtraction: mergedDesign,
    designControls: mergedControls,
    promptKit: mergedPromptKit,
    designTokens: withControls.designTokens,
    previewModel: withControls.previewModel,
    extractionRawJson: JSON.stringify(mergedDesign, null, 2),
    designTokensRawJson: JSON.stringify(withControls.designTokens, null, 2),
    promptKitRawText: [
      "[Product Prompt]",
      mergedPromptKit.productPrompt,
      "",
      "[Page Prompt]",
      mergedPromptKit.pagePrompt,
      "",
      "[Design System Prompt]",
      mergedPromptKit.designSystemPrompt,
    ].join("\n"),
  };
}

export function parsePromptKitRawText(raw: string, fallback: PromptKit): PromptKit {
  const chunks = raw.split(/\n\s*\[(Product Prompt|Page Prompt|Design System Prompt)\]\s*\n/);
  if (chunks.length < 2) {
    return fallback;
  }

  const next = { ...fallback };
  for (let i = 1; i < chunks.length; i += 2) {
    const key = chunks[i];
    const value = (chunks[i + 1] ?? "").trim();
    if (key === "Product Prompt") next.productPrompt = value;
    if (key === "Page Prompt") next.pagePrompt = value;
    if (key === "Design System Prompt") next.designSystemPrompt = value;
  }

  return next;
}

export function createChatMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: id(),
    role,
    content,
    createdAt: Date.now(),
  };
}
