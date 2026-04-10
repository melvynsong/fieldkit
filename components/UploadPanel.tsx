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
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">Upload / Capture</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Use one control for desktop upload and mobile camera capture.
        </p>
      </div>

      <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center transition hover:border-zinc-400 hover:bg-zinc-100">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
        />
        <span className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-zinc-700">
          Select or Capture Image
        </span>
        <span className="text-xs text-zinc-500">
          On mobile this can open camera or gallery.
        </span>
      </label>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-medium text-zinc-700">Selected</p>
        <p className="mt-1 text-sm text-zinc-600">{statusLabel}</p>

        {selectedImage ? (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="w-fit rounded-lg border border-zinc-200 bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.previewUrl}
                alt="Selected preview"
                className="h-24 w-24 rounded object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() => onGeneratePrototype(selectedImage.file)}
              disabled={!selectedImage || isGenerating}
              className="inline-flex min-w-44 items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Prototype"}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled
              className="inline-flex min-w-44 items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white opacity-50"
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
