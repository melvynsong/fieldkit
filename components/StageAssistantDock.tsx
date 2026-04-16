"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

// ─── types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "confirming" | "applying" | "done";

// ─── quick prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "Make this more premium",
  "Reduce visual noise",
  "Increase CTA clarity",
  "Tighten spacing",
];

// ─── hint builder ─────────────────────────────────────────────────────────────

function buildHint(instruction: string): string {
  const s = instruction.toLowerCase();
  if (/premium|luxury|elevat/.test(s))
    return "elevated typography, refined spacing, and richer colour treatment across the screens";
  if (/simpl|reduc|clean|minimal|noise/.test(s))
    return "fewer elements, more whitespace, and a cleaner visual hierarchy";
  if (/cta|button|action|click|call.to/.test(s))
    return "more prominent buttons and clearer call-to-action placement";
  if (/spacing|tight|dense|compact|pad/.test(s))
    return "adjusted padding and rhythm throughout the layout";
  if (/tone|friendly|warm|approachable/.test(s))
    return "warmer copy and a more approachable visual tone";
  if (/dark|light|colou?r|contrast/.test(s))
    return "colour scheme and contrast adjustments";
  if (/font|type|text|heading|title/.test(s))
    return "typography scale and text hierarchy changes";
  return "layout, copy, and flow adjustments reflecting your instruction";
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StageAssistantDock() {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingMessage, setPendingMessage] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  const currentStage = useWorkflowStore((state) => state.currentStage);
  const chatHistory = useWorkflowStore((state) => state.chatHistory);
  const refineByChat = useWorkflowStore((state) => state.refineByChat);
  const applyBuildChatPrompt = useWorkflowStore((state) => state.applyBuildChatPrompt);

  const isVisible = currentStage === "design" || currentStage === "build-iterate";
  const isStage2 = currentStage === "design";
  const stageLabel = isStage2 ? "Stage 2 — Design" : "Stage 3 — Build & Iterate";

  // ── step 1: user submits instruction → confirming phase ───────────────────
  function handleSubmit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || !isVisible) return;
    setPendingMessage(trimmed);
    setMessage("");
    setPhase("confirming");
  }

  // ── step 2: user confirms → apply changes ─────────────────────────────────
  async function handleConfirm() {
    setPhase("applying");

    try {
      if (isStage2) {
        await refineByChat(pendingMessage);
      } else {
        await applyBuildChatPrompt(pendingMessage);
      }

      // Read updated state after async call resolves
      const updated = useWorkflowStore.getState();

      if (updated.error) {
        setResultSummary(`Could not apply changes: ${updated.error}`);
      } else {
        const screens = updated.generatedScreens?.screens ?? [];
        const names = screens.map((s) => s.screenName).filter(Boolean);

        if (names.length) {
          const hint = buildHint(pendingMessage);
          setResultSummary(
            `Applied to ${names.length} screen${names.length > 1 ? "s" : ""}: ${names.join(", ")}.\n\nWhat to look for: ${hint}.`
          );
        } else {
          setResultSummary("Changes applied. Review the preview for updates.");
        }
      }
    } catch {
      setResultSummary("Something went wrong. Please try again.");
    }

    setPhase("done");
  }

  function handleCancel() {
    setPendingMessage("");
    setPhase("idle");
  }

  function handleDismiss() {
    setResultSummary("");
    setPendingMessage("");
    setPhase("idle");
  }

  if (!isVisible) return null;

  return (
    <aside className="pointer-events-none fixed right-4 bottom-4 z-40 w-[340px] max-w-[calc(100vw-2rem)]">
      <section className="pointer-events-auto rounded-[10px] border border-gov-border bg-white shadow-[0_18px_48px_rgba(26,44,91,0.16)]">

        {/* ── header ── */}
        <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-3 border-b border-gov-border">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gov-muted">AI Assistant</p>
            <p className="text-xs font-semibold text-gov-navy">{stageLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-gov-border bg-gov-page-bg px-2.5 py-1 text-[11px] font-semibold text-gov-navy"
          >
            {open ? "Minimize" : "Open"}
          </button>
        </div>

        {open && (
          <div className="p-3.5 space-y-3">

            {/* ── phase: confirming ── */}
            {phase === "confirming" && (
              <div className="rounded-[8px] border border-gov-navy-light bg-gov-navy-light p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gov-navy mb-2">
                  Confirm instruction
                </p>
                <p className="text-xs leading-5 text-slate-800">
                  <span className="font-medium">I'll apply:</span>{" "}
                  <span className="italic">"{pendingMessage}"</span>
                </p>
                <p className="mt-1 text-[11px] text-gov-muted">
                  This will update {isStage2 ? "Stage 2 design screens" : "Stage 3 build screens"}.
                  Confirm to proceed.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleConfirm()}
                    className="flex-1 rounded-[6px] bg-gov-navy px-3 py-2 text-xs font-semibold text-white hover:bg-[#2A3F7E] transition"
                  >
                    Confirm &amp; Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-[6px] border border-gov-border bg-white px-3 py-2 text-xs font-semibold text-gov-navy"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── phase: applying ── */}
            {phase === "applying" && (
              <div className="rounded-[8px] border border-gov-border bg-gov-page-bg p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-gov-navy" />
                  <p className="text-xs font-semibold text-gov-navy">Applying changes…</p>
                </div>
                <p className="mt-1.5 text-xs text-gov-muted italic">"{pendingMessage}"</p>
                <p className="mt-2 text-[11px] text-gov-muted">
                  This may take a few seconds. The preview will update when ready.
                </p>
              </div>
            )}

            {/* ── phase: done ── */}
            {phase === "done" && (
              <div className="rounded-[8px] border border-gov-border bg-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gov-navy">Done</p>
                </div>
                <p className="text-xs leading-5 text-slate-700 whitespace-pre-line">{resultSummary}</p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="mt-3 rounded-[6px] border border-gov-border bg-gov-page-bg px-3 py-1.5 text-[11px] font-semibold text-gov-navy"
                >
                  New instruction
                </button>
              </div>
            )}

            {/* ── phase: idle — chat history + input ── */}
            {phase === "idle" && (
              <>
                <div className="max-h-36 space-y-1.5 overflow-auto rounded-[8px] border border-gov-border bg-gov-page-bg p-2">
                  {!chatHistory.length ? (
                    <p className="text-xs text-gov-muted">No messages yet. Type an instruction below.</p>
                  ) : (
                    chatHistory.slice(-6).map((item) => (
                      <p
                        key={item.id}
                        className={`rounded-[6px] px-2 py-1.5 text-xs leading-5 ${
                          item.role === "user"
                            ? "ml-4 bg-gov-navy text-white"
                            : "mr-4 border border-gov-border bg-white text-slate-700"
                        }`}
                      >
                        {item.content}
                      </p>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(message)}
                    placeholder={
                      isStage2
                        ? "Describe a change to Stage 2…"
                        : "Describe a change to Stage 3…"
                    }
                    className="flex-1 rounded-[6px] border border-gov-border bg-gov-page-bg px-2.5 py-2 text-xs focus:border-gov-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmit(message)}
                    disabled={!message.trim()}
                    className="rounded-[6px] bg-gov-navy px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 transition hover:bg-[#2A3F7E]"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSubmit(prompt)}
                      className="rounded-full border border-gov-border bg-gov-page-bg px-2.5 py-0.5 text-[10px] text-gov-navy hover:bg-gov-navy-light transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>
        )}
      </section>
    </aside>
  );
}
