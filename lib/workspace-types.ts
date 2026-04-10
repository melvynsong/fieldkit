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
}

export interface PreviewModel {
  viewport: PreviewViewport;
  density: "compact" | "comfortable" | "spacious";
  showLabels: boolean;
  navStyle: "top" | "side";
  heroTitle: string;
  heroSubtitle: string;
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
  promptKit: PromptKit;
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
  promptKit?: Partial<PromptKit>;
  designTokens?: Partial<DesignTokens>;
  previewModel?: Partial<PreviewModel>;
}
