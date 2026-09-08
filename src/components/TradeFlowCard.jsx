import React, { useMemo, useState } from "react";
import { Globe2 } from "lucide-react";
import { corridors } from "../data/filterOptions";
import { corridorBaseline } from "../data/analyticsModel";
import { useFilters } from "../context/FiltersContext";
import TariffHeatmapView from "./TariffHeatmapView";
import TransitTimesView from "./TransitTimesView";

const TABS = ["Active Corridors", "Tariff Heatmap", "Transit Times"];

// Stylised port nodes positioned on a 0-100 percentage grid so the panel
// stays responsive. Swap this component's body for react-simple-maps +
// a topojson world atlas to render a real geographic projection.
// One node per corridor (except "global", which has no single port) so
// every Origin Corridor selection has something on the map to highlight.
const nodes = [
  { id: "us", label: "US Hub · Port", x: 12, y: 46, corridor: "usa" },
  { id: "hh", label: "Hamburg · 102 TEU", x: 48, y: 30, corridor: "germany" },
  { id: "hp", label: "Hai Phong · 137 TEU", x: 66, y: 62, corridor: "vietnam" },
  { id: "bu", label: "Busan · 77 TEU", x: 84, y: 42, corridor: "korea" },
  { id: "jp", label: "Yokohama · 60 TEU", x: 94, y: 24, corridor: "japan" },
  { id: "cn", label: "Ningbo · 95 TEU", x: 58, y: 46, corridor: "china" },
  { id: "ae", label: "Jebel Ali · 40 TEU", x: 40, y: 54, corridor: "uae" },
  { id: "in", label: "Nhava Sheva · 30 TEU", x: 52, y: 60, corridor: "india" },
];

const routes = [
  { from: "us", to: "hh", dashed: false, label: "Trans-Atlantic (8d)" },
  { from: "us", to: "hp", dashed: true, label: "Trans-Pacific (14d)" },
  { from: "hh", to: "hp", dashed: false },
  { from: "hp", to: "bu", dashed: false },
  { from: "bu", to: "jp", dashed: false },
  { from: "hp", to: "cn", dashed: false },
  { from: "hh", to: "ae", dashed: false },
  { from: "hp", to: "in", dashed: false },
];

// Corridor chips are derived from the same analytics model driving the KPI
// tiles (each corridor's supplier count, expressed as a share of the
// non-global total) — so this row visibly changes with the Origin Corridor
// dropdown instead of being a static 5-box mock.
function useCorridorChips() {
  return useMemo(() => {
    const list = corridors.filter((c) => c.id !== "global");
    const total = list.reduce((sum, c) => sum + corridorBaseline[c.id].suppliers, 0);
    return list
      .map((c) => ({
        ...c,
        pct: ((corridorBaseline[c.id].suppliers / total) * 100).toFixed(1),
        detail: `${corridorBaseline[c.id].shipmentFreq} TEUs/mo`,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, []);
}

function ActiveCorridorsMap({ filters }) {
  // Dim routes/nodes that aren't relevant to the selected corridor instead
  // of just outlining the matching one, so a corridor pick visibly thins
  // the map out.
  const isNodeRelevant = (n) => filters.corridor === "global" || filters.corridor === n.corridor;
  const isRouteRelevant = (r) =>
    filters.corridor === "global" ||
    nodes.find((n) => n.id === r.from)?.corridor === filters.corridor ||
    nodes.find((n) => n.id === r.to)?.corridor === filters.corridor;

  return (
    <>
      <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="h-full w-full">
        {/* stylised landmasses */}
        <path d="M0 20 L14 14 L28 22 L22 34 L8 36 Z" fill="#eceae2" />
        <path d="M34 8 L58 10 L64 22 L50 30 L36 24 Z" fill="#eceae2" />
        <path d="M52 34 L74 30 L86 40 L78 54 L58 50 Z" fill="#eceae2" />
        <path d="M78 18 L96 20 L92 34 L80 32 Z" fill="#eceae2" />

        {routes.map((r, i) => {
          const relevant = isRouteRelevant(r);
          return (
            <line
              key={i}
              x1={nodes.find((n) => n.id === r.from).x}
              y1={nodes.find((n) => n.id === r.from).y}
              x2={nodes.find((n) => n.id === r.to).x}
              y2={nodes.find((n) => n.id === r.to).y}
              stroke={r.dashed ? "#eda100" : "#2a78d6"}
              strokeWidth={r.dashed ? 0.5 : 0.7}
              strokeDasharray={r.dashed ? "2 1.5" : undefined}
              opacity={relevant ? 0.85 : 0.15}
            />
          );
        })}

        {nodes.map((n) => {
          const active = filters.corridor === n.corridor;
          const relevant = isNodeRelevant(n);
          return (
            <g key={n.id} opacity={relevant ? 1 : 0.25}>
              {active && <circle cx={n.x} cy={n.y} r={2.6} fill="none" stroke="#2a78d6" strokeWidth={0.5} />}
              <circle cx={n.x} cy={n.y} r={1.6} fill={active ? "#2a78d6" : "#4a4a46"} stroke="#fcfcfb" strokeWidth={0.6} />
            </g>
          );
        })}
      </svg>

      {nodes.map((n) => (
        <span
          key={n.id}
          className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white transition-opacity ${
            filters.corridor === n.corridor ? "bg-series-1" : "bg-ink-primary/85"
          } ${isNodeRelevant(n) ? "opacity-100" : "opacity-25"}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.label}
        </span>
      ))}

      <div className="absolute bottom-2 left-2 flex items-center gap-3 rounded bg-surface/90 px-2 py-1 text-[10px] font-medium text-ink-secondary">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-series-1" /> Trans-Pacific (14d)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 border-t border-dashed border-series-4" /> Trans-Atlantic (8d)
        </span>
      </div>
    </>
  );
}

export default function TradeFlowCard() {
  const [tab, setTab] = useState(TABS[0]);
  const { filters, setFilter } = useFilters();
  const chips = useCorridorChips();

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <Globe2 size={15} className="text-series-1" />
            Global Trade Flow &amp; Maritime Corridors
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {tab === "Active Corridors" && "Live vector trade lanes, bill of lading transit volumes, and port telemetry"}
            {tab === "Tariff Heatmap" && "MFN-equivalent duty rate by corridor × commodity"}
            {tab === "Transit Times" && "Average port-to-hub transit days by corridor"}
          </p>
        </div>
        <div className="flex rounded-md border border-hairline bg-plane p-0.5 text-[11px] font-medium">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-2 py-1 ${
                tab === t ? "bg-surface text-series-1 shadow-sm" : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3 h-52 overflow-hidden rounded-md border border-hairline bg-plane">
        {tab === "Active Corridors" && <ActiveCorridorsMap filters={filters} />}
        {tab === "Tariff Heatmap" && <TariffHeatmapView />}
        {tab === "Transit Times" && <TransitTimesView />}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chips.map((c) => {
          const active = filters.corridor === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter("corridor", c.id)}
              className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                active ? "border-series-1 bg-series-1/5" : "border-hairline hover:bg-plane"
              }`}
            >
              <p className="truncate text-[11px] text-ink-secondary">{c.label}</p>
              <p className="tabular text-sm font-semibold text-series-1">{c.pct}%</p>
              <p className="text-[10px] text-ink-muted">{c.detail}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
