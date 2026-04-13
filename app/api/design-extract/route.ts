import { NextRequest, NextResponse } from "next/server";
import {
  buildDesignExtractPrompt,
  normalizeDesignSystem,
  parseJsonSafe,
} from "@/lib/design-extractor";
import type { DesignSystem, WorkflowApiResult } from "@/types";

interface OpenAIResponsesPayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

function toOutputText(payload: OpenAIResponsesPayload): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((entry) => entry.type === "output_text" && typeof entry.text === "string")
      .map((entry) => entry.text as string)
      .join("\n") ?? ""
  ).trim();
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing OPENAI_API_KEY configuration.",
        data: normalizeDesignSystem(null),
      } satisfies WorkflowApiResult<DesignSystem>,
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.type.startsWith("image/"));

  const referenceUrls = String(formData.get("referenceUrls") || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!files.length && !referenceUrls.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "Provide at least one image or reference URL.",
        data: normalizeDesignSystem(null),
      } satisfies WorkflowApiResult<DesignSystem>,
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const imageInputs = await Promise.all(
      files.slice(0, 6).map(async (file) => ({
        type: "input_image",
        image_url: await fileToDataUrl(file),
      }))
    );

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "You are a design extraction specialist. Extract design system signals consistently across references.",
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildDesignExtractPrompt(referenceUrls),
              },
              ...imageInputs,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "OpenAI Responses API request failed.",
          data: normalizeDesignSystem(null),
        } satisfies WorkflowApiResult<DesignSystem>,
        { status: 502 }
      );
    }

    const payload = (await response.json()) as OpenAIResponsesPayload;
    const rawText = toOutputText(payload);
    const parsed = parseJsonSafe(rawText);
    const normalized = normalizeDesignSystem(parsed);

    return NextResponse.json({
      ok: true,
      data: normalized,
      rawText,
      fallbackUsed: !parsed,
    } satisfies WorkflowApiResult<DesignSystem>);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Design extraction request failed unexpectedly.",
        data: normalizeDesignSystem(null),
      } satisfies WorkflowApiResult<DesignSystem>,
      { status: 500 }
    );
  }
}
