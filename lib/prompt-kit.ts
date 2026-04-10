import type { DesignExtraction } from "@/lib/design-normalizer";

export interface PromptKit {
  productPrompt: string;
  pagePrompt: string;
  designSystemPrompt: string;
}

function joinOrFallback(values: string[], fallback: string): string {
  return values.length ? values.join(", ") : fallback;
}

export function buildPromptKit(design: DesignExtraction): PromptKit {
  const sectionLabels = design.layout.sections.map((section) => section.label);
  const personality = joinOrFallback(design.brand.personality, "clear, practical");
  const navItems = joinOrFallback(design.navigation.items, "Home, Dashboard, Settings");
  const sections = joinOrFallback(sectionLabels, "Header, Content, Supporting Section");
  const rec = design.colors.recommended;
  const colorSpec = `primary ${rec.primary}, accent ${rec.accent}, background ${rec.background}, surface ${rec.surface}`;

  const productPrompt = [
    "Define a product experience direction based on this visual style:",
    `Likely purpose: ${design.contentHints.likelyPurpose}.`,
    `Brand tone: ${design.brand.tone}. Personality cues: ${personality}.`,
    `Navigation style: ${design.navigation.type} with items such as ${navItems}.`,
    `Layout: ${design.layout.structure} with key sections: ${sections}.`,
    `Visual traits: ${colorSpec}, ${design.theme.spacing} spacing, ${design.theme.borderRadius} radius, ${design.theme.backgroundStyle} backgrounds.`,
    `Use a ${rec.primary} primary color with ${rec.background} backgrounds and ${rec.accent} accent highlights.`,
    "Maintain a consistent hierarchy and clear action flow.",
  ].join("\n");

  const pagePrompt = [
    "Create a new page concept that matches the extracted interface direction.",
    `Use a ${design.layout.structure} structure with ${design.navigation.type} navigation.`,
    `Keep interaction style ${design.contentHints.interactionStyle} and data density ${design.contentHints.dataDensity}.`,
    `Include sections aligned to: ${sections}.`,
    `Apply the color palette: primary ${rec.primary}, accent ${rec.accent}, background ${rec.background}.`,
    "Preserve balance between overview, details, and action areas.",
    "Keep copy and labels generic and reusable for prototyping.",
  ].join("\n");

  const designSystemPrompt = [
    "Produce a design system direction brief that preserves the extracted interface character.",
    `Tone: ${design.brand.tone}; personality: ${personality}.`,
    `Navigation pattern: ${design.navigation.type}; expected nav labels: ${navItems}.`,
    `Hierarchy and layout pattern: ${design.layout.structure} with ${sections}.`,
    `Color tokens: primary ${rec.primary}, secondary ${rec.secondary}, accent ${rec.accent}, background ${rec.background}, surface ${rec.surface}.`,
    `Spatial system: ${design.theme.spacing}; corner radius style: ${design.theme.borderRadius}.`,
    "Keep behavior and layout consistent across future pages.",
  ].join("\n");

  return {
    productPrompt,
    pagePrompt,
    designSystemPrompt,
  };
}
