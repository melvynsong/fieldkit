"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

const QUICK_PROMPTS = [
  "Make this more premium",
  "Simplify this screen",
  "Add a confirmation step",
  "Change tone to friendly",
  "Reduce text",
  "Make this more action-driven",
];

export default function AIChatPanel() {
  const [message, setMessage] = useState("");
  const applyBuildChatPrompt = useWorkflowStore((state) => state.applyBuildChatPrompt);
  const isApplyingBuildChat = useWorkflowStore((state) => state.isApplyingBuildChat);
  const chatHistory = useWorkflowStore((state) => state.chatHistory);
  const buildAiHistory = useWorkflowStore((state) => state.buildAiHistory);

  function submit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    void applyBuildChatPrompt(trimmed);
    setMessage("");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">AI Build Co-Pilot</h3>
      <p className="mt-1 text-xs text-slate-600">
        Ask for tone, hierarchy, copy, or flow refinements while preserving the core screen purpose.
      </p>

      <div className="mt-3 max-h-40 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        {!chatHistory.length ? (
          <p className="text-xs text-slate-500">No chat messages yet.</p>
        ) : (
          chatHistory.slice(-8).map((item) => (
            <p
              key={item.id}
              className={`rounded-md px-2 py-1.5 text-xs ${
                item.role === "user"
                  ? "ml-5 bg-slate-900 text-white"
                  : "mr-5 border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item.content}
            </p>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. Make this more premium"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={isApplyingBuildChat || !message.trim()}
          onClick={() => submit(message)}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isApplyingBuildChat ? "Applying..." : "Send"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => submit(prompt)}
            className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      {buildAiHistory.length ? (
        <p className="mt-2 text-xs text-slate-500">Applied build iterations: {buildAiHistory.length}</p>
      ) : null}
    </section>
  );
}
