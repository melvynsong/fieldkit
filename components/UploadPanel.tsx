"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

interface SelectedImage {
  file: File;
  fileName: string;
  previewUrl: string;
  captured: boolean;
}

interface UploadPanelProps {
  isGenerating: boolean;
  errorMessage?: string | null;
  onImageSelected: (file: File) => void;
  onGeneratePrototype: (file: File) => Promise<void>;
}

export default function UploadPanel({
  isGenerating,
  errorMessage,
  onImageSelected,
  onGeneratePrototype,
}: UploadPanelProps) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const statusLabel = useMemo(() => {
    if (!selectedImage) {
      return "No file selected";
    }

    return selectedImage.captured ? "Photo captured" : selectedImage.fileName;
  }, [selectedImage]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onImageSelected(file);

    setSelectedImage((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      const previewUrl = URL.createObjectURL(file);
      const captured = file.name.trim() === "";

      return {
        file,
        fileName: file.name || "Photo captured",
        previewUrl,
        captured,
      };
    });
  }

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Upload / Capture</h2>
        <p className="mt-1 text-sm text-slate-600">
          Use one control for desktop upload and mobile camera capture.
        </p>
      </div>

      <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-slate-700">
          Select or Capture Image
        </span>
        <span className="text-xs text-slate-500">
          On iPhone, choose from Photos to pick saved screenshots.
        </span>
      </label>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Selected</p>
        <p className="mt-1 text-sm text-slate-600">{statusLabel}</p>

        {selectedImage ? (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.previewUrl}
                alt="Selected preview"
                className="w-full rounded-lg object-contain"
                style={{
                  maxHeight: "20rem",
                  filter: "contrast(1.05) saturate(1.05)",
                  display: "block",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => onGeneratePrototype(selectedImage.file)}
              disabled={!selectedImage || isGenerating}
              className="inline-flex min-w-44 items-center justify-center rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Prototype"}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled
              className="inline-flex min-w-44 items-center justify-center rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white opacity-50"
            >
              Generate Prototype
            </button>
          </div>
        )}

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
