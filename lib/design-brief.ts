import type { DesignExtraction } from "@/lib/design-normalizer";

export interface DesignBrief {
  summary: string;
  likelyPurpose: string;
  tone: string;
  personality: string[];
  navigationType: string;
  layoutStructure: string;
  dataDensity: string;
  interactionStyle: string;
  visualTraits: string[];
}

function titleCase(value: string): string {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildDesignBrief(design: DesignExtraction): DesignBrief {
  const personality = design.brand.personality.length
    ? design.brand.personality
    : ["practical", "clear"];

  const visualTraits = [
    `Primary color ${design.theme.primaryColor}`,
    `Secondary color ${design.theme.secondaryColor}`,
    `Accent color ${design.theme.accentColor}`,
    `${titleCase(design.theme.spacing)} spacing rhythm`,
    `${titleCase(design.theme.borderRadius)} corner radius`,
    `${titleCase(design.theme.backgroundStyle)} background treatment`,
  ];

  const summary =
    `${design.contentHints.likelyPurpose} experience with a ${design.brand.tone} tone, ` +
    `${titleCase(design.layout.structure)} layout structure, and ${titleCase(design.navigation.type)} navigation.`;

  return {
    summary,
    likelyPurpose: design.contentHints.likelyPurpose,
    tone: design.brand.tone,
    personality,
    navigationType: design.navigation.type,
    layoutStructure: design.layout.structure,
    dataDensity: design.contentHints.dataDensity,
    interactionStyle: design.contentHints.interactionStyle,
    visualTraits,
  };
}
