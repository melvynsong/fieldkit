import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt-builder";
import { normalizeDesign } from "@/lib/design-normalizer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { imageUrl } = body;

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json(
      { error: "imageUrl is required" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(imageUrl);
  const rawDesign = { prompt, imageUrl };
  const design = normalizeDesign(rawDesign);

  return NextResponse.json({ design });
}
