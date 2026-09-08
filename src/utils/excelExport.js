import * as XLSX from "xlsx";
import { tariffRoutes } from "../data/mockData";

// Builds the multi-sheet "Intelligence Dossier" workbook from whatever is
// currently on screen (i.e. already filtered by the dropdowns) — so the
// export always matches what the user is looking at, not a fixed snapshot.
export function exportIntelligenceDossier({ filters, statTiles, filteredExporters, velocitySlice, spendCategories }) {
  const wb = XLSX.utils.book_new();

  const filterSheet = XLSX.utils.json_to_sheet([
    { Filter: "Origin Corridor", Value: filters.corridorLabel },
    { Filter: "Commodity / Sector", Value: filters.commodity },
    { Filter: "Time Trajectory", Value: filters.trajectoryLabel },
    { Filter: "Sourcing Risk Tier", Value: filters.riskTierLabel },
    { Filter: "Generated", Value: new Date().toLocaleString() },
  ]);
  XLSX.utils.book_append_sheet(wb, filterSheet, "Filters Applied");

  const kpiSheet = XLSX.utils.json_to_sheet(
    statTiles.map((s) => ({
      Metric: s.label,
      Value: s.unit ? `${s.value} ${s.unit}` : s.value,
      Trend: s.trend || "",
      Detail: s.sub || "",
    }))
  );
  XLSX.utils.book_append_sheet(wb, kpiSheet, "KPI Summary");

  const supplierSheet = XLSX.utils.json_to_sheet(
    filteredExporters.map((e) => ({
      "Supplier / Exporter": e.name,
      Country: e.flag,
      Location: e.location,
      "D-U-N-S / Sector": e.duns,
      Corridor: e.corridor,
      Commodity: e.commodity,
      "Reliability Score": e.score,
      "Shipment Frequency": e.freq,
      "TEU Volume": e.teu,
      "On-Time Dispatch": e.onTime,
      Certifications: e.certs.join(", "),
      "Risk Tier": e.risk,
      "Diversification Role": e.role,
      "Role Detail": e.roleSub,
    }))
  );
  XLSX.utils.book_append_sheet(wb, supplierSheet, "Suppliers");

  const velocitySheet = XLSX.utils.json_to_sheet(
    velocitySlice.map((d) => ({ Month: d.month, "TEU Volume": d.teu }))
  );
  XLSX.utils.book_append_sheet(wb, velocitySheet, "Shipment Velocity");

  const spendSheet = XLSX.utils.json_to_sheet(
    spendCategories.map((c) => ({ Category: c.name, "Spend ($M)": c.value, "Share (%)": c.pct }))
  );
  XLSX.utils.book_append_sheet(wb, spendSheet, "Spend Categories");

  const tariffSheet = XLSX.utils.json_to_sheet(
    tariffRoutes.map((r) => ({
      Route: r.name,
      "Concessional Rate": r.tag,
      "Savings YTD": r.saved,
      "Utilization (%)": r.utilization,
      Note: r.note,
    }))
  );
  XLSX.utils.book_append_sheet(wb, tariffSheet, "Tariff Arbitrage");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `dealbridge-intelligence-dossier-${stamp}.xlsx`);
}
