import type { DesignSystem } from "@/types";

export interface WireframeStyle {
  frameClass: string;
  sectionClass: string;
  navClass: string;
  actionClass: string;
  placeholderClass: string;
}

export function wireframeStyleForDesign(design: DesignSystem): WireframeStyle {
  if (design.tone === "transactional") {
    return {
      frameClass: "rounded-lg border",
      sectionClass: "rounded-md border",
      navClass: "rounded-md border",
      actionClass: "rounded-md border px-2 py-1 text-[11px] font-semibold",
      placeholderClass: "h-2.5 rounded",
    };
  }

  if (design.tone === "media") {
    return {
      frameClass: "rounded-xl border",
      sectionClass: "rounded-lg border",
      navClass: "rounded-lg border",
      actionClass: "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
      placeholderClass: "h-3 rounded-sm",
    };
  }

  return {
    frameClass: "rounded-lg border",
    sectionClass: "rounded-lg border",
    navClass: "rounded-md border",
    actionClass: "rounded-lg border px-2 py-1 text-[11px] font-semibold",
    placeholderClass: "h-2.5 rounded",
  };
}

export function spacingClass(density: DesignSystem["density"]): string {
  return density === "compact"
    ? "gap-2 p-2"
    : density === "spacious"
    ? "gap-5 p-5"
    : "gap-3 p-3";
}

export function sectionColumnsForTone(tone: DesignSystem["tone"]): string {
  return tone === "transactional"
    ? "grid-cols-1"
    : tone === "media"
    ? "grid-cols-1 md:grid-cols-2"
    : "grid-cols-1";
}
