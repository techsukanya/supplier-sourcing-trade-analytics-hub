import React from "react";
import { useFilters } from "../context/FiltersContext";

// Sequential single-hue (blue) heatmap: corridor rows x commodity columns,
// cell shade = MFN-equivalent duty rate. Every cell carries its own visible
// % label (not color-alone), per the relief rule for sub-3:1-contrast steps.
export default function TariffHeatmapView() {
  const { tariffHeatmap, filters } = useFilters();
  const { columns, rows } = tariffHeatmap;

  return (
    <div className="flex h-full flex-col p-2">
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[420px] border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th className="w-24 text-left text-[9px] font-semibold uppercase text-ink-muted">Corridor</th>
              {columns.map((c) => (
                <th key={c} className="px-1 text-center text-[9px] font-semibold leading-tight text-ink-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.corridorId}>
                <td className="truncate pr-1 text-[10px] font-medium text-ink-secondary">{row.label}</td>
                {row.cells.map((cell) => (
                  <td key={cell.commodity} className="p-0">
                    <div
                      className="flex h-9 min-w-[52px] items-center justify-center rounded text-[10px] font-semibold tabular"
                      style={{ backgroundColor: cell.hex, color: cell.text }}
                      title={`${row.label} · ${cell.commodity}: ${cell.rate}% duty`}
                    >
                      {cell.rate}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-ink-muted">
        <span className="flex items-center gap-1">
          Duty rate:
          <span className="ml-1 h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#cde2fb" }} />
          Low
          <span className="mx-1 h-px w-4 bg-hairline" />
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#0d366b" }} />
          High
        </span>
        <span>
          {filters.corridor === "global" ? "All corridors" : rows[0]?.label} ·{" "}
          {filters.commodity === "All Primary Commodities" ? "All commodities" : filters.commodity}
        </span>
      </div>
    </div>
  );
}
