import ExtractionPanel from "@/components/ExtractionPanel";
import FieldKitHero from "@/components/FieldKitHero";
import PrototypePreview from "@/components/PrototypePreview";
import UploadPanel from "@/components/UploadPanel";

export default function Home() {
  return (
    <main className="relative flex-1 bg-gradient-to-b from-zinc-100 via-zinc-50 to-white px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <FieldKitHero />

        <section className="rounded-3xl border border-zinc-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Step 1 Demo Workspace
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Upload or capture a reference image, inspect mock extraction output,
            and preview a prototype shell.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-1">
              <UploadPanel />
            </div>
            <div className="xl:col-span-1">
              <ExtractionPanel />
            </div>
            <div className="xl:col-span-1">
              <PrototypePreview />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
