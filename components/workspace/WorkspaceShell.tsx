"use client";

import FieldKitHero from "@/components/FieldKitHero";
import DesignChatPanel from "@/components/workspace/DesignChatPanel";
import DesignControlsPanel from "@/components/workspace/DesignControlsPanel";
import ImageLibraryPanel from "@/components/workspace/ImageLibraryPanel";
import LiveEditorsPanel from "@/components/workspace/LiveEditorsPanel";
import LivePreviewPanel from "@/components/workspace/LivePreviewPanel";

export default function WorkspaceShell() {
  return (
    <main className="relative flex-1 bg-[radial-gradient(circle_at_top_left,#f4f7fc,transparent_40%),linear-gradient(180deg,#eef2f8_0%,#f8fafd_38%,#f3f7fd_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <header className="mb-5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              FieldKit Live Design Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Upload references, extract design signals, edit tokens and prompts, and preview updates in real-time.
            </p>
          </header>

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
