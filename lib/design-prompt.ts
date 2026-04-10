export function buildDesignExtractionPrompt(): string {
  return [
    "You are a UI design extraction assistant.",
    "Analyze the provided interface screenshot/photo and return only JSON.",
    "Do not generate code.",
    "Do not include markdown or explanations.",
    "Infer only what is visually reasonable.",
    "Do not hallucinate exact business facts beyond what can be inferred from visuals.",
    "If unsure, use conservative defaults like unknown or generic labels.",
    "Return strict JSON matching exactly this shape:",
    '{"brand":{"name":"string","tone":"string","personality":["string"]},"theme":{"primaryColor":"string","secondaryColor":"string","accentColor":"string","backgroundStyle":"string","borderRadius":"string","spacing":"compact|comfortable|spacious"},"navigation":{"type":"top-nav|side-nav|mixed|unknown","items":["string"]},"layout":{"structure":"single-column|two-column|dashboard|form-heavy|unknown","sections":[{"type":"header|hero|content|list|side-panel|form|table|cards|footer|unknown","label":"string","importance":"high|medium|low"}]},"contentHints":{"likelyPurpose":"string","dataDensity":"low|medium|high","interactionStyle":"browse|transact|review|edit|mixed"}}',
    "Use arrays for all list fields.",
    "Return JSON only.",
  ].join(" ");
}
