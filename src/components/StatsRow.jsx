import React from "react";
import { Users, CheckCircle2, Ship, Share2, Layers, TrendingUp, TriangleAlert } from "lucide-react";
import { useFilters } from "../context/FiltersContext";

const icons = [Users, CheckCircle2, Ship, Share2, Layers];
const iconBg = ["bg-series-1/10 text-series-1", "bg-status-good/10 text-status-good", "bg-series-1/10 text-series-1", "bg-series-4/10 text-series-4", "bg-series-3/10 text-series-3"];

export default function StatsRow() {
  const { statTiles } = useFilters();
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-5 lg:px-6">
      {statTiles.map((s, i) => {
        const Icon = icons[i];
        return (
          <div key={s.label} className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{s.label}</p>
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg[i]}`}>
                <Icon size={14} />
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="tabular text-2xl font-semibold text-ink-primary">{s.value}</span>
              {s.unit && <span className="text-xs font-medium text-ink-muted">{s.unit}</span>}
            </div>

            <div className="mt-1 flex items-center gap-2">
              {s.trend && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    s.trendUp ? "text-status-good" : "text-ink-secondary"
                  }`}
                >
                  <TrendingUp size={11} />
                  {s.trend}
                </span>
              )}
              {s.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                    s.badge.tone === "warning"
                      ? "bg-status-warning/20 text-status-serious"
                      : "bg-status-good/10 text-status-good"
                  }`}
                >
                  {s.badge.text}
                </span>
              )}
            </div>

            {typeof s.progress === "number" && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                <div className="h-full rounded-full bg-status-good" style={{ width: `${s.progress}%` }} />
              </div>
            )}

            <p className="mt-2 text-[11px] text-ink-secondary">{s.sub}</p>

            {s.warning && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-status-serious">
                <TriangleAlert size={11} />
                {s.warning}
              </p>
            )}

            {s.footer && (
              <p className="mt-2 border-t border-hairline pt-2 text-[11px] font-medium text-ink-secondary">
                {s.footer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
