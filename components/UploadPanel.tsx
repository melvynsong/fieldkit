"use client";

import { ChangeEvent, useMemo, useState } from "react";

interface SelectedImage {
  fileName: string;
  previewUrl: string;
  captured: boolean;
}

export default function UploadPanel() {
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

    setSelectedImage((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      const previewUrl = URL.createObjectURL(file);
      const captured = file.name.trim() === "";

      return {
        fileName: file.name || "Photo captured",
        previewUrl,
        captured,
      };
    });
  }

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
          <div className="mt-4 w-fit rounded-lg border border-zinc-200 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.previewUrl}
              alt="Selected preview"
              className="h-24 w-24 rounded object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
