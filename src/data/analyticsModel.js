// A small numeric model that drives how the KPI tiles, spend donut,
// trade-corridor chips, shipment-velocity chart, tariff heatmap, transit-time
// chart, and topology mesh all respond when the corridor / commodity
// dropdowns change. In a real integration this file is what you'd delete —
// replace `deriveMetrics()` (and friends below) with a call into
// services/tradeDataService.js (fetchTradeSnapshot) that returns the same
// shapes from a live backend.

import { shipmentVelocity as baseVelocityShape } from "./mockData";
import { seededRandom } from "../utils/prng";

export const corridorBaseline = {
  global: { suppliers: 4820, reliability: 88.4, onTime: 94.1, specPass: 98.2, shipmentFreq: 428, shipmentsPerSupplier: 18.4, hhi: 0.24, hubs: 14, alternates: 1450, fastTrack: 38, buffer: 185000 },
  vietnam: { suppliers: 1310, reliability: 90.1, onTime: 92.4, specPass: 97.1, shipmentFreq: 152, shipmentsPerSupplier: 15.2, hhi: 0.31, hubs: 5, alternates: 410, fastTrack: 14, buffer: 62000 },
  germany: { suppliers: 640, reliability: 91.8, onTime: 93.9, specPass: 98.6, shipmentFreq: 96, shipmentsPerSupplier: 12.1, hhi: 0.28, hubs: 4, alternates: 210, fastTrack: 9, buffer: 34000 },
  japan: { suppliers: 512, reliability: 93.2, onTime: 96.0, specPass: 99.1, shipmentFreq: 78, shipmentsPerSupplier: 11.4, hhi: 0.22, hubs: 3, alternates: 180, fastTrack: 7, buffer: 28000 },
  korea: { suppliers: 588, reliability: 89.7, onTime: 91.8, specPass: 97.8, shipmentFreq: 84, shipmentsPerSupplier: 13.0, hhi: 0.26, hubs: 3, alternates: 205, fastTrack: 8, buffer: 31000 },
  china: { suppliers: 980, reliability: 84.5, onTime: 87.0, specPass: 95.4, shipmentFreq: 210, shipmentsPerSupplier: 19.8, hhi: 0.44, hubs: 6, alternates: 260, fastTrack: 6, buffer: 45000 },
  uae: { suppliers: 340, reliability: 87.9, onTime: 89.6, specPass: 96.3, shipmentFreq: 58, shipmentsPerSupplier: 10.6, hhi: 0.33, hubs: 3, alternates: 120, fastTrack: 5, buffer: 19000 },
  usa: { suppliers: 410, reliability: 92.6, onTime: 95.2, specPass: 98.9, shipmentFreq: 62, shipmentsPerSupplier: 9.8, hhi: 0.19, hubs: 4, alternates: 150, fastTrack: 6, buffer: 22000 },
  india: { suppliers: 240, reliability: 85.3, onTime: 88.1, specPass: 96.0, shipmentFreq: 34, shipmentsPerSupplier: 8.9, hhi: 0.21, hubs: 2, alternates: 95, fastTrack: 4, buffer: 15000 },
};

// Multiplier applied to volume-shaped metrics (suppliers, shipmentFreq,
// alternates, fastTrack, buffer) when a specific commodity is chosen inside
// a corridor — commodities are always a slice of a corridor's total.
export const commodityShare = {
  "All Primary Commodities": 1,
  "Clean Energy & Solar": 0.38,
  "Industrial CNC Machinery": 0.26,
  "Specialty Polymers": 0.18,
  "Advanced Textiles": 0.21,
  "Passive Components": 0.16,
  "Aerospace Composites": 0.08,
};

// Small reliability/on-time deltas per commodity (some categories just run
// hotter/cooler than a corridor's blended average).
export const commodityQualityDelta = {
  "All Primary Commodities": { reliability: 0, onTime: 0 },
  "Clean Energy & Solar": { reliability: +1.4, onTime: -0.6 },
  "Industrial CNC Machinery": { reliability: +2.1, onTime: +0.8 },
  "Specialty Polymers": { reliability: -0.8, onTime: -1.2 },
  "Advanced Textiles": { reliability: -1.6, onTime: -2.4 },
  "Passive Components": { reliability: +1.8, onTime: +1.1 },
  "Aerospace Composites": { reliability: -0.4, onTime: -3.1 },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Derive the KPI-tile numbers for the current corridor + commodity
 * selection. Pure function of the filter state — swap this out for a real
 * fetch in production (see services/tradeDataService.js).
 */
export function deriveMetrics(corridorId, commodity) {
  const base = corridorBaseline[corridorId] || corridorBaseline.global;
  const share = commodityShare[commodity] ?? 1;
  const delta = commodityQualityDelta[commodity] || { reliability: 0, onTime: 0 };
  const scaled = commodity === "All Primary Commodities" ? 1 : share;

  return {
    suppliers: Math.max(4, Math.round(base.suppliers * scaled)),
    reliability: clamp(base.reliability + delta.reliability, 60, 99.9),
    onTime: clamp(base.onTime + delta.onTime, 50, 99.9),
    specPass: clamp(base.specPass + delta.reliability * 0.3, 80, 100),
    shipmentFreq: Math.max(2, Math.round(base.shipmentFreq * scaled)),
    shipmentsPerSupplier: base.shipmentsPerSupplier,
    hhi: clamp(base.hhi + (commodity === "All Primary Commodities" ? 0 : 0.03), 0.05, 0.9),
    hubs: base.hubs,
    alternates: Math.max(2, Math.round(base.alternates * scaled)),
    fastTrack: Math.max(1, Math.round(base.fastTrack * scaled)),
    buffer: Math.round(base.buffer * scaled),
  };
}

// ---------------------------------------------------------------------------
// Transit Times — average port-to-hub transit days per corridor. Drives the
// "Transit Times" tab of the Global Trade Flow card.
// ---------------------------------------------------------------------------
export const corridorTransitDays = {
  vietnam: 14,
  germany: 8,
  japan: 12,
  korea: 13,
  china: 16,
  uae: 10,
  usa: 9,
  india: 15,
};

export function getGlobalAvgTransitDays() {
  const ids = Object.keys(corridorTransitDays);
  const weightedSum = ids.reduce((sum, id) => sum + corridorTransitDays[id] * corridorBaseline[id].suppliers, 0);
  const totalSuppliers = ids.reduce((sum, id) => sum + corridorBaseline[id].suppliers, 0);
  return weightedSum / totalSuppliers;
}

// ---------------------------------------------------------------------------
// Tariff Heatmap — MFN-equivalent duty rate (%) by corridor x commodity.
// Drives the "Tariff Heatmap" tab. Cross-referenced against the FTA/tariff
// arbitrage figures already shown lower on the dashboard (EVFTA Vietnam,
// India-UAE CEPA, US-Japan bilateral) so the two panels tell one consistent
// story.
// ---------------------------------------------------------------------------
export const commodityList = Object.keys(commodityShare).filter((c) => c !== "All Primary Commodities");

export const tariffMatrix = {
  vietnam: { "Clean Energy & Solar": 0, "Industrial CNC Machinery": 2.1, "Specialty Polymers": 1.5, "Advanced Textiles": 0, "Passive Components": 0, "Aerospace Composites": 3.2 },
  germany: { "Clean Energy & Solar": 4.5, "Industrial CNC Machinery": 2.7, "Specialty Polymers": 3.1, "Advanced Textiles": 8.0, "Passive Components": 1.2, "Aerospace Composites": 1.7 },
  japan: { "Clean Energy & Solar": 3.0, "Industrial CNC Machinery": 0, "Specialty Polymers": 2.2, "Advanced Textiles": 6.5, "Passive Components": 0, "Aerospace Composites": 0 },
  korea: { "Clean Energy & Solar": 0, "Industrial CNC Machinery": 3.4, "Specialty Polymers": 2.8, "Advanced Textiles": 9.1, "Passive Components": 0, "Aerospace Composites": 2.0 },
  china: { "Clean Energy & Solar": 12.0, "Industrial CNC Machinery": 9.5, "Specialty Polymers": 8.2, "Advanced Textiles": 14.5, "Passive Components": 6.0, "Aerospace Composites": 11.0 },
  uae: { "Clean Energy & Solar": 0, "Industrial CNC Machinery": 1.8, "Specialty Polymers": 0, "Advanced Textiles": 5.0, "Passive Components": 0, "Aerospace Composites": 1.0 },
  usa: { "Clean Energy & Solar": 1.3, "Industrial CNC Machinery": 0, "Specialty Polymers": 2.0, "Advanced Textiles": 7.8, "Passive Components": 0, "Aerospace Composites": 0 },
  india: { "Clean Energy & Solar": 2.5, "Industrial CNC Machinery": 5.0, "Specialty Polymers": 4.4, "Advanced Textiles": 10.0, "Passive Components": 2.8, "Aerospace Composites": 0 },
};

// Sequential single-hue blue ramp (see dataviz palette reference) mapped to
// a 0-15%+ tariff scale — lighter = lower duty, darker = higher duty.
const TARIFF_COLOR_STOPS = [
  { max: 0.01, hex: "#eaf2fc", text: "#0b0b0b" },
  { max: 2, hex: "#cde2fb", text: "#0b0b0b" },
  { max: 4, hex: "#9ec5f4", text: "#0b0b0b" },
  { max: 6, hex: "#6da7ec", text: "#0b0b0b" },
  { max: 8, hex: "#3987e5", text: "#ffffff" },
  { max: 10, hex: "#256abf", text: "#ffffff" },
  { max: 12, hex: "#1c5cab", text: "#ffffff" },
  { max: Infinity, hex: "#0d366b", text: "#ffffff" },
];

export function tariffColor(rate) {
  const stop = TARIFF_COLOR_STOPS.find((s) => rate <= s.max) || TARIFF_COLOR_STOPS[TARIFF_COLOR_STOPS.length - 1];
  return { hex: stop.hex, text: stop.text };
}

// ---------------------------------------------------------------------------
// Sourcing Spend & Category Concentration — reweight the 5 spend categories
// (and the total $ figure) per corridor, so the donut genuinely redraws
// rather than just dimming a slice. Corridors emphasize the commodities
// they actually source (see filterOptions.js#commoditiesByCorridor).
// ---------------------------------------------------------------------------
export function corridorSpendMultiplier(corridorId, commoditiesForCorridor, categoryName) {
  if (corridorId === "global") return 1;
  return commoditiesForCorridor.includes(categoryName) ? 1.7 : 0.18;
}

export function corridorSpendTotal(corridorId) {
  const base = corridorBaseline[corridorId] || corridorBaseline.global;
  const global = corridorBaseline.global;
  if (corridorId === "global") return 148.0;
  return Math.max(4, +(148 * (base.suppliers / global.suppliers) * 1.35).toFixed(1));
}

// ---------------------------------------------------------------------------
// Monthly Shipment Velocity — regenerate the 24-month TEU series per
// corridor + commodity instead of showing one fixed global curve. Reuses the
// original series as a seasonal "shape", rescaled to the corridor's target
// monthly average and perturbed with a small amount of *deterministic* noise
// (seeded by corridor+commodity) so different selections produce visibly
// different curves, not just a uniformly-scaled copy of the same line.
// ---------------------------------------------------------------------------
export function generateVelocitySeries(corridorId, commodity) {
  const base = corridorBaseline[corridorId] || corridorBaseline.global;
  const share = commodity === "All Primary Commodities" ? 1 : commodityShare[commodity] ?? 1;
  const targetMean = Math.max(4, base.shipmentFreq * share);

  const shape = baseVelocityShape.map((d) => d.teu);
  const shapeMean = shape.reduce((a, b) => a + b, 0) / shape.length;
  const rng = seededRandom(`${corridorId}:${commodity}`);

  const series = baseVelocityShape.map((d, i) => {
    const normalized = shape[i] / shapeMean; // ~0.65 .. 1.35
    const noise = 1 + (rng() * 2 - 1) * 0.12; // +/- 12%, deterministic per key
    return { month: d.month, teu: Math.max(1, Math.round(targetMean * normalized * noise)) };
  });

  const target = Math.round(targetMean * 1.07);
  return { series, target };
}
