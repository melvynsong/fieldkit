"use client";

import { useState } from "react";
import DesignBriefPanel from "@/components/DesignBriefPanel";
import ExtractionPanel from "@/components/ExtractionPanel";
import FieldKitHero from "@/components/FieldKitHero";
import GeneratedPageBuilder from "@/components/GeneratedPageBuilder";
import PromptKitPanel from "@/components/PromptKitPanel";
import PrototypeControls from "@/components/PrototypeControls";
import UploadPanel from "@/components/UploadPanel";
import {
  normalizeDesign,
  type DesignExtraction,
} from "@/lib/design-normalizer";
import {
  buildGeneratedPageModel,
  createDefaultPrototypeControls,
  type PrototypeControlState,
} from "@/lib/generated-page";

interface ExtractDesignApiResponse {
  ok: boolean;
  error?: string;
  warning?: string;
  design?: unknown;
}

async function normalizeImageForExtraction(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Unable to read selected image."));
      nextImage.src = objectUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const jpegBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.88);
    });

    if (!jpegBlob) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [design, setDesign] = useState<DesignExtraction | null>(null);
  const [controls, setControls] = useState<PrototypeControlState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleImageSelected() {
    setDesign(null);
    setControls(null);
    setErrorMessage(null);
  }

  async function handleGeneratePrototype(file: File) {
    setIsGenerating(true);
    setErrorMessage(null);

    const startedAt = Date.now();

    try {
      const normalizedFile = await normalizeImageForExtraction(file);
      const formData = new FormData();
      formData.append("image", normalizedFile);

      const response = await fetch("/api/extract-design", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ExtractDesignApiResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Extraction failed. Please try again.");
      }

      const normalized = normalizeDesign(payload.design);
      setDesign(normalized);
      setControls(createDefaultPrototypeControls(normalized));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to extract design from this image. Please try another screenshot.";
      setDesign(null);
      setErrorMessage(message);
    } finally {
      const elapsed = Date.now() - startedAt;
      const minLoadingMs = 1000;
      if (elapsed < minLoadingMs) {
        await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed));
      }

      setIsGenerating(false);
    }
  }

  return (
    <main className="relative flex-1 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/60 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Prototyping Workspace
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload or capture a reference image and transform extracted design
            JSON into a brief, prompt kit, and starter prototype shell.
          </p>

          <div className="mt-5 space-y-4">
            <div className={design ? "w-full" : "mx-auto w-full max-w-xl"}>
              <UploadPanel
                isGenerating={isGenerating}
                errorMessage={errorMessage}
                onImageSelected={handleImageSelected}
                onGeneratePrototype={handleGeneratePrototype}
              />
            </div>

            {design ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ExtractionPanel design={design} />
                <DesignBriefPanel design={design} />
              </div>
            ) : null}

            {design ? (
              <PromptKitPanel design={design} />
            ) : null}

            {design && controls ? (
              <PrototypeControls controls={controls} onChange={setControls} />
            ) : null}

            {design && controls ? (
              <GeneratedPageBuilder
                model={buildGeneratedPageModel(design, controls)}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
