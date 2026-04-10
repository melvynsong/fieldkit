import type { ColorTokens } from "@/lib/workspace-types";

const DEFAULT_COLORS: ColorTokens = {
  primary: "#1f3a5f",
  secondary: "#eaf1f8",
  accent: "#5b7cfa",
  background: "#f5f7fb",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#dbe4ef",
};

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(clamp(r))}${toHex(clamp(g))}${toHex(clamp(b))}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return null;
  }
  const int = Number.parseInt(cleaned, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function blendHex(baseHex: string, incomingHex: string, ratio: number): string {
  const base = hexToRgb(baseHex);
  const incoming = hexToRgb(incomingHex);
  if (!base || !incoming) {
    return baseHex;
  }

  const alpha = Math.max(0, Math.min(1, ratio));
  const r = Math.round(base[0] * (1 - alpha) + incoming[0] * alpha);
  const g = Math.round(base[1] * (1 - alpha) + incoming[1] * alpha);
  const b = Math.round(base[2] * (1 - alpha) + incoming[2] * alpha);

  return rgbToHex(r, g, b);
}

function normalizeHex(value: string, fallback: string): string {
  const cleaned = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : fallback;
}

function pickDistinct(colors: string[]): string[] {
  const out: string[] = [];

  for (const color of colors) {
    const rgb = hexToRgb(color);
    if (!rgb) continue;

    const isClose = out.some((existing) => {
      const existingRgb = hexToRgb(existing);
      if (!existingRgb) return false;
      const distance =
        Math.abs(existingRgb[0] - rgb[0]) +
        Math.abs(existingRgb[1] - rgb[1]) +
        Math.abs(existingRgb[2] - rgb[2]);
      return distance < 52;
    });

    if (!isClose) {
      out.push(color);
    }

    if (out.length >= 8) {
      break;
    }
  }

  return out;
}

export async function extractDominantHexColors(file: File): Promise<string[]> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load color reference image."));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return [];
    }

    const maxSize = 120;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const bucket = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 64) continue;

      const r = Math.round(data[i] / 24) * 24;
      const g = Math.round(data[i + 1] / 24) * 24;
      const b = Math.round(data[i + 2] / 24) * 24;
      const hex = rgbToHex(r, g, b);
      bucket.set(hex, (bucket.get(hex) ?? 0) + 1);
    }

    const sorted = Array.from(bucket.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    return pickDistinct(sorted);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function findAccent(colors: string[]): string {
  for (const hex of colors) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    const [r, g, b] = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min > 70 && luminance(rgb) > 70 && luminance(rgb) < 220) {
      return hex;
    }
  }
  return colors[2] ?? DEFAULT_COLORS.accent;
}

export function mapPaletteToTokens(colors: string[], base: ColorTokens): ColorTokens {
  const primary = normalizeHex(colors[0] ?? base.primary, base.primary);
  const secondary = normalizeHex(colors[1] ?? base.secondary, base.secondary);
  const accent = normalizeHex(findAccent(colors), base.accent);

  const darkSorted = [...colors]
    .filter((hex) => /^#[0-9a-fA-F]{6}$/.test(hex))
    .sort((a, b) => {
      const la = luminance(hexToRgb(a) ?? [0, 0, 0]);
      const lb = luminance(hexToRgb(b) ?? [0, 0, 0]);
      return la - lb;
    });

  const text = normalizeHex(darkSorted[0] ?? base.text, base.text);
  const background = normalizeHex(darkSorted[darkSorted.length - 1] ?? base.background, base.background);

  return {
    primary: blendHex(base.primary, primary, 0.35),
    secondary: blendHex(base.secondary, secondary, 0.35),
    accent: blendHex(base.accent, accent, 0.42),
    background: blendHex(base.background, background, 0.2),
    surface: blendHex(base.surface, background, 0.08),
    text: blendHex(base.text, text, 0.2),
    muted: blendHex(base.muted, secondary, 0.25),
    border: blendHex(base.border, secondary, 0.18),
  };
}

export const DEFAULT_COLOR_TOKENS = DEFAULT_COLORS;
