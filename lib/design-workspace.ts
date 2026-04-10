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
  };
}

export function createDefaultPreviewModel(design: DesignExtraction): PreviewModel {
  const side = design.navigation.type === "side-nav" || design.navigation.type === "mixed";
  return {
    viewport: "desktop",
    density: design.theme.spacing,
    showLabels: true,
    navStyle: side ? "side" : "top",
    heroTitle: "Design Workspace",
    heroSubtitle: design.contentHints.likelyPurpose,
  };
}

export function createInitialWorkspace(): DesignWorkspace {
  const design = normalizeDesign(null);
  const promptKit = buildPromptKit(design);
  const designTokens = designToTokens(design);

  return {
    images: [],
    colorReferences: [],
    designExtraction: design,
    promptKit,
    designTokens,
    previewModel: createDefaultPreviewModel(design),
    chatHistory: [],
    isUpdating: false,
    extractionRawJson: JSON.stringify(design, null, 2),
    designTokensRawJson: JSON.stringify(designTokens, null, 2),
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
  "designExtraction" | "promptKit" | "designTokens" | "previewModel" | "extractionRawJson" | "designTokensRawJson" | "promptKitRawText"
> {
  const mergedDesign = patch.designExtraction
    ? normalizeDesign({ ...state.designExtraction, ...patch.designExtraction })
    : state.designExtraction;

  const mergedPromptKit = patch.promptKit
    ? normalizePromptKit({ ...state.promptKit, ...patch.promptKit }, state.promptKit)
    : state.promptKit;

  const mergedDesignTokens = patch.designTokens
    ? normalizeDesignTokens({ ...state.designTokens, ...patch.designTokens }, state.designTokens)
    : state.designTokens;

  const mergedPreview = patch.previewModel
    ? {
        ...state.previewModel,
        ...patch.previewModel,
      }
    : state.previewModel;

  return {
    designExtraction: mergedDesign,
    promptKit: mergedPromptKit,
    designTokens: mergedDesignTokens,
    previewModel: mergedPreview,
    extractionRawJson: JSON.stringify(mergedDesign, null, 2),
    designTokensRawJson: JSON.stringify(mergedDesignTokens, null, 2),
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
