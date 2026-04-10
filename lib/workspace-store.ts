"use client";

import { create } from "zustand";
import { buildPromptKit } from "@/lib/prompt-kit";
import {
  applyColorReferenceBlend,
  createChatMessage,
  createDefaultPreviewModel,
  createInitialWorkspace,
  designToTokens,
  mergeWorkspacePatch,
  normalizeDesignTokens,
  parsePromptKitRawText,
  toUploadedImage,
} from "@/lib/design-workspace";
import { normalizeDesign, parseDesignJson } from "@/lib/design-normalizer";
import type { DesignWorkspacePatch, ImageTag } from "@/lib/workspace-types";

interface WorkspaceStore {
  state: ReturnType<typeof createInitialWorkspace>;
  addImages: (files: FileList | File[]) => void;
  removeImage: (id: string) => void;
  updateImageTag: (id: string, tag: ImageTag) => void;
  toggleColorReference: (id: string) => Promise<void>;
  setPreviewViewport: (viewport: "desktop" | "mobile") => void;
  setUpdating: (value: boolean) => void;
  setError: (message: string | null) => void;
  appendChatMessage: (role: "user" | "assistant", content: string) => void;
  applyPatch: (patch: DesignWorkspacePatch) => void;
  runExtraction: () => Promise<void>;
  applyExtractionRaw: (raw: string) => boolean;
  applyDesignTokensRaw: (raw: string) => boolean;
  applyPromptKitRaw: (raw: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  state: createInitialWorkspace(),

  addImages: (files) => {
    const nextFiles = Array.from(files);

    set((current) => {
      const existing = current.state.images;
      const additions = nextFiles.map((file) =>
        toUploadedImage(file, URL.createObjectURL(file))
      );

      const images = [...existing, ...additions];
      return {
        state: {
          ...current.state,
          images,
          colorReferences: images.filter((image) => image.useAsColorReference),
          errorMessage: null,
        },
      };
    });
  },

  removeImage: (id) => {
    set((current) => {
      const match = current.state.images.find((image) => image.id === id);
      if (match) {
        URL.revokeObjectURL(match.previewUrl);
      }

      const images = current.state.images.filter((image) => image.id !== id);

      return {
        state: {
          ...current.state,
          images,
          colorReferences: images.filter((image) => image.useAsColorReference),
        },
      };
    });
  },

  updateImageTag: (id, tag) => {
    set((current) => ({
      state: {
        ...current.state,
        images: current.state.images.map((image) =>
          image.id === id ? { ...image, tag } : image
        ),
      },
    }));
  },

  toggleColorReference: async (id) => {
    let selectedImage = null as ReturnType<typeof createInitialWorkspace>["images"][number] | null;

    set((current) => {
      const images = current.state.images.map((image) => {
        if (image.id !== id) return image;
        const updated = { ...image, useAsColorReference: !image.useAsColorReference };
        selectedImage = updated.useAsColorReference ? updated : null;
        return updated;
      });

      return {
        state: {
          ...current.state,
          images,
          colorReferences: images.filter((image) => image.useAsColorReference),
        },
      };
    });

    if (!selectedImage) {
      return;
    }

    set((current) => ({
      state: {
        ...current.state,
        isUpdating: true,
        errorMessage: null,
      },
    }));

    try {
      const current = get().state;
      const nextTokens = await applyColorReferenceBlend(selectedImage, current.designTokens);
      set((snapshot) => ({
        state: {
          ...snapshot.state,
          isUpdating: false,
          designTokens: nextTokens,
          designTokensRawJson: JSON.stringify(nextTokens, null, 2),
        },
      }));
    } catch {
      set((snapshot) => ({
        state: {
          ...snapshot.state,
          isUpdating: false,
          errorMessage: "Color palette extraction failed for this image.",
        },
      }));
    }
  },

  setPreviewViewport: (viewport) => {
    set((current) => ({
      state: {
        ...current.state,
        previewModel: { ...current.state.previewModel, viewport },
      },
    }));
  },

  setUpdating: (value) => {
    set((current) => ({
      state: {
        ...current.state,
        isUpdating: value,
      },
    }));
  },

  setError: (message) => {
    set((current) => ({
      state: {
        ...current.state,
        errorMessage: message,
      },
    }));
  },

  appendChatMessage: (role, content) => {
    set((current) => ({
      state: {
        ...current.state,
        chatHistory: [...current.state.chatHistory, createChatMessage(role, content)],
      },
    }));
  },

  applyPatch: (patch) => {
    set((current) => ({
      state: {
        ...current.state,
        ...mergeWorkspacePatch(current.state, patch),
      },
    }));
  },

  runExtraction: async () => {
    const state = get().state;
    if (state.images.length === 0) {
      set((current) => ({
        state: {
          ...current.state,
          errorMessage: "Upload at least one image to extract a design system.",
        },
      }));
      return;
    }

    const primaryImage =
      state.images.find((image) => !image.useAsColorReference) ?? state.images[0];

    set((current) => ({
      state: {
        ...current.state,
        isUpdating: true,
        errorMessage: null,
      },
    }));

    try {
      const formData = new FormData();
      formData.append("image", primaryImage.file);

      const response = await fetch("/api/extract-design", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        design?: unknown;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Design extraction failed.");
      }

      const design = normalizeDesign(payload.design);
      const promptKit = buildPromptKit(design);
      let designTokens = designToTokens(design);

      const firstColorRef = state.colorReferences[0];
      if (firstColorRef) {
        designTokens = await applyColorReferenceBlend(firstColorRef, designTokens);
      }

      set((snapshot) => ({
        state: {
          ...snapshot.state,
          isUpdating: false,
          designExtraction: design,
          promptKit,
          designTokens,
          previewModel: createDefaultPreviewModel(design),
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
        },
      }));
    } catch (error) {
      set((snapshot) => ({
        state: {
          ...snapshot.state,
          isUpdating: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Failed to extract design from uploaded image.",
        },
      }));
    }
  },

  applyExtractionRaw: (raw) => {
    const parsed = parseDesignJson(raw);
    if (!parsed) {
      return false;
    }

    const design = normalizeDesign(parsed);
    const promptKit = buildPromptKit(design);

    set((current) => {
      const designTokens = designToTokens(design);
      const navStyle: "side" | "top" =
        design.navigation.type === "side-nav" || design.navigation.type === "mixed"
          ? "side"
          : "top";
      const next = {
        ...current.state,
        designExtraction: design,
        promptKit,
        previewModel: {
          ...current.state.previewModel,
          density: design.theme.spacing,
          navStyle,
        },
        extractionRawJson: JSON.stringify(design, null, 2),
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
      };

      return {
        state: {
          ...next,
          designTokens,
          designTokensRawJson: JSON.stringify(designTokens, null, 2),
        },
      };
    });

    return true;
  },

  applyDesignTokensRaw: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeDesignTokens(parsed, get().state.designTokens);

      set((current) => ({
        state: {
          ...current.state,
          designTokens: normalized,
          designTokensRawJson: JSON.stringify(normalized, null, 2),
          errorMessage: null,
        },
      }));
      return true;
    } catch {
      return false;
    }
  },

  applyPromptKitRaw: (raw) => {
    const nextPromptKit = parsePromptKitRawText(raw, get().state.promptKit);

    set((current) => ({
      state: {
        ...current.state,
        promptKit: nextPromptKit,
        promptKitRawText: raw,
        errorMessage: null,
      },
    }));

    return true;
  },
}));
