import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { totalSpend, hhiHealthy } from "../data/mockData";
import { useFilters } from "../context/FiltersContext";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-hairline bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink-primary">{d.name}</p>
      <p className="tabular text-ink-secondary">${d.value}M · {d.pct}%</p>
    </div>
  );
}

export default function SpendDonutChart() {
  const { spendCategories, filters } = useFilters();
  const isFiltered = filters.commodity !== "All Primary Commodities";

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <PieIcon size={15} className="text-series-1" />
            Sourcing Spend &amp; Category Concentration
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Commodity allocation &amp; Herfindahl-Hirschman Index benchmark
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-status-good/10 px-2 py-1 text-[10px] font-semibold text-status-good">
          {hhiHealthy}
        </span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendCategories}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                stroke="#fcfcfb"
                strokeWidth={2}
              >
                {spendCategories.map((c) => (
                  <Cell key={c.name} fill={c.color} fillOpacity={c.active ? 1 : 0.25} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-lg font-bold text-ink-primary">
              {isFiltered
                ? `$${spendCategories.find((c) => c.active)?.value ?? 0}M`
                : totalSpend}
            </span>
            <span className="text-[10px] font-medium text-ink-muted">
              {isFiltered ? "SELECTED CATEGORY" : "TOTAL SPEND"}
            </span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2">
          {spendCategories.map((c) => (
            <div
              key={c.name}
              className={`flex items-center justify-between rounded px-1 py-0.5 text-xs transition-opacity ${
                c.active ? "" : "opacity-40"
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-ink-secondary">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="tabular shrink-0 font-semibold text-ink-primary">${c.value}M</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
        <span>Single-Category Cap Threshold: &lt;45%</span>
        <span className="font-medium text-status-good">Compliant with Board Hedging Mandate</span>
      </p>
    </div>
  );
}
