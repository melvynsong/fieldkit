import { NextRequest, NextResponse } from "next/server";

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
  };
}

interface DesignChatBody {
  message?: string;
  workspace?: unknown;
}

function safePatch(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const source = raw as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};

  if (source.designTokens && typeof source.designTokens === "object") {
    allowed.designTokens = source.designTokens;
  }

  if (source.previewModel && typeof source.previewModel === "object") {
    allowed.previewModel = source.previewModel;
  }

  if (source.designExtraction && typeof source.designExtraction === "object") {
    allowed.designExtraction = source.designExtraction;
  }

  if (source.promptKit && typeof source.promptKit === "object") {
    allowed.promptKit = source.promptKit;
  }

  return allowed;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OPENAI_API_KEY configuration.", patch: {} },
      { status: 500 }
    );
  }

  let body: DesignChatBody;
  try {
    body = (await request.json()) as DesignChatBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body.", patch: {} },
      { status: 400 }
    );
  }

  const userMessage = typeof body.message === "string" ? body.message.trim() : "";
  if (!userMessage) {
    return NextResponse.json(
      { ok: false, error: "Message is required.", patch: {} },
      { status: 400 }
    );
  }

  const workspaceSummary = JSON.stringify(body.workspace ?? {}, null, 2);

  const systemPrompt = [
    "You are a UI design workspace patch generator.",
    "Return JSON ONLY.",
    "No markdown, no explanation.",
    "Generate a minimal structured patch object using only these top-level keys when needed:",
    "designTokens, previewModel, designExtraction, promptKit",
    "Do not include unknown keys.",
    "Do not overwrite unrelated fields.",
    "Colors must be 6-digit HEX where applicable.",
    "Example:",
    '{"designTokens":{"borderRadius":"12px","colors":{"primary":"#6B5CFF"}},"previewModel":{"density":"comfortable"}}',
  ].join(" ");

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
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
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              "Current workspace snapshot:",
              workspaceSummary,
              "",
              "User request:",
              userMessage,
              "",
              "Return only the patch JSON.",
            ].join("\n"),
          },
        ],
      }),
    });

    if (!response.ok) {
      let detail = "Design chat request failed.";
      try {
        const payload = (await response.json()) as OpenAIErrorPayload;
        if (payload.error?.message) {
          detail = payload.error.message;
        }
      } catch {
        // noop
      }

      return NextResponse.json(
        { ok: false, error: detail, patch: {} },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as OpenAIChatResponse;
    const content = payload.choices?.[0]?.message?.content ?? "{}";

    let parsed: unknown = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const first = content.indexOf("{");
      const last = content.lastIndexOf("}");
      if (first >= 0 && last > first) {
        try {
          parsed = JSON.parse(content.slice(first, last + 1));
        } catch {
          parsed = {};
        }
      }
    }

    return NextResponse.json({ ok: true, patch: safePatch(parsed) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to process design chat update.", patch: {} },
      { status: 500 }
    );
  }
}
