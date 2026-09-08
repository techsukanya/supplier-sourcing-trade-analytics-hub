import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { Orbit, ExternalLink } from "lucide-react";
import { quadrantMeta } from "../data/mockData";
import { buildPerformanceMatrix, PERFORMANCE_X_SPLIT, PERFORMANCE_Y_SPLIT } from "../data/selectors";
import { useFilters } from "../context/FiltersContext";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-hairline bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink-primary">{d.name}</p>
      <p className="text-ink-secondary">Reliability: <span className="tabular font-medium text-ink-primary">{d.reliability}%</span></p>
      <p className="text-ink-secondary">Transit: <span className="tabular font-medium text-ink-primary">{d.transitDays}d</span></p>
      <p className="text-ink-secondary">Volume: <span className="tabular font-medium text-ink-primary">{d.teu} TEU</span></p>
    </div>
  );
}

export default function PerformanceMatrixChart() {
  const { filteredExporters } = useFilters();
  const matrix = useMemo(() => buildPerformanceMatrix(filteredExporters), [filteredExporters]);
  const strategicPct = matrix.length
    ? Math.round((matrix.filter((d) => d.quadrant === "champion").length / matrix.length) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <Orbit size={15} className="text-series-7" />
            Supplier Performance Matrix
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Reliability Score (%) vs Port Lead Time (Days) · {matrix.length} suppliers in view
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-plane px-2 py-1 text-[10px] font-semibold text-ink-secondary">
          BUBBLE = TEU VOL
        </span>
      </div>

      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 16, left: -10, bottom: 4 }}>
            <ReferenceArea x1={0} x2={PERFORMANCE_X_SPLIT} y1={PERFORMANCE_Y_SPLIT} y2={100} fill="#2a78d6" fillOpacity={0.06} />
            <ReferenceArea x1={PERFORMANCE_X_SPLIT} x2={8} y1={PERFORMANCE_Y_SPLIT} y2={100} fill="#898781" fillOpacity={0.04} />
            <ReferenceArea x1={0} x2={PERFORMANCE_X_SPLIT} y1={60} y2={PERFORMANCE_Y_SPLIT} fill="#eda100" fillOpacity={0.06} />
            <ReferenceArea x1={PERFORMANCE_X_SPLIT} x2={8} y1={60} y2={PERFORMANCE_Y_SPLIT} fill="#d03b3b" fillOpacity={0.06} />

            <CartesianGrid stroke="#e1e0d9" />
            <XAxis
              type="number"
              dataKey="transitDays"
              name="Transit Days"
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={{ stroke: "#c3c2b7" }}
              tickLine={false}
              domain={[0, 8]}
              label={{ value: "Avg Transit Days (Lower is Faster) →", position: "insideBottom", offset: -2, fontSize: 10, fill: "#898781" }}
            />
            <YAxis
              type="number"
              dataKey="reliability"
              name="Reliability"
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={false}
              tickLine={false}
              domain={[60, 100]}
              width={36}
            />
            <ZAxis type="number" dataKey="teu" range={[60, 500]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <ReferenceLine x={PERFORMANCE_X_SPLIT} stroke="#c3c2b7" />
            <ReferenceLine y={PERFORMANCE_Y_SPLIT} stroke="#c3c2b7" />

            {Object.entries(quadrantMeta).map(([key, meta]) => (
              <Scatter
                key={key}
                name={meta.label}
                data={matrix.filter((d) => d.quadrant === key)}
                fill={meta.color}
                fillOpacity={0.85}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium text-ink-secondary">
        {Object.entries(quadrantMeta).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
        <span className="flex items-center gap-1 text-series-1">
          <span className="h-1.5 w-1.5 rounded-full bg-series-1" /> Top {strategicPct}% in Strategic quadrant
        </span>
        <a href="#" className="flex items-center gap-1 font-medium text-series-1 hover:underline">
          Quadrant Action Plan <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
