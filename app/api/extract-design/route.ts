import { NextRequest, NextResponse } from "next/server";
import {
  normalizeDesign,
  parseDesignJson,
  type DesignExtraction,
} from "@/lib/design-normalizer";
import { buildDesignExtractionPrompt } from "@/lib/design-prompt";

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface OpenAIErrorPayload {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

function safeErrorResponse(
  status: number,
  error: string,
  design: DesignExtraction
) {
  return NextResponse.json(
    {
      ok: false,
      error,
      design,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const fallbackDesign = normalizeDesign(null);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return safeErrorResponse(
      500,
      "Missing OPENAI_API_KEY configuration.",
      fallbackDesign
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return safeErrorResponse(400, "No image uploaded.", fallbackDesign);
  }

  if (!image.type.startsWith("image/")) {
    return safeErrorResponse(400, "Uploaded file must be an image.", fallbackDesign);
  }

  const supportedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  if (!supportedImageTypes.has(image.type)) {
    return safeErrorResponse(
      400,
      "Unsupported image format. Please use JPEG, PNG, WEBP, or GIF. On iPhone, choosing a screenshot usually works best.",
      fallbackDesign
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: buildDesignExtractionPrompt(),
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this UI image and return strict JSON matching the required schema. Return JSON only.",
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      let detail = "Design extraction request failed.";

      try {
        const errorPayload = (await response.json()) as OpenAIErrorPayload;
        const errorCode = errorPayload.error?.code;

        if (response.status === 401 || errorCode === "invalid_api_key") {
          detail = "OpenAI authentication failed. Check OPENAI_API_KEY.";
        } else if (errorCode === "insufficient_quota") {
          detail = "OpenAI quota exceeded. Check your billing and usage limits.";
        } else if (response.status === 404) {
          detail = "Configured OPENAI_MODEL is unavailable for this account.";
        } else if (errorPayload.error?.message) {
          detail = `OpenAI request failed: ${errorPayload.error.message}`;
        }
      } catch {
        // Keep generic error message if error payload is not JSON.
      }

      return safeErrorResponse(502, detail, fallbackDesign);
    }

    const payload = (await response.json()) as OpenAIChatResponse;
    const rawText = payload.choices?.[0]?.message?.content ?? "";
    const parsed = parseDesignJson(rawText);

    if (!parsed) {
      return NextResponse.json({
        ok: true,
        warning: "Model response was not valid JSON. Returned normalized fallback.",
        design: fallbackDesign,
      });
    }

    const design = normalizeDesign(parsed);

    return NextResponse.json({ ok: true, design });
  } catch {
    return safeErrorResponse(
      500,
      "Extraction failed. Please try another image.",
      fallbackDesign
    );
  }
}
