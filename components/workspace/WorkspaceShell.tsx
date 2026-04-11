"use client";

import FieldKitHero from "@/components/FieldKitHero";
import DesignChatPanel from "@/components/workspace/DesignChatPanel";
import DesignControlsPanel from "@/components/workspace/DesignControlsPanel";
import ImageLibraryPanel from "@/components/workspace/ImageLibraryPanel";
import LiveEditorsPanel from "@/components/workspace/LiveEditorsPanel";
import LivePreviewPanel from "@/components/workspace/LivePreviewPanel";
import { useWorkspaceStore } from "@/lib/workspace-store";

const WORKFLOW_STEPS = [
  {
    number: "1",
    label: "Upload",
    detail: "Add screenshots and mark color references in the Images panel.",
  },
  {
    number: "2",
    label: "Extract",
    detail: "Click \"Extract Design System\" to analyse the primary image with AI.",
  },
  {
    number: "3",
    label: "Configure",
    detail: "Adjust Design Controls, then click \"Apply Controls\" to update tokens and preview.",
  },
  {
    number: "4",
    label: "Preview",
    detail: "Review the live preview and edit JSON/text in the editors, then click \"Apply\" per block.",
  },
];

export default function WorkspaceShell() {
  const showGuidance = useWorkspaceStore((store) => store.showGuidance);
  const toggleGuidance = useWorkspaceStore((store) => store.toggleGuidance);

  return (
    <main className="relative flex-1 bg-[radial-gradient(circle_at_top_left,#f4f7fc,transparent_40%),linear-gradient(180deg,#eef2f8_0%,#f8fafd_38%,#f3f7fd_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                FieldKit Live Design Workspace
              </h1>
              {showGuidance ? (
                <p className="mt-1 text-sm text-slate-600">
                  Upload references, extract design signals, edit tokens and prompts, and preview updates in real-time.
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={toggleGuidance}
              title={showGuidance ? "Hide guidance" : "Show guidance"}
              className={`mt-0.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                showGuidance
                  ? "border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {showGuidance ? "Hide Guide" : "Show Guide"}
            </button>
          </header>

          {showGuidance ? (
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                      {step.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{step.label}</span>
                  </div>
                  <p className="text-[11px] leading-4 text-slate-500">{step.detail}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr_460px]">
            <div className="space-y-4">
              <ImageLibraryPanel />
            </div>

            <div className="space-y-4">
              <DesignControlsPanel />
              <LiveEditorsPanel />
              <DesignChatPanel />
            </div>

            <div className="space-y-4">
              <LivePreviewPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
