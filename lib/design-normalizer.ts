export interface NormalizedDesign {
  imageUrl: string;
  colors: string[];
  typography: string[];
  layout: string;
  spacing: string;
  components: string[];
}

export function normalizeDesign(raw: Record<string, unknown>): NormalizedDesign {
  return {
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    colors: Array.isArray(raw.colors) ? raw.colors.map(String) : [],
    typography: Array.isArray(raw.typography) ? raw.typography.map(String) : [],
    layout: typeof raw.layout === "string" ? raw.layout : "unknown",
    spacing: typeof raw.spacing === "string" ? raw.spacing : "normal",
    components: Array.isArray(raw.components) ? raw.components.map(String) : [],
  };
}
