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

    const PAGE_W = 297;
    const PAGE_H = 210;
    const MARGIN = 12;
    const COL_WIDTHS = [10, 22, 68, 68, 38, 18, 18]; // #, ID, Story, Criteria, Epic, Priority, Status
    const COL_LABELS = ["#", "ID", "User Story", "Acceptance Criteria", "Epic", "Priority", "Status"];
    const ROW_H = 8;
    const HEADER_H = 18;

    const navy = [26, 44, 91] as [number, number, number];
    const red = [192, 39, 45] as [number, number, number];
    const pageBg = [244, 245, 248] as [number, number, number];
    const white = [255, 255, 255] as [number, number, number];
    const muted = [107, 114, 128] as [number, number, number];

    const dateStr = new Date().toLocaleDateString("en-SG", {
      day: "2-digit", month: "short", year: "numeric",
    });

    let page = 1;
    const totalPages = () => doc.getNumberOfPages();

    function drawHeader() {
      // Navy header bar
      doc.setFillColor(...navy);
      doc.rect(0, 0, PAGE_W, HEADER_H, "F");
      // Title
      doc.setTextColor(...white);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("FieldKit — User Stories Export", MARGIN, 11);
      // Date
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(dateStr, PAGE_W - MARGIN, 11, { align: "right" });
      // Red accent stripe
      doc.setFillColor(...red);
      doc.rect(0, HEADER_H, PAGE_W, 1.5, "F");
    }

    function drawColumnHeaders(y: number) {
      doc.setFillColor(...pageBg);
      doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, ROW_H, "F");
      doc.setTextColor(...navy);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      let x = MARGIN;
      COL_LABELS.forEach((label, i) => {
        doc.text(label, x + 2, y + 5.5);
        x += COL_WIDTHS[i];
      });
    }

    function drawFooter(pageNum: number) {
      doc.setFillColor(...pageBg);
      doc.rect(0, PAGE_H - 8, PAGE_W, 8, "F");
      doc.setTextColor(...muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("FieldKit Prototype Generator | Confidential", MARGIN, PAGE_H - 2.5);
      doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 2.5, { align: "right" });
    }

    function priorityColor(p: Priority): [number, number, number] {
      if (p === "High") return [153, 27, 27];
      if (p === "Low") return [6, 95, 70];
      return [146, 64, 14];
    }

    drawHeader();
    let curY = HEADER_H + 4;
    drawColumnHeaders(curY);
    curY += ROW_H;

    rows.forEach((row, idx) => {
      if (curY + ROW_H > PAGE_H - 12) {
        drawFooter(page);
        doc.addPage();
        page++;
        drawHeader();
        curY = HEADER_H + 4;
        drawColumnHeaders(curY);
        curY += ROW_H;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(MARGIN, curY, PAGE_W - MARGIN * 2, ROW_H, "F");
      }

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);

      const cells = [
        String(row.num),
        row.id.slice(0, 12),
        row.story,
        row.criteria,
        row.epic,
        row.priority,
        row.status,
      ];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        const maxW = COL_WIDTHS[i] - 3;
        if (i === 5) {
          doc.setTextColor(...priorityColor(row.priority));
        } else {
          doc.setTextColor(30, 30, 30);
        }
        const clipped = doc.splitTextToSize(cell, maxW)[0] as string;
        doc.text(clipped, x + 2, curY + 5.5);
        x += COL_WIDTHS[i];
      });

      curY += ROW_H;
    });

    drawFooter(page);
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
