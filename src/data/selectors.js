// Pure functions that turn { filters, searchTerm, exporters } into exactly
// what each chart/table/tile needs to render. Keeping this logic out of the
// components means swapping the mock arrays in mockData.js for a real API
// response (see services/tradeDataService.js) only ever touches this file.

import { spendCategories } from "./mockData";
import { corridors, commoditiesByCorridor, trajectories, riskTiers } from "./filterOptions";
import {
  deriveMetrics,
  generateVelocitySeries,
  corridorTransitDays,
  getGlobalAvgTransitDays,
  tariffMatrix,
  tariffColor,
  commodityList,
  corridorSpendMultiplier,
  corridorSpendTotal,
} from "./analyticsModel";

export function filterExporters(exporters, filters, searchTerm) {
  const term = (searchTerm || "").trim().toLowerCase();

  return exporters.filter((e) => {
    if (filters.corridor !== "global" && e.corridor !== filters.corridor) return false;
    if (filters.commodity !== "All Primary Commodities" && e.commodity !== filters.commodity) return false;
    if (filters.riskTier !== "all" && e.riskTone !== filters.riskTier) return false;

    if (term) {
      const haystack = `${e.name} ${e.duns} ${e.commodity} ${e.role} ${e.location}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export function paginate(rows, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: rows.length,
    start: rows.length === 0 ? 0 : start + 1,
    end: Math.min(start + pageSize, rows.length),
  };
}

// Regenerates the 24-month TEU series for the CURRENT corridor+commodity
// (see analyticsModel.js#generateVelocitySeries), then slices it to the
// selected Time Trajectory window. Every one of the 3 dropdowns that can
// touch this chart (corridor, commodity, trajectory) changes its output.
export function buildVelocity(filters) {
  const traj = trajectories.find((t) => t.id === filters.trajectory) || trajectories[2];
  const { series, target } = generateVelocitySeries(filters.corridor, filters.commodity);
  return { slice: series.slice(-traj.months), target };
}

export function computeVelocityStats(slice, filteredExporters) {
  const values = slice.map((d) => d.teu);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const peak = Math.max(...values);
  const peakVariance = mean > 0 ? (((peak - mean) / mean) * 100).toFixed(1) : "0.0";

  const onTimeValues = filteredExporters
    .map((e) => parseFloat(e.onTime))
    .filter((v) => !Number.isNaN(v));
  const onTimeIntegrity = onTimeValues.length
    ? (onTimeValues.reduce((a, b) => a + b, 0) / onTimeValues.length).toFixed(1)
    : "94.1";

  return {
    trailingMean: `${Math.round(mean)} TEU/mo`,
    peakVariance: `+${peakVariance}%`,
    onTimeIntegrity: `${onTimeIntegrity}%`,
  };
}

export function getStatTiles(filters) {
  const m = deriveMetrics(filters.corridor, filters.commodity);
  return [
    {
      label: "Tracked Suppliers",
      value: m.suppliers.toLocaleString(),
      trend: "+14% YoY",
      trendUp: true,
      sub: "Active cross-border vendors",
      footer: `${Math.round(m.suppliers * 0.065).toLocaleString()} Tier-1 Verified`,
    },
    {
      label: "Avg. Reliability",
      value: m.reliability.toFixed(1),
      unit: "/ 100",
      trend: "+3.2 pts",
      trendUp: true,
      sub: `On-Time ${m.onTime.toFixed(1)}% · Spec Pass ${m.specPass.toFixed(1)}%`,
      progress: m.reliability,
    },
    {
      label: "Shipment Frequency",
      value: m.shipmentFreq.toLocaleString(),
      unit: "TEUs /mo",
      sub: `${m.shipmentsPerSupplier.toFixed(1)} shipments / supplier avg`,
      footer: "Peak Velocity Index 9.4 / 10",
    },
    {
      label: "Diversification (HHI)",
      value: m.hhi.toFixed(2),
      badge: { text: m.hhi < 0.3 ? "Healthy" : "Concentrated", tone: m.hhi < 0.3 ? "good" : "warning" },
      sub: `Origin spread across ${m.hubs} hubs`,
      warning: m.hhi >= 0.3 ? "Elevated single-origin exposure" : undefined,
    },
    {
      label: "Ready Alternates",
      value: m.alternates.toLocaleString(),
      trend: `${m.fastTrack} Fast-track`,
      sub: "Pre-qualified facilities",
      footer: `Buffer: +${m.buffer.toLocaleString()} MT`,
    },
  ];
}

// Supplier Performance Matrix — derived straight from the (filtered)
// exporters list rather than a separate hardcoded sample, so the scatter
// genuinely reacts to the corridor/commodity/risk-tier dropdowns instead of
// just re-labelling a fixed 6 dots.
export const PERFORMANCE_X_SPLIT = 3.5; // avg transit days
export const PERFORMANCE_Y_SPLIT = 88; // reliability %

function estimateTransitDays(onTimePct) {
  // Lower on-time % implies longer/less predictable transit. Calibrated so
  // ~97% on-time lands near 1.3 days and ~80% lands near 4.4 days.
  const days = 1 + (100 - onTimePct) / 8;
  return Math.round(days * 10) / 10;
}

export function classifyQuadrant(reliability, transitDays) {
  if (reliability >= PERFORMANCE_Y_SPLIT && transitDays < PERFORMANCE_X_SPLIT) return "champion";
  if (reliability >= PERFORMANCE_Y_SPLIT && transitDays >= PERFORMANCE_X_SPLIT) return "specialist";
  if (reliability < PERFORMANCE_Y_SPLIT && transitDays < PERFORMANCE_X_SPLIT) return "watchlist";
  return "bottleneck";
}

export function buildPerformanceMatrix(filteredExporters) {
  return filteredExporters.map((e) => {
    const onTimePct = parseFloat(e.onTime) || 85;
    const transitDays = estimateTransitDays(onTimePct);
    const reliability = e.score;
    return {
      name: e.name,
      reliability,
      transitDays,
      teu: e.teu || 50,
      quadrant: classifyQuadrant(reliability, transitDays),
    };
  });
}

export function getRiskTierLabel(id) {
  return (riskTiers.find((r) => r.id === id) || riskTiers[0]).label;
}

// Spend donut: reweights every category's $ value for the selected
// corridor (categories that corridor actually sources get boosted, the
// rest shrink — see analyticsModel.js#corridorSpendMultiplier) and rescales
// to that corridor's own total spend, so both the slice sizes AND the
// total figure change — not just which slice is highlighted.
export function getSpendCategories(filters) {
  const corridorCommodities = commoditiesByCorridor[filters.corridor] || [];
  const weighted = spendCategories.map((c) => ({
    ...c,
    weight: corridorSpendMultiplier(filters.corridor, corridorCommodities, c.name),
  }));
  const weightSum = weighted.reduce((sum, c) => sum + c.weight, 0);
  const total = corridorSpendTotal(filters.corridor);

  const rescaled = weighted.map((c) => {
    const value = +((c.weight / weightSum) * total).toFixed(1);
    return { ...c, value, pct: Math.round((value / total) * 100) };
  });

  const isFiltered = filters.commodity !== "All Primary Commodities";
  return rescaled.map((c) => ({ ...c, active: !isFiltered || c.name === filters.commodity }));
}

// Tariff Heatmap tab (TradeFlowCard) — a corridor x commodity grid of
// MFN-equivalent duty rates. Selecting a specific corridor narrows the rows;
// selecting a specific commodity narrows the columns — so the grid itself
// shrinks/grows with the dropdowns, not just a highlighted cell.
export function getTariffHeatmap(filters) {
  const rowCorridors =
    filters.corridor === "global" ? corridors.filter((c) => c.id !== "global") : corridors.filter((c) => c.id === filters.corridor);
  const columns = filters.commodity === "All Primary Commodities" ? commodityList : [filters.commodity];

  return {
    columns,
    rows: rowCorridors.map((c) => ({
      corridorId: c.id,
      label: c.label,
      cells: columns.map((commodity) => {
        const rate = tariffMatrix[c.id]?.[commodity] ?? 0;
        return { commodity, rate, ...tariffColor(rate) };
      }),
    })),
  };
}

// Transit Times tab (TradeFlowCard) — avg transit days per corridor. The
// selected corridor is highlighted (full opacity); everything else dims,
// same convention as the spend donut and performance matrix.
export function getTransitTimes(filters) {
  const rows = Object.entries(corridorTransitDays).map(([id, days]) => ({
    id,
    label: corridors.find((c) => c.id === id)?.label || id,
    days,
    active: filters.corridor === "global" || filters.corridor === id,
  }));
  return { rows, globalAvg: getGlobalAvgTransitDays() };
}

// Buyer-Supplier Topology Mesh — network density / critical-node-risk
// numbers and the 3 "Tier-1 Exporter" mesh nodes, all derived from the
// currently filtered supplier list instead of a fixed mock mesh.
export function getTopologyView(filters, filteredExporters) {
  const m = deriveMetrics(filters.corridor, filters.commodity);
  const density = Math.min(0.98, +(m.hhi * 2.6).toFixed(2));

  const criticalSuppliers = filteredExporters.filter((e) => e.riskTone === "critical");
  const topByVolume = [...filteredExporters].sort((a, b) => (b.teu || 0) - (a.teu || 0)).slice(0, 3);
  const totalTeu = filteredExporters.reduce((sum, x) => sum + (x.teu || 0), 0) || 1;

  return {
    density,
    densityLabel: density >= 0.6 ? "Strong subtier mesh" : density >= 0.35 ? "Moderate subtier mesh" : "Thin subtier mesh",
    criticalCount: criticalSuppliers.length,
    criticalLabel: criticalSuppliers.length > 0 ? `${criticalSuppliers.length} Exporter${criticalSuppliers.length > 1 ? "s" : ""}` : "None flagged",
    criticalSub: criticalSuppliers.length > 0 ? ">40% consolidated share" : "No concentration flags in view",
    nodes: topByVolume.map((e) => ({
      id: e.name,
      initials: e.initials,
      critical: e.riskTone === "critical",
      pct: Math.round(((e.teu || 0) / totalTeu) * 100),
    })),
  };
}
