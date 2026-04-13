"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function ChatRefiner() {
  const [message, setMessage] = useState("");
  const refineByChat = useWorkflowStore((state) => state.refineByChat);
  const chatHistory = useWorkflowStore((state) => state.chatHistory);
  const isRefining = useWorkflowStore((state) => state.isRefining);
  const canRefine = useWorkflowStore(
    (state) => Boolean(state.problemDiscovery) && Boolean(state.designSystem)
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
        Chat-based Iteration
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Refine tone, spacing, and screen flow using natural language.
      </p>

      <div className="mt-3 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        {!chatHistory.length ? (
          <p className="text-xs text-slate-500">No chat messages yet.</p>
        ) : (
          chatHistory.map((item) => (
            <p
              key={item.id}
              className={`rounded-md px-2.5 py-1.5 text-xs ${
                item.role === "user"
                  ? "ml-8 bg-slate-900 text-white"
                  : "mr-8 border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item.content}
            </p>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. Make this more transactional"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={isRefining || !canRefine || !message.trim()}
          onClick={() => {
            void refineByChat(message.trim());
            setMessage("");
          }}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isRefining ? "Updating..." : "Apply"}
        </button>
      </div>
    </section>
  );
}
