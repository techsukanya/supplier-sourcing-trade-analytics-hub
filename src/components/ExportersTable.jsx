import React from "react";
import { ListChecks, Search, Download, FileText, ChevronRight, X } from "lucide-react";
import { useFilters } from "../context/FiltersContext";
import { downloadCsv } from "../utils/csv";

const riskTone = {
  good: "bg-status-good/10 text-status-good",
  warning: "bg-status-warning/20 text-status-serious",
  info: "bg-series-1/10 text-series-1",
  critical: "bg-status-critical/10 text-status-critical",
};

function pageButtons(current, total) {
  // Always show first, last, current ± 1, collapsing the rest into "...".
  const pages = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function rowToCsv(e) {
  return [
    e.name,
    e.flag,
    e.location,
    e.duns,
    e.corridor,
    e.commodity,
    e.score,
    e.freq,
    e.teu,
    e.onTime,
    e.certs.join("; "),
    e.risk,
    `${e.role}${e.roleSub ? " — " + e.roleSub : ""}`,
  ];
}

export default function ExportersTable() {
  const { searchTerm, setSearch, pagination, page, setPage, exporters, filteredExporters } = useFilters();
  const { rows, totalPages, total, start, end } = pagination;

  // Export the full filtered+searched result set (every matching row,
  // across all pages) — not just the 6 rows on the visible page.
  const handleExportCsv = () => {
    downloadCsv(
      "top-exporters.csv",
      [
        "Supplier",
        "Country",
        "Location",
        "D-U-N-S / Sector",
        "Corridor",
        "Commodity",
        "Reliability Score",
        "Shipment Frequency",
        "TEU Volume",
        "On-Time Dispatch",
        "Certifications",
        "Risk Tier",
        "Diversification Role",
      ],
      filteredExporters.map(rowToCsv)
    );
  };

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <ListChecks size={15} className="text-series-1" />
            Top Exporters &amp; Company-Level Intelligence
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Granular customs filing history, ESG compliance status, on-time record, and risk allocation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter company, D-U-N-S, sector..."
              className="w-48 rounded-md border border-hairline bg-plane py-1.5 pl-7 pr-6 text-[11px] text-ink-primary outline-none focus:border-series-1 focus:bg-surface"
            />
            {searchTerm && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 rounded-md border border-hairline px-2 py-1.5 text-[11px] font-medium text-ink-secondary hover:bg-plane"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-hairline text-[10px] uppercase tracking-wide text-ink-muted">
              <th className="py-2 pr-3 font-semibold">Supplier / Exporter</th>
              <th className="py-2 pr-3 font-semibold">Reliability Score</th>
              <th className="py-2 pr-3 font-semibold">Shipment Frequency &amp; TEU</th>
              <th className="py-2 pr-3 font-semibold">On-Time Dispatch</th>
              <th className="py-2 pr-3 font-semibold">Compliance &amp; Certs</th>
              <th className="py-2 pr-3 font-semibold">Risk Tier</th>
              <th className="py-2 pr-3 font-semibold">Diversification Role</th>
              <th className="py-2 pr-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-ink-muted">
                  No suppliers match the current filters/search.
                </td>
              </tr>
            )}
            {rows.map((e) => (
              <tr key={e.name} className="border-b border-hairline last:border-0 hover:bg-plane/60">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-series-1/10 text-[11px] font-semibold text-series-1">
                      {e.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-primary">
                        {e.name} <span className="font-normal text-ink-muted">{e.flag}</span>
                      </p>
                      <p className="truncate text-[10px] text-ink-muted">{e.duns}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="tabular font-semibold text-ink-primary">{e.score} / 100</p>
                  <p className="text-[10px] text-ink-muted">{e.scoreTag}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="tabular text-ink-primary">{e.freq}</p>
                  <p className="text-[10px] text-ink-muted">{e.freqSub}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <p className={`tabular font-semibold ${e.onTimeGood ? "text-status-good" : "text-status-serious"}`}>
                    {e.onTime}
                  </p>
                  <p className="text-[10px] text-ink-muted">{e.onTimeSub}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex flex-wrap gap-1">
                    {e.certs.map((c) => (
                      <span key={c} className="rounded bg-plane px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary">
                        {c}
                      </span>
                    ))}
                  </div>
                  {e.certsSub && <p className="mt-0.5 text-[10px] text-ink-muted">{e.certsSub}</p>}
                </td>
                <td className="py-2.5 pr-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${riskTone[e.riskTone] || riskTone.info}`}>
                    {e.risk}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="font-medium text-ink-primary">{e.role}</p>
                  <p className="text-[10px] text-ink-muted">{e.roleSub}</p>
                </td>
                <td className="py-2.5 pr-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded p-1 text-ink-muted hover:bg-plane" aria-label="View dossier">
                      <FileText size={14} />
                    </button>
                    <button className="rounded p-1 text-ink-muted hover:bg-plane" aria-label="Open profile">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3 text-[11px] text-ink-secondary">
        <span>
          Showing {start} to {end} of {total} matching suppliers
          {total !== exporters.length && ` (${exporters.length} total tracked)`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded border border-hairline px-2 py-1 text-ink-secondary disabled:opacity-40"
          >
            Previous
          </button>
          {pageButtons(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-ink-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded px-2.5 py-1 font-semibold ${
                  p === page ? "bg-series-1 text-white" : "border border-hairline text-ink-secondary hover:bg-plane"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded border border-hairline px-2 py-1 text-ink-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
