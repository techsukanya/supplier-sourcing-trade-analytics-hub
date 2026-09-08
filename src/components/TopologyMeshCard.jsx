import React, { useMemo } from "react";
import { Waypoints, ExternalLink } from "lucide-react";
import { useFilters } from "../context/FiltersContext";

const FALLBACK_SUBTIER = ["Feedstock", "Sub-Components", "Raw Materials"];
const TIER1_SLOTS = [
  { x: 40, y: 12 },
  { x: 40, y: 30 },
  { x: 40, y: 48 },
];
const SUBTIER_SLOTS = [
  { x: 8, y: 14 },
  { x: 8, y: 34 },
  { x: 8, y: 50 },
];
const HUB = { x: 78, y: 30, label: "HQ · Procurement Core" };

// Builds the mesh's node/edge layout straight from the currently filtered
// exporters (topologyView.nodes = top 3 by TEU volume — see
// data/selectors.js#getTopologyView), so the diagram redraws with the
// dropdowns instead of showing a fixed 6-node mock every time.
function useMeshLayout(topologyView, filteredExporters) {
  return useMemo(() => {
    const tier1 = topologyView.nodes.map((n, i) => ({
      id: n.id,
      label: n.initials,
      critical: n.critical,
      pct: i === 0 && n.pct ? `${n.pct}% VOL` : null,
      ...TIER1_SLOTS[i],
    }));

    const subtierLabels = [...new Set(filteredExporters.map((e) => e.commodity))].slice(0, 3);
    while (subtierLabels.length < Math.min(3, tier1.length || 1)) {
      subtierLabels.push(FALLBACK_SUBTIER[subtierLabels.length]);
    }
    const subtier = subtierLabels.map((label, i) => ({ id: `sub-${i}`, label, ...SUBTIER_SLOTS[i] }));

    const edges = [];
    subtier.forEach((s, i) => {
      const target = tier1[i % Math.max(tier1.length, 1)];
      if (target) edges.push({ from: s, to: target, critical: target.critical });
    });
    tier1.forEach((t) => edges.push({ from: t, to: { ...HUB, critical: false }, critical: t.critical }));

    return { tier1, subtier, edges };
  }, [topologyView, filteredExporters]);
}

export default function TopologyMeshCard() {
  const { topologyView, filteredExporters } = useFilters();
  const { tier1, subtier, edges } = useMeshLayout(topologyView, filteredExporters);

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <Waypoints size={15} className="text-series-7" />
            Buyer-Supplier Topology Mesh
          </h3>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Multi-tier dependency topology, critical nodes &amp; ports · top {tier1.length} by volume in view
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-status-good/10 px-2 py-1 text-[10px] font-semibold text-status-good">
          ACTIVE MESH
        </span>
      </div>

      <div className="relative mt-3 h-52 overflow-hidden rounded-md border border-hairline bg-plane">
        {tier1.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            No suppliers match the current filters.
          </div>
        ) : (
          <>
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full">
              <text x="8" y="6" fontSize="3" fill="#898781" textAnchor="middle">TIER-2 SUBTIER</text>
              <text x="40" y="6" fontSize="3" fill="#898781" textAnchor="middle">TIER-1 EXPORTERS</text>
              <text x="78" y="6" fontSize="3" fill="#898781" textAnchor="middle">ENTERPRISE HUB</text>

              {edges.map((e, i) => (
                <line
                  key={i}
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke={e.critical ? "#2a78d6" : "#c3c2b7"}
                  strokeWidth={e.critical ? 0.6 : 0.35}
                  strokeDasharray={e.critical ? undefined : "1.4 1"}
                />
              ))}

              {subtier.map((s) => (
                <g key={s.id}>
                  <circle cx={s.x} cy={s.y} r={2} fill="#89878133" stroke="#fcfcfb" strokeWidth={0.5} />
                </g>
              ))}

              {tier1.map((t) => (
                <g key={t.id}>
                  {t.critical && <circle cx={t.x} cy={t.y} r={3.2 + 1.6} fill="none" stroke="#d03b3b" strokeWidth={0.5} />}
                  <circle cx={t.x} cy={t.y} r={3.2} fill={t.critical ? "#2a78d6" : "#4a3aa7"} stroke="#fcfcfb" strokeWidth={0.5} />
                  <text x={t.x} y={t.y + 1} fontSize={2.4} fill="#fff" textAnchor="middle" fontWeight="600">
                    {t.label}
                  </text>
                </g>
              ))}

              <g>
                <circle cx={HUB.x} cy={HUB.y} r={4.2} fill="#0b0b0b" stroke="#fcfcfb" strokeWidth={0.5} />
                <text x={HUB.x} y={HUB.y + 1} fontSize={2.6} fill="#fff" textAnchor="middle" fontWeight="600">
                  HQ
                </text>
              </g>
            </svg>

            {subtier.map((s) => (
              <span
                key={s.id}
                className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-ink-primary/70 px-1 py-0.5 text-[9px] font-medium text-white"
                style={{ left: `${s.x}%`, top: `${(s.y / 60) * 100}%` }}
              >
                {s.label}
              </span>
            ))}

            {tier1
              .filter((t) => t.pct)
              .map((t) => (
                <span
                  key={`pct-${t.id}`}
                  className="absolute -translate-x-1/2 rounded bg-series-1 px-1.5 py-0.5 text-[9px] font-semibold text-white"
                  style={{ left: `${t.x}%`, top: `${(t.y / 60) * 100 - 14}%` }}
                >
                  {t.pct}
                </span>
              ))}
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-hairline px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-ink-muted">Network Density</p>
          <p className="tabular text-sm font-semibold text-ink-primary">
            {topologyView.density.toFixed(2)} ({topologyView.density >= 0.6 ? "High" : topologyView.density >= 0.35 ? "Moderate" : "Low"})
          </p>
          <p className="text-[10px] text-ink-secondary">{topologyView.densityLabel}</p>
        </div>
        <div className="rounded-md border border-hairline px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-ink-muted">Critical Node Risk</p>
          <p className={`tabular text-sm font-semibold ${topologyView.criticalCount > 0 ? "text-status-critical" : "text-status-good"}`}>
            {topologyView.criticalLabel}
          </p>
          <p className="text-[10px] text-ink-secondary">{topologyView.criticalSub}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
        <span>Depth: Tier-1, Tier-2, Transit Nodes</span>
        <a href="#" className="flex items-center gap-1 font-medium text-series-1 hover:underline">
          Inspect Multi-Tier Graph <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
