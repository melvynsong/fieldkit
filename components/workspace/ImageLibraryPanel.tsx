"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/lib/workspace-store";
import type { ImageTag } from "@/lib/workspace-types";

const TAGS: ImageTag[] = [
  "layout",
  "navigation",
  "mobile",
  "desktop",
  "branding",
  "content",
  "other",
];

export default function ImageLibraryPanel() {
  const state = useWorkspaceStore((store) => store.state);
  const addImages = useWorkspaceStore((store) => store.addImages);
  const removeImage = useWorkspaceStore((store) => store.removeImage);
  const updateImageTag = useWorkspaceStore((store) => store.updateImageTag);
  const toggleColorReference = useWorkspaceStore((store) => store.toggleColorReference);
  const runExtraction = useWorkspaceStore((store) => store.runExtraction);
  const showGuidance = useWorkspaceStore((store) => store.showGuidance);

  const colorReferenceCount = useMemo(
    () => state.images.filter((image) => image.useAsColorReference).length,
    [state.images]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Images</h2>
        {showGuidance ? (
          <p className="mt-1 text-sm text-slate-600">
            Upload multiple references, tag each image, and mark color sources. Then click <strong>Extract Design System</strong>.
          </p>
        ) : null}
      </header>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:bg-slate-100">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              addImages(event.target.files);
            }
            event.currentTarget.value = "";
          }}
        />
        <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Add Images
        </span>
        <span className="text-xs text-slate-500">PNG, JPG, WEBP, GIF</span>
      </label>

      <button
        type="button"
        onClick={() => void runExtraction()}
        disabled={state.isUpdating || state.images.length === 0}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.isUpdating ? "Updating..." : "Extract Design System"}
      </button>

      <p className="mt-2 text-xs text-slate-500">
        {state.images.length} image(s), {colorReferenceCount} color reference(s)
      </p>

      {state.errorMessage ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {state.errorMessage}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {state.images.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            No images yet. Add at least one screenshot to start extraction.
          </div>
        ) : null}

        {state.images.map((image) => (
          <article key={image.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt="Uploaded reference"
                className="h-16 w-16 rounded-md border border-slate-200 bg-white object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-700">{image.file.name || "Captured image"}</p>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="text-xs text-slate-600">
                    Tag
                    <select
                      value={image.tag}
                      onChange={(event) => updateImageTag(image.id, event.target.value as ImageTag)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-800"
                    >
                      {TAGS.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-end text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={image.useAsColorReference}
                      onChange={() => void toggleColorReference(image.id)}
                      className="mr-2 h-4 w-4 rounded border-slate-300"
                    />
                    Use as Color Reference
                  </label>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
