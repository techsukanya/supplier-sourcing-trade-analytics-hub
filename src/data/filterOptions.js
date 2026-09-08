// Filter taxonomy for the dashboard's 4 dropdowns.
//
// Modeled loosely on how India's Trade Analytics Portal (TIA — Dept. of
// Commerce, trade-analytics.commerce.gov.in) structures its own filters:
// a partner-country / corridor dimension, a commodity (HS-code family)
// dimension, a trailing time window, and — specific to this sourcing-risk
// use case — a supplier risk tier. Commodity options CASCADE off the
// selected corridor (each corridor only offers the commodities actually
// sourced through it), exactly like TIA's "Trade Watch - Country" view
// re-scopes its commodity picker once a partner country is chosen.

export const corridors = [
  { id: "global", label: "All Corridors (Global)" },
  { id: "vietnam", label: "Vietnam (Cat Lai)" },
  { id: "germany", label: "Germany (HHN)" },
  { id: "japan", label: "Japan (Nagoya)" },
  { id: "korea", label: "Korea (Busan)" },
  { id: "china", label: "China (Ningbo)" },
  { id: "uae", label: "UAE (Jebel Ali)" },
  { id: "usa", label: "USA (Long Beach)" },
  { id: "india", label: "India (Nhava Sheva)" },
];

// Commodity/sector options per corridor. "all" applies to every corridor.
const ALL_COMMODITIES = [
  "All Primary Commodities",
  "Clean Energy & Solar",
  "Industrial CNC Machinery",
  "Specialty Polymers",
  "Advanced Textiles",
  "Passive Components",
  "Aerospace Composites",
];

export const commoditiesByCorridor = {
  global: ALL_COMMODITIES,
  vietnam: ["All Primary Commodities", "Clean Energy & Solar", "Advanced Textiles", "Passive Components"],
  germany: ["All Primary Commodities", "Industrial CNC Machinery", "Specialty Polymers", "Advanced Textiles"],
  japan: ["All Primary Commodities", "Passive Components", "Industrial CNC Machinery"],
  korea: ["All Primary Commodities", "Clean Energy & Solar", "Passive Components"],
  china: ["All Primary Commodities", "Clean Energy & Solar", "Advanced Textiles", "Specialty Polymers", "Passive Components"],
  uae: ["All Primary Commodities", "Specialty Polymers", "Advanced Textiles", "Clean Energy & Solar"],
  usa: ["All Primary Commodities", "Industrial CNC Machinery", "Specialty Polymers", "Passive Components"],
  india: ["All Primary Commodities", "Aerospace Composites", "Advanced Textiles"],
};

export function getCommodityOptions(corridorId) {
  return commoditiesByCorridor[corridorId] || ALL_COMMODITIES;
}

export const trajectories = [
  { id: "t3", label: "Trailing 3 Months (T3M)", months: 3 },
  { id: "t6", label: "Trailing 6 Months (T6M)", months: 6 },
  { id: "t12", label: "Trailing 12 Months (T12M)", months: 12 },
  { id: "t24", label: "Trailing 24 Months (T24M)", months: 24 },
];

export const riskTiers = [
  { id: "all", label: "All Risk Profiles" },
  { id: "good", label: "Low Risk" },
  { id: "warning", label: "Moderate" },
  { id: "info", label: "Growth Watch" },
  { id: "critical", label: "High Risk" },
];

export const defaultFilters = {
  corridor: "global",
  commodity: "All Primary Commodities",
  trajectory: "t12",
  riskTier: "all",
};
