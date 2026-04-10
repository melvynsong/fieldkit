"use client";

interface PreviewFrameProps {
  imageUrl?: string;
}

export default function PreviewFrame({ imageUrl }: PreviewFrameProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        No image selected
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Design preview"
        className="w-full object-contain"
      />
    </div>
  );
}
