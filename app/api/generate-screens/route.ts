import { NextRequest, NextResponse } from "next/server";
import {
  buildGenerateScreensPrompt,
  normalizeScreenGeneration,
  parseJsonSafe,
} from "@/lib/screen-generator";
import type {
  DesignSystem,
  ProblemDiscovery,
  ScreenGenerationResult,
  WorkflowApiResult,
} from "@/types";

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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing OPENAI_API_KEY configuration.",
        data: normalizeScreenGeneration(null),
      } satisfies WorkflowApiResult<ScreenGenerationResult>,
      { status: 500 }
    );
  }

  const body = (await request.json()) as {
    problem?: ProblemDiscovery;
    design?: DesignSystem;
    plannedScreens?: Array<{ screenName: string; userAction: string; purpose: string }>;
    chatInstruction?: string;
  };

  if (!body.problem || !body.design) {
    return NextResponse.json(
      {
        ok: false,
        error: "Problem discovery and design system are required.",
        data: normalizeScreenGeneration(null),
      } satisfies WorkflowApiResult<ScreenGenerationResult>,
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
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
              "You are a product flow planner. Keep outputs concise, problem-aligned, and implementation-agnostic.",
          },
          {
            role: "user",
            content: buildGenerateScreensPrompt(
              body.problem,
              body.design,
              body.plannedScreens,
              body.chatInstruction
            ),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "OpenAI Responses API request failed.",
          data: normalizeScreenGeneration(null),
        } satisfies WorkflowApiResult<ScreenGenerationResult>,
        { status: 502 }
      );
    }

    const payload = (await response.json()) as OpenAIResponsesPayload;
    const rawText = toOutputText(payload);
    const parsed = parseJsonSafe(rawText);
    const normalized = normalizeScreenGeneration(parsed);

    return NextResponse.json({
      ok: true,
      data: normalized,
      rawText,
      fallbackUsed: !parsed,
    } satisfies WorkflowApiResult<ScreenGenerationResult>);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Screen generation request failed unexpectedly.",
        data: normalizeScreenGeneration(null),
      } satisfies WorkflowApiResult<ScreenGenerationResult>,
      { status: 500 }
    );
  }
}
