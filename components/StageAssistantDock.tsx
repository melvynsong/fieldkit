"use client";

import { useMemo, useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

const QUICK_PROMPTS = [
  "Make this more premium",
  "Reduce visual noise",
  "Increase CTA clarity",
  "Tighten spacing",
];

export default function StageAssistantDock() {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  const currentStage = useWorkflowStore((state) => state.currentStage);
  const chatHistory = useWorkflowStore((state) => state.chatHistory);
  const refineByChat = useWorkflowStore((state) => state.refineByChat);
  const applyBuildChatPrompt = useWorkflowStore((state) => state.applyBuildChatPrompt);
  const isRefining = useWorkflowStore((state) => state.isRefining);
  const isApplyingBuildChat = useWorkflowStore((state) => state.isApplyingBuildChat);

  const isVisible = currentStage === "design" || currentStage === "build-iterate";
  const isStage2 = currentStage === "design";
  const isWorking = isStage2 ? isRefining : isApplyingBuildChat;

  const scopeLabel = useMemo(() => {
    if (currentStage === "design") return "Applying changes to Stage 2";
    if (currentStage === "build-iterate") return "Applying changes to Stage 3";
    return "Assistant inactive";
  }, [currentStage]);

  function submit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || !isVisible) return;

    if (isStage2) {
      void refineByChat(trimmed);
    } else {
      void applyBuildChatPrompt(trimmed);
    }

    setMessage("");
  }

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="pointer-events-none fixed right-4 bottom-4 z-40 w-[330px] max-w-[calc(100vw-2rem)]">
      <section className="pointer-events-auto rounded-2xl border border-slate-300 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.2)] backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">AI Assistant</p>
            <p className="text-xs font-medium text-slate-700">{scopeLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
          >
            {open ? "Minimize" : "Open"}
          </button>
        </div>

        {open ? (
          <>
            <div className="mt-2 max-h-36 space-y-1.5 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
              {!chatHistory.length ? (
                <p className="text-xs text-slate-500">No messages yet.</p>
              ) : (
                chatHistory.slice(-6).map((item) => (
                  <p
                    key={item.id}
                    className={`rounded px-2 py-1 text-xs ${
                      item.role === "user"
                        ? "ml-4 bg-slate-900 text-white"
                        : "mr-4 border border-slate-200 bg-white text-slate-700"
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
                placeholder={isStage2 ? "Refine Stage 2 design..." : "Refine Stage 3 build flow..."}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => submit(message)}
                disabled={isWorking || !message.trim()}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {isWorking ? "Applying..." : "Apply"}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submit(prompt)}
                  className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </aside>
  );
}
