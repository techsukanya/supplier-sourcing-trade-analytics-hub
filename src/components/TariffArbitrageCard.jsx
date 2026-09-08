import React from "react";
import { Landmark, ExternalLink } from "lucide-react";
import { tariffRoutes, tariffSavedYTD } from "../data/mockData";
import { useFilters } from "../context/FiltersContext";

export default function TariffArbitrageCard() {
  const { filters } = useFilters();
  const isFiltering = filters.corridor !== "global";
  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <Landmark size={15} className="text-series-1" />
            FTA / Tariff Duty Arbitrage Velocity
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Concessional customs tariff capture across preferential bilateral treaties
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-series-1/10 px-2 py-1 text-[10px] font-semibold text-series-1">
          {tariffSavedYTD}
        </span>
      </div>

      <div className="mt-3 space-y-4">
        {tariffRoutes.map((r) => (
          <div
            key={r.name}
            className={`rounded-md transition-opacity ${
              isFiltering && r.corridor !== filters.corridor ? "opacity-35" : "opacity-100"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="font-medium text-ink-primary">{r.name}</span>
              <span className="rounded bg-status-good/10 px-1.5 py-0.5 text-[10px] font-semibold text-status-good">
                {r.tag}
              </span>
              <span className="tabular font-semibold text-ink-primary">{r.saved}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-hairline">
              <div
                className={`h-full rounded-full ${r.high ? "bg-ink-primary" : "bg-series-1"}`}
                style={{ width: `${r.utilization}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-ink-secondary">
              <span>Tariff Utilization: {r.utilization}%{r.high ? " (High Compliance)" : ""}</span>
              <span className={r.high ? "font-medium text-status-good" : "text-ink-muted"}>{r.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-hairline pt-2 text-right">
        <a href="#" className="inline-flex items-center gap-1 text-[11px] font-medium text-series-1 hover:underline">
          Run Tariff Arbitrage Simulator <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
