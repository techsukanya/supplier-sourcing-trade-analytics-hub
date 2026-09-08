import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LineChartIcon, ExternalLink } from "lucide-react";
import { trajectories, corridors } from "../data/filterOptions";
import { useFilters } from "../context/FiltersContext";
import { downloadCsv } from "../utils/csv";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-hairline bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink-primary">{label}</p>
      <p className="tabular text-series-1">{payload[0].value} TEU</p>
    </div>
  );
}

export default function ShipmentVelocityChart() {
  const { filters, velocitySlice, velocityTarget, velocityStats } = useFilters();
  const trajectoryLabel = (trajectories.find((t) => t.id === filters.trajectory) || trajectories[2]).label;
  const corridorLabel = (corridors.find((c) => c.id === filters.corridor) || corridors[0]).label;

  const domain = useMemo(() => {
    const values = velocitySlice.map((d) => d.teu);
    const lo = Math.min(...values, velocityTarget);
    const hi = Math.max(...values, velocityTarget);
    const pad = Math.round((hi - lo) * 0.15) || 20;
    return [Math.max(0, Math.floor((lo - pad) / 10) * 10), Math.ceil((hi + pad) / 10) * 10];
  }, [velocitySlice, velocityTarget]);

  const handleExport = () => {
    downloadCsv(
      `shipment-velocity-${filters.trajectory}.csv`,
      ["Month", "TEU Volume"],
      velocitySlice.map((d) => [d.month, d.teu])
    );
  };

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <LineChartIcon size={15} className="text-series-1" />
            Monthly Shipment Velocity &amp; TEU Volume Trends
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {trajectoryLabel} · {corridorLabel} — TEU volume intake vs target dispatch benchmark
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-series-1" /> TEU Volume
          </span>
          <span className="flex items-center gap-1 text-ink-secondary">
            <span className="h-0.5 w-3 border-t border-dashed border-series-4" /> Target
          </span>
        </div>
      </div>

      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={velocitySlice} margin={{ top: 20, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="teuFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2a78d6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e1e0d9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={{ stroke: "#c3c2b7" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={false}
              tickLine={false}
              domain={domain}
              tickFormatter={(v) => `${v} TEU`}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#c3c2b7", strokeDasharray: "3 3" }} />
            <ReferenceLine
              y={velocityTarget}
              stroke="#eda100"
              strokeDasharray="4 3"
              label={{ value: "Target", position: "right", fill: "#eda100", fontSize: 11, fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="teu"
              stroke="#2a78d6"
              strokeWidth={2}
              fill="url(#teuFill)"
              dot={{ r: 3, fill: "#2a78d6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3 text-[11px] text-ink-secondary">
        <span>
          Trailing Mean <span className="font-semibold text-ink-primary">{velocityStats.trailingMean}</span>
        </span>
        <span>
          Peak Variance <span className="font-semibold text-ink-primary">{velocityStats.peakVariance}</span>
        </span>
        <span className="text-status-good">✓ On-Time Integrity {velocityStats.onTimeIntegrity}</span>
        <button onClick={handleExport} className="flex items-center gap-1 font-medium text-series-1 hover:underline">
          Export Time Series <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}
