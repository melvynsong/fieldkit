import type { DesignExtraction, DesignSection } from "@/lib/design-normalizer";

function LabelTag({ label }: { label: string }) {
  return (
    <span className="rounded bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ring-1 ring-zinc-200">
      {label}
    </span>
  );
}

function SectionShell({ section }: { section: DesignSection }) {
  const baseClass = "rounded-xl border border-zinc-200 bg-white p-4 sm:p-5";

  if (section.type === "side-panel") {
    return (
      <section className={`${baseClass} bg-zinc-50`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Details Panel</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="space-y-3">
          <div className="h-10 rounded-md bg-white" />
          <div className="h-20 rounded-md bg-white" />
          <div className="h-10 rounded-md bg-white" />
        </div>
      </section>
    );
  }

  if (section.type === "header" || section.type === "hero") {
    return (
      <section className={`${baseClass} bg-gradient-to-r from-zinc-50 to-zinc-100`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Page Title</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="h-6 w-2/5 rounded bg-zinc-300" />
        <div className="mt-3 h-3 w-4/5 rounded bg-zinc-200" />
        <div className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
          Primary Action
        </div>
      </section>
    );
  }

  if (section.type === "cards" || section.type === "content") {
    return (
      <section className={`${baseClass} bg-zinc-50`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Section Heading</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
          <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
          <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
          <div className="h-20 rounded-lg border border-zinc-200 bg-white" />
        </div>
      </section>
    );
  }

  if (section.type === "list" || section.type === "table") {
    return (
      <section className={baseClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Record List</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="space-y-2">
          <div className="h-10 rounded-lg bg-zinc-100" />
          <div className="h-10 rounded-lg bg-zinc-100" />
          <div className="h-10 rounded-lg bg-zinc-100" />
        </div>
      </section>
    );
  }

  if (section.type === "form") {
    return (
      <section className={baseClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Form Area</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="space-y-3">
          <div className="h-10 rounded-md border border-zinc-200 bg-zinc-50" />
          <div className="h-10 rounded-md border border-zinc-200 bg-zinc-50" />
          <div className="h-10 rounded-md border border-zinc-200 bg-zinc-50" />
          <div className="inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
            Submit Action
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "footer") {
    return (
      <section className={`${baseClass} bg-zinc-50`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">Footer Area</h3>
          <LabelTag label={section.label} />
        </div>
        <div className="h-6 w-2/3 rounded bg-zinc-200" />
      </section>
    );
  }

  return (
    <section className={baseClass}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800">Section Heading</h3>
        <LabelTag label={section.label} />
      </div>
      <div className="h-20 rounded-lg bg-zinc-100" />
    </section>
  );
}

interface PrototypePreviewProps {
  design: DesignExtraction;
}

export default function PrototypePreview({ design }: PrototypePreviewProps) {
  const fallbackSection: DesignSection = {
    type: "unknown",
    label: "Main Section",
    importance: "medium",
  };

  const sections: DesignSection[] =
    design.layout.sections.length > 0
      ? design.layout.sections
      : [fallbackSection];

  const sideSections = sections.filter((section) => section.type === "side-panel");
  const mainSections = sections.filter((section) => section.type !== "side-panel");

  const navItems =
    design.navigation.items.length > 0
      ? design.navigation.items.slice(0, 5)
      : ["Home", "Overview", "Records"];

  const isSideNavigation =
    design.navigation.type === "side-nav" || design.navigation.type === "mixed";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Starter Prototype Shell</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Realistic first-page scaffold generated from extracted structure.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
        {isSideNavigation ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">Navigation</h3>
                <LabelTag label={design.navigation.type} />
              </div>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <div className="space-y-3">
              <section className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-100 to-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800">Page Title</h3>
                  <LabelTag label="Header Zone" />
                </div>
                <div className="h-6 w-2/5 rounded bg-zinc-300" />
                <div className="mt-3 h-3 w-4/5 rounded bg-zinc-200" />
                <div className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
                  Primary Action
                </div>
              </section>

              <div
                className={`grid grid-cols-1 gap-3 ${
                  sideSections.length > 0 ? "xl:grid-cols-[1fr_280px]" : ""
                }`}
              >
                <div className="space-y-3">
                  {mainSections.map((section, index) => (
                    <SectionShell
                      key={`${section.type}-${section.label}-${index}`}
                      section={section}
                    />
                  ))}
                </div>

                {sideSections.length > 0 ? (
                  <aside className="space-y-3">
                    {sideSections.map((section, index) => (
                      <SectionShell
                        key={`${section.type}-${section.label}-${index}`}
                        section={section}
                      />
                    ))}
                  </aside>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <section className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-100 to-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">Navigation</h3>
                <LabelTag label={design.navigation.type} />
              </div>
              <div className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">Page Title</h3>
                <LabelTag label="Header Zone" />
              </div>
              <div className="h-6 w-2/5 rounded bg-zinc-300" />
              <div className="mt-3 h-3 w-4/5 rounded bg-zinc-200" />
              <div className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
                Primary Action
              </div>
            </section>

            <div
              className={`grid grid-cols-1 gap-3 ${
                sideSections.length > 0 ? "xl:grid-cols-[1fr_280px]" : ""
              }`}
            >
              <div className="space-y-3">
                {mainSections.map((section, index) => (
                  <SectionShell
                    key={`${section.type}-${section.label}-${index}`}
                    section={section}
                  />
                ))}
              </div>

              {sideSections.length > 0 ? (
                <aside className="space-y-3">
                  {sideSections.map((section, index) => (
                    <SectionShell
                      key={`${section.type}-${section.label}-${index}`}
                      section={section}
                    />
                  ))}
                </aside>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
