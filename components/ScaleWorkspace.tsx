"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { ScaleEpic, ScaleUserStory } from "@/types";

// ─── types ────────────────────────────────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";

interface FlatStory {
  num: number;
  id: string;
  story: string;
  criteria: string;
  epic: string;
  priority: Priority;
  status: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function assignPriority(idx: number, total: number): Priority {
  if (idx === 0) return "High";
  if (total > 2 && idx === total - 1) return "Low";
  return "Medium";
}

function flattenStories(epics: ScaleEpic[]): FlatStory[] {
  const rows: FlatStory[] = [];
  let num = 1;
  for (const epic of epics) {
    const all: ScaleUserStory[] = epic.features.flatMap((f) => f.userStories);
    all.forEach((story, idx) => {
      rows.push({
        num: num++,
        id: story.id,
        story: story.statement,
        criteria: story.acceptanceCriteria.join(" • "),
        epic: epic.title,
        priority: assignPriority(idx, all.length),
        status: "Ready",
      });
    });
  }
  return rows;
}

function buildCsvBlob(rows: FlatStory[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["ID", "User Story", "Acceptance Criteria", "Epic", "Priority", "Status"];
  const lines = rows.map((r) =>
    [r.id, r.story, r.criteria, r.epic, r.priority, r.status].map(escape).join(",")
  );
  return [header.join(","), ...lines].join("\r\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-[#FEE2E2] text-[#991B1B]",
  Medium: "bg-[#FEF3C7] text-[#92400E]",
  Low: "bg-[#D1FAE5] text-[#065F46]",
};

// ─── metric card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-gov-border bg-white px-5 py-4">
      <p className="text-2xl font-semibold text-gov-navy">{value}</p>
      <p className="mt-1 text-xs text-gov-muted">{label}</p>
    </div>
  );
}

// ─── toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[8px] bg-gov-navy px-4 py-3 text-sm text-white shadow-md">
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      {message}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jspdf?: any;
  }
}

export default function ScaleWorkspace() {
  const artifacts = useWorkflowStore((state) => state.scaleArtifacts);
  const generateScaleArtifacts = useWorkflowStore((state) => state.generateScaleArtifacts);
  const isGeneratingScale = useWorkflowStore((state) => state.isGeneratingScale);
  const hasInputs = useWorkflowStore(
    (state) => Boolean(state.problemDiscovery) && Boolean(state.designSystem)
  );

  const [toast, setToast] = useState<string | null>(null);
  const jsPdfLoaded = useRef(false);

  // Pre-load jsPDF
  useEffect(() => {
    if (jsPdfLoaded.current || window.jspdf) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => { jsPdfLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  const rows = artifacts ? flattenStories(artifacts.epics) : [];
  const highCount = rows.filter((r) => r.priority === "High").length;

  const showToast = useCallback((msg: string) => setToast(msg), []);

  // ── CSV export ───────────────────────────────────────────────────────────────
  const handleCsvExport = useCallback(() => {
    if (!rows.length) return;
    downloadFile(buildCsvBlob(rows), "fieldkit-user-stories.csv", "text/csv;charset=utf-8;");
    showToast("CSV exported — fieldkit-user-stories.csv");
  }, [rows, showToast]);

  // ── PDF export ───────────────────────────────────────────────────────────────
  const handlePdfExport = useCallback(() => {
    if (!rows.length || !window.jspdf) {
      showToast("PDF library still loading — please try again in a moment.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // ── constants ──────────────────────────────────────────────────────────────
    const PAGE_W = 297;
    const PAGE_H = 210;
    const MARGIN_X = 10;
    const MARGIN_BOTTOM = 8;
    const CONTENT_W = PAGE_W - MARGIN_X * 2; // 277mm

    const HEADER_H = 22;   // navy bar
    const ACCENT_H = 2;    // red stripe
    const COL_H = 8;       // column-header row height
    const FONT_SIZE = 7.5;
    const LINE_H = 4;      // mm per wrapped line
    const PAD_V = 4;       // top & bottom cell padding
    const PAD_L = 3;       // left cell padding
    const MIN_ROW_H = 14;
    const FOOTER_AREA = MARGIN_BOTTOM + 4; // reserved at page bottom

    // col: label, width (mm), wrapWidth (0 = single line)
    const COLS = [
      { label: "#",                   width: 8,  wrap: 0  },
      { label: "ID",                  width: 25, wrap: 0  },
      { label: "User Story",          width: 90, wrap: 86 },
      { label: "Acceptance Criteria", width: 57, wrap: 51 },
      { label: "Epic",                width: 50, wrap: 0  },
      { label: "Priority",            width: 22, wrap: 0  },
      { label: "Status",              width: 22, wrap: 0  },
    ];

    const CONTENT_TOP = HEADER_H + ACCENT_H + COL_H; // Y after header + stripe + col labels
    const MAX_Y = PAGE_H - FOOTER_AREA;

    const navy: [number, number, number]  = [26, 44, 91];
    const red: [number, number, number]   = [192, 39, 45];
    const pageBg: [number, number, number] = [244, 245, 248];
    const white: [number, number, number] = [255, 255, 255];
    const muted: [number, number, number] = [107, 114, 128];

    const dateStr = new Date().toLocaleDateString("en-SG", {
      day: "2-digit", month: "short", year: "numeric",
    });

    // ── helpers ────────────────────────────────────────────────────────────────
    function priorityColor(p: Priority): [number, number, number] {
      if (p === "High") return [153, 27, 27];
      if (p === "Low")  return [6, 95, 70];
      return [146, 64, 14];
    }

    function getCells(row: FlatStory): string[] {
      return [String(row.num), row.id, row.story, row.criteria, row.epic, row.priority, row.status];
    }

    function calcRowHeight(row: FlatStory): number {
      const cells = getCells(row);
      let maxLines = 1;
      cells.forEach((cell, i) => {
        const col = COLS[i];
        if (col.wrap > 0) {
          const lines = (doc.splitTextToSize(cell, col.wrap) as string[]).length;
          if (lines > maxLines) maxLines = lines;
        }
      });
      return Math.max(MIN_ROW_H, maxLines * LINE_H + PAD_V * 2);
    }

    function drawPageHeader() {
      // Navy bar
      doc.setFillColor(...navy);
      doc.rect(0, 0, PAGE_W, HEADER_H, "F");
      doc.setTextColor(...white);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("FieldKit — User Stories Export", MARGIN_X, HEADER_H / 2 + 2.5);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${dateStr} · ${rows.length} stories`, PAGE_W - MARGIN_X, HEADER_H / 2 + 2.5, { align: "right" });
      // Red accent stripe
      doc.setFillColor(...red);
      doc.rect(0, HEADER_H, PAGE_W, ACCENT_H, "F");
      // Column header row
      doc.setFillColor(...pageBg);
      doc.rect(MARGIN_X, HEADER_H + ACCENT_H, CONTENT_W, COL_H, "F");
      doc.setTextColor(...navy);
      doc.setFontSize(FONT_SIZE);
      doc.setFont("helvetica", "bold");
      let x = MARGIN_X;
      COLS.forEach((col) => {
        doc.text(col.label, x + PAD_L, HEADER_H + ACCENT_H + COL_H / 2 + 1.5);
        x += col.width;
      });
    }

    function drawRow(row: FlatStory, y: number, rowH: number, isEven: boolean) {
      if (isEven) {
        doc.setFillColor(250, 250, 252);
        doc.rect(MARGIN_X, y, CONTENT_W, rowH, "F");
      }
      const cells = getCells(row);
      doc.setFontSize(FONT_SIZE);
      doc.setFont("helvetica", "normal");
      let x = MARGIN_X;
      cells.forEach((cell, i) => {
        const col = COLS[i];
        doc.setTextColor(...(i === 5 ? priorityColor(row.priority) : [30, 30, 30] as [number, number, number]));
        if (col.wrap > 0) {
          const lines = doc.splitTextToSize(cell, col.wrap) as string[];
          lines.forEach((line: string, li: number) => {
            doc.text(line, x + PAD_L, y + PAD_V + (li + 0.75) * LINE_H);
          });
        } else {
          doc.text(cell, x + PAD_L, y + PAD_V + 0.75 * LINE_H);
        }
        x += col.width;
      });
    }

    // ── render pass ────────────────────────────────────────────────────────────
    drawPageHeader();
    let curY = CONTENT_TOP;

    rows.forEach((row, idx) => {
      const rowH = calcRowHeight(row);
      if (curY + rowH > MAX_Y) {
        doc.addPage();
        drawPageHeader();
        curY = CONTENT_TOP;
      }
      drawRow(row, curY, rowH, idx % 2 === 0);
      curY += rowH;
    });

    // ── stamp "Page X of Y" on every page ─────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(...pageBg);
      doc.rect(0, PAGE_H - FOOTER_AREA, PAGE_W, FOOTER_AREA, "F");
      doc.setTextColor(...muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("FieldKit Prototype Generator | Confidential", MARGIN_X, PAGE_H - MARGIN_BOTTOM / 2);
      doc.text(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN_X, PAGE_H - MARGIN_BOTTOM / 2, { align: "right" });
    }

    doc.save("fieldkit-user-stories.pdf");
    showToast("PDF exported — fieldkit-user-stories.pdf");
  }, [rows, showToast]);

  // ── empty state ───────────────────────────────────────────────────────────────
  if (!artifacts) {
    return (
      <section className="rounded-[10px] border border-gov-border bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-2 w-2 shrink-0 rounded-full bg-gov-red" />
          <hr className="flex-1 border-t border-gov-border" />
        </div>
        <p className="text-sm text-gov-muted mb-4">
          Generate delivery artifacts from the problem definition, planned screens, and design direction.
        </p>
        <button
          type="button"
          onClick={generateScaleArtifacts}
          disabled={!hasInputs || isGeneratingScale}
          className="rounded-[6px] bg-gov-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2A3F7E] disabled:opacity-50"
        >
          {isGeneratingScale ? "Generating..." : "Generate Scale Artifacts"}
        </button>
        {!hasInputs && (
          <p className="mt-3 text-xs text-gov-muted">
            Complete Problem Discovery and Design stages first.
          </p>
        )}
      </section>
    );
  }

  // ── main UI ───────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-5">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total Stories" value={rows.length} />
        <MetricCard label="High Priority" value={highCount} />
        <MetricCard label="Ready to Export" value={rows.length} />
      </div>

      {/* User stories table */}
      <div className="rounded-[10px] border border-gov-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "3%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="bg-gov-page-bg border-b border-gov-border">
                {["#", "ID", "User Story", "Acceptance Criteria", "Epic", "Priority", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-gov-navy">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gov-border last:border-0 hover:bg-[#F8F9FC] transition-colors"
                >
                  <td className="px-3 py-2.5 text-xs text-gov-muted">{row.num}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-gov-muted truncate">{row.id.slice(0, 14)}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-800 leading-5">{row.story}</td>
                  <td className="px-3 py-2.5 text-xs text-gov-muted leading-5">{row.criteria}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 truncate">{row.epic}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[row.priority]}`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex rounded-full bg-gov-navy-light px-2 py-0.5 text-[11px] font-semibold text-gov-navy">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* CSV */}
        <div className="rounded-[10px] border border-gov-border bg-white p-5">
          <p className="text-sm font-semibold text-gov-navy">Export as CSV</p>
          <p className="mt-1.5 text-xs leading-5 text-gov-muted">
            Download all user stories as a .csv file. Compatible with Jira, Linear, Trello, and most backlog tools.
          </p>
          <button
            type="button"
            onClick={handleCsvExport}
            className="mt-4 rounded-[6px] bg-gov-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A3F7E]"
          >
            Download CSV
          </button>
        </div>

        {/* PDF */}
        <div className="rounded-[10px] border border-gov-border bg-white p-5">
          <p className="text-sm font-semibold text-gov-navy">Export as PDF</p>
          <p className="mt-1.5 text-xs leading-5 text-gov-muted">
            Generate a formatted PDF report with all user stories, priorities, and acceptance criteria for stakeholder review.
          </p>
          <button
            type="button"
            onClick={handlePdfExport}
            className="mt-4 rounded-[6px] bg-gov-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a8222b]"
          >
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}
