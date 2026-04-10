export function buildDesignExtractionPrompt(): string {
  const jsonShape = JSON.stringify({
    brand: { name: "string", tone: "string", personality: ["string"] },
    theme: {
      primaryColor: "#xxxxxx",
      secondaryColor: "#xxxxxx",
      accentColor: "#xxxxxx",
      backgroundStyle: "string",
      borderRadius: "string",
      spacing: "compact|comfortable|spacious",
    },
    colors: {
      observed: {
        primary: "#xxxxxx",
        secondary: "#xxxxxx",
        accent: "#xxxxxx",
        background: "#xxxxxx",
        surface: "#xxxxxx",
      },
      recommended: {
        primary: "#xxxxxx",
        secondary: "#xxxxxx",
        accent: "#xxxxxx",
        background: "#xxxxxx",
        surface: "#xxxxxx",
      },
    },
    navigation: { type: "top-nav|side-nav|mixed|unknown", items: ["string"] },
    layout: {
      structure: "single-column|two-column|dashboard|form-heavy|unknown",
      sections: [
        {
          type: "header|hero|content|list|side-panel|form|table|cards|footer|unknown",
          label: "string",
          importance: "high|medium|low",
        },
      ],
    },
    contentHints: {
      likelyPurpose: "string",
      dataDensity: "low|medium|high",
      interactionStyle: "browse|transact|review|edit|mixed",
    },
  });

  return [
    "You are a UI design extraction assistant.",
    "Analyze the provided interface screenshot/photo and return only JSON.",
    "Do not generate code.",
    "Do not include markdown or explanations.",

    // Color extraction guidance
    "COLORS — be visually assertive, not conservative:",
    "Identify the most visually dominant colors in the interface.",
    "Identify strong accent colors that stand out clearly.",
    "Prefer clearly visible UI colors over muted or washed-out interpretation.",
    "Avoid washing out colors unless the UI itself is clearly minimal or muted.",
    "Return ALL color values as 6-digit HEX values (e.g. #1f3a5f).",
    "Extract at minimum: primaryColor, secondaryColor, accentColor from theme AND primary/secondary/accent/background/surface from colors.",
    "If unsure of an exact HEX, pick the closest visible color rather than returning a vague description.",

    // Observed vs recommended distinction
    "For the colors object distinguish:",
    "1. observed — the closest HEX to what is directly visible in the image.",
    "2. recommended — a slightly refined version suitable for consistent UI usage (adjust saturation or lightness only slightly if needed).",
    "If observed and recommended would be identical, repeat the same value in both.",

    // Other inference guidance
    "Do not hallucinate exact business facts beyond what can be inferred from visuals.",
    "For non-color fields, use conservative defaults like unknown or generic labels when unsure.",
    "Use arrays for all list fields.",
    `Return strict JSON matching exactly this shape: ${jsonShape}`,
    "Return JSON only.",
  ].join(" ");
}
