import type { DesignExtraction } from "@/lib/design-normalizer";
import type { PromptKit } from "@/lib/prompt-kit";

export type ImageTag =
  | "layout"
  | "navigation"
  | "mobile"
  | "desktop"
  | "branding"
  | "content"
  | "other";

export type PreviewViewport = "desktop" | "mobile";

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  tag: ImageTag;
  useAsColorReference: boolean;
  createdAt: number;
}

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  borderRadius: string;
  spacing: "compact" | "comfortable" | "spacious";
  shadow: "soft" | "medium" | "strong";
  typography: {
    family: "sans" | "display" | "humanist";
    scale: "sm" | "md" | "lg";
    weight: "normal" | "semibold" | "bold";
  };
}

export interface PreviewModel {
  viewport: PreviewViewport;
  density: "compact" | "comfortable" | "spacious";
  showLabels: boolean;
  navStyle: "top" | "side";
  layoutComposition: "content-first" | "action-first" | "balanced";
  heroTitle: string;
  heroSubtitle: string;
}

export interface DesignControls {
  appStyle: "transactional" | "media" | "hybrid";
  tone: "professional" | "playful" | "premium" | "friendly";
  density: "compact" | "comfortable" | "spacious";
  emphasis: "content" | "actions" | "balanced";
  visualWeight: "light" | "balanced" | "bold";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface DesignWorkspace {
  images: UploadedImage[];
  colorReferences: UploadedImage[];
  designExtraction: DesignExtraction;
  designControls: DesignControls;
  promptKit: PromptKit;
  baseDesignTokens: DesignTokens;
  designTokens: DesignTokens;
  previewModel: PreviewModel;
  chatHistory: ChatMessage[];
  isUpdating: boolean;
  extractionRawJson: string;
  designTokensRawJson: string;
  promptKitRawText: string;
  errorMessage: string | null;
}

export interface DesignWorkspacePatch {
  designExtraction?: Partial<DesignExtraction>;
  designControls?: Partial<DesignControls>;
  promptKit?: Partial<PromptKit>;
  designTokens?: Partial<DesignTokens>;
  previewModel?: Partial<PreviewModel>;
}
