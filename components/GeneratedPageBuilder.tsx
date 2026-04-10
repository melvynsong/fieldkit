import type { GeneratedPageModel } from "@/lib/generated-page";

interface GeneratedPageBuilderProps {
  model: GeneratedPageModel;
}

function ZoneLabel({ show, text }: { show: boolean; text: string }) {
  if (!show) {
    return null;
  }

  return (
    <span className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
      {text}
    </span>
  );
}

function SectionBlock({ model, section }: { model: GeneratedPageModel; section: GeneratedPageModel["sections"][number] }) {
  const padClass =
    model.density === "compact"
      ? "p-3"
      : model.density === "spacious"
      ? "p-6"
      : "p-4";

  const label = section.label || "Section";

  if (section.type === "table" || section.type === "list") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-white ${padClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Records Table</h3>
          <ZoneLabel show={model.showLabels} text={label} />
        </div>
        <div className="space-y-2">
          <div className="h-8 rounded-md bg-slate-100" />
          <div className="h-8 rounded-md bg-slate-100" />
          <div className="h-8 rounded-md bg-slate-100" />
          <div className="h-8 rounded-md bg-slate-100" />
        </div>
      </section>
    );
  }

  if (section.type === "form") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-white ${padClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Form Section</h3>
          <ZoneLabel show={model.showLabels} text={label} />
        </div>
        <div className="space-y-3">
          <div className="h-9 rounded-md border border-slate-200 bg-slate-50" />
          <div className="h-9 rounded-md border border-slate-200 bg-slate-50" />
          <div className="h-9 rounded-md border border-slate-200 bg-slate-50" />
          <div className="inline-flex rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">
            Primary Action
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "cards" || section.type === "content") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-slate-50 ${padClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Content Section</h3>
          <ZoneLabel show={model.showLabels} text={label} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-lg border border-slate-200 bg-white" />
          <div className="h-20 rounded-lg border border-slate-200 bg-white" />
          <div className="h-20 rounded-lg border border-slate-200 bg-white" />
          <div className="h-20 rounded-lg border border-slate-200 bg-white" />
        </div>
      </section>
    );
  }

  if (section.type === "side-panel") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-slate-50 ${padClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Details Panel</h3>
          <ZoneLabel show={model.showLabels} text={label} />
        </div>
        <div className="space-y-3">
          <div className="h-10 rounded-md bg-white" />
          <div className="h-16 rounded-md bg-white" />
          <div className="h-24 rounded-md bg-white" />
        </div>
      </section>
    );
  }

  if (section.type === "footer") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-slate-50 ${padClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Footer Notes</h3>
          <ZoneLabel show={model.showLabels} text={label} />
        </div>
        <div className="h-5 w-2/3 rounded bg-slate-200" />
      </section>
    );
  }

  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${padClass}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Supporting Information</h3>
        <ZoneLabel show={model.showLabels} text={label} />
      </div>
      <div className="h-20 rounded-lg bg-slate-100" />
    </section>
  );
}

export default function GeneratedPageBuilder({ model }: GeneratedPageBuilderProps) {
  const sidePanelSections = model.sections.filter((section) => section.type === "side-panel");
  const mainSections = model.sections.filter((section) => section.type !== "side-panel");

  const frameWidthClass =
    model.previewMode === "mobile"
      ? "mx-auto max-w-[420px]"
      : "mx-auto max-w-6xl";

  const canvasClass =
    model.previewMode === "mobile"
      ? "rounded-[1.75rem]"
      : "rounded-2xl";

  const navItems = model.navigation.items.slice(0, model.previewMode === "mobile" ? 3 : 6);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Generated Starter Page</h2>
        <p className="mt-1 text-sm text-slate-600">
          A reusable first-page scaffold derived from the extracted design language.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3">
        <div className={`${frameWidthClass} rounded-2xl border border-slate-300 bg-white p-2`}>
          <div className={`${canvasClass} overflow-hidden border border-slate-200 bg-slate-50`}>
            {model.navigation.type === "top-nav" ? (
              <nav className="border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">Navigation</p>
                  <ZoneLabel show={model.showLabels} text="Top Nav" />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {navItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </nav>
            ) : null}

            <div
              className={
                model.navigation.type === "side-nav"
                  ? "grid grid-cols-1 md:grid-cols-[220px_1fr]"
                  : "block"
              }
            >
              {model.navigation.type === "side-nav" ? (
                <aside className="border-b border-slate-200 bg-white p-4 md:min-h-full md:border-b-0 md:border-r">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Navigation</p>
                    <ZoneLabel show={model.showLabels} text="Side Nav" />
                  </div>
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>
              ) : null}

              <div className="space-y-3 p-4">
                <section className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{model.hero.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{model.hero.subtitle}</p>
                    </div>
                    <ZoneLabel show={model.showLabels} text="Hero" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">
                      {model.actions.primary}
                    </button>
                    <button className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {model.actions.secondary}
                    </button>
                  </div>
                </section>

                {model.hero.showSummaryCards ? (
                  <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <article className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Summary Card</p>
                      <div className="mt-2 h-6 w-1/2 rounded bg-slate-200" />
                    </article>
                    <article className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Summary Card</p>
                      <div className="mt-2 h-6 w-1/2 rounded bg-slate-200" />
                    </article>
                    <article className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Summary Card</p>
                      <div className="mt-2 h-6 w-1/2 rounded bg-slate-200" />
                    </article>
                  </section>
                ) : null}

                <div
                  className={`grid grid-cols-1 gap-3 ${
                    sidePanelSections.length > 0 ? "xl:grid-cols-[1fr_280px]" : ""
                  }`}
                >
                  <div className="space-y-3">
                    {mainSections.map((section) => (
                      <SectionBlock key={section.id} model={model} section={section} />
                    ))}
                  </div>

                  {sidePanelSections.length > 0 ? (
                    <div className="space-y-3">
                      {sidePanelSections.map((section) => (
                        <SectionBlock key={section.id} model={model} section={section} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
