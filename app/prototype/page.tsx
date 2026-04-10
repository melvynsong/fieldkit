import UploadForm from "@/components/upload-form";
import PreviewFrame from "@/components/preview-frame";
import DesignSummary from "@/components/design-summary";

export default function PrototypePage() {
  return (
    <main className="flex flex-1 flex-col items-center py-16 px-4">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Design Extractor
        </h1>
        <UploadForm />
        <PreviewFrame />
        <DesignSummary />
      </div>
    </main>
  );
}
