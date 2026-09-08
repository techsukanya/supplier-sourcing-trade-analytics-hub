import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from "recharts";
import { useFilters } from "../context/FiltersContext";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-hairline bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink-primary">{d.label}</p>
      <p className="tabular text-series-1">{d.days}d avg transit</p>
    </div>
  );
}

export default function TransitTimesView() {
  const { transitTimes } = useFilters();
  const { rows, globalAvg } = transitTimes;
  const sorted = [...rows].sort((a, b) => a.days - b.days);

  return (
    <div className="h-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="#e1e0d9" />
          <XAxis
            type="number"
            domain={[0, "dataMax + 2"]}
            tick={{ fontSize: 10, fill: "#898781" }}
            axisLine={{ stroke: "#c3c2b7" }}
            tickLine={false}
            tickFormatter={(v) => `${v}d`}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fontSize: 10, fill: "#52514e" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#e1e0d9", fillOpacity: 0.4 }} />
          <ReferenceLine
            x={globalAvg}
            stroke="#898781"
            strokeDasharray="3 3"
            label={{ value: "Avg", position: "top", fontSize: 9, fill: "#898781" }}
          />
          <Bar dataKey="days" radius={[0, 3, 3, 0]} maxBarSize={14}>
            {sorted.map((row) => (
              <Cell key={row.id} fill="#2a78d6" fillOpacity={row.active ? 0.9 : 0.25} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
