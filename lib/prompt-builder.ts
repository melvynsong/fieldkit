export function buildPrompt(imageUrl: string): string {
  return `You are a design analysis assistant. Analyze the following design image and extract its key visual properties.

Image: ${imageUrl}

Return a JSON object with the following fields:
- colors: primary and secondary color palette (hex values)
- typography: font families and sizes used
- layout: overall layout structure (e.g. card, grid, list)
- spacing: spacing scale used (tight, normal, loose)
- components: list of UI components identified

Respond with valid JSON only.`;
}
