"use client";

import { FormEvent, useState } from "react";
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function DesignChatPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const appendChatMessage = useWorkspaceStore((store) => store.appendChatMessage);
  const applyPatch = useWorkspaceStore((store) => store.applyPatch);
  const setUpdating = useWorkspaceStore((store) => store.setUpdating);
  const setError = useWorkspaceStore((store) => store.setError);
  const showGuidance = useWorkspaceStore((store) => store.showGuidance);

  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    appendChatMessage("user", trimmed);
    setMessage("");
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/design-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          workspace: {
            designExtraction: state.designExtraction,
            designControls: state.designControls,
            promptKit: state.promptKit,
            designTokens: state.designTokens,
            previewModel: state.previewModel,
          },
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        patch?: unknown;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Design chat update failed.");
      }

      if (payload.patch && typeof payload.patch === "object") {
        applyPatch(payload.patch as Parameters<typeof applyPatch>[0]);
        appendChatMessage("assistant", "Applied design updates to the workspace.");
      } else {
        appendChatMessage("assistant", "No valid patch returned. No changes applied.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Chat update failed.";
      setError(msg);
      appendChatMessage("assistant", `Failed to apply update: ${msg}`);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Design Chat</h2>
        {showGuidance ? (
          <p className="mt-1 text-sm text-slate-600">
            Ask the AI to refine your design — e.g. “more premium”, “increase contrast”, or “make buttons more rounded”.
          </p>
        ) : null}
      </header>

      <div className="max-h-52 space-y-2 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {state.chatHistory.length === 0 ? (
          <p className="text-xs text-slate-500">No messages yet.</p>
        ) : (
          state.chatHistory.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg px-3 py-2 text-xs leading-5 ${
                item.role === "user"
                  ? "ml-6 bg-slate-900 text-white"
                  : "mr-6 border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a design change request..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-slate-300 focus:ring"
        />
        <button
          type="submit"
          disabled={state.isUpdating}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.isUpdating ? "Applying..." : "Send"}
        </button>
      </form>
    </section>
  );
}
