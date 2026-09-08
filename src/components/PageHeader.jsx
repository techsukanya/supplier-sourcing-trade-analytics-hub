import React from "react";
import { ShieldCheck, Download, PlusCircle, ChevronRight, RefreshCcw } from "lucide-react";
import { corridors, trajectories, riskTiers } from "../data/filterOptions";
import { useFilters } from "../context/FiltersContext";
import { exportIntelligenceDossier } from "../utils/excelExport";
import { useLiveFeed } from "../services/tradeDataService";

export default function PageHeader() {
  const { filters, statTiles, filteredExporters, velocitySlice, spendCategories, openSupplierForm } = useFilters();
  const { ledgerSyncedLabel } = useLiveFeed();

  const handleExportDossier = () => {
    exportIntelligenceDossier({
      filters: {
        corridorLabel: corridors.find((c) => c.id === filters.corridor)?.label,
        commodity: filters.commodity,
        trajectoryLabel: trajectories.find((t) => t.id === filters.trajectory)?.label,
        riskTierLabel: riskTiers.find((r) => r.id === filters.riskTier)?.label,
      },
      statTiles,
      filteredExporters,
      velocitySlice,
      spendCategories,
    });
  };

  return (
    <div className="px-4 pt-5 lg:px-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <span>Intelligence Hub</span>
          <ChevronRight size={12} />
          <span>Global Sourcing</span>
          <ChevronRight size={12} />
          <span className="font-medium text-series-1">Supplier &amp; Trade Analytics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCcw size={12} className="animate-spin-slow" />
          <span>Ledger Synced: {ledgerSyncedLabel}</span>
          <span className="mx-1 text-hairline">|</span>
          <span>Customs Feed v4.28</span>
        </div>
      </div>

      {/* Verified badge */}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-series-1">
        <ShieldCheck size={14} />
        Tier-1 Verified Intelligence Dossier
      </div>

      {/* Title row */}
      <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-[26px]">
            Supplier Sourcing &amp; Trade Analytics Hub
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            Company-level vetting, shipment velocity indices, trade-lane vulnerability scoring, and customs duty
            arbitrage across {statTiles[0]?.value ?? "4,820"} active suppliers.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink-secondary shadow-sm hover:bg-plane"
          >
            <Download size={14} />
            Export Intelligence Dossier
          </button>
          <button
            onClick={openSupplierForm}
            className="flex items-center gap-1.5 rounded-md bg-series-1 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-series-1/90"
          >
            <PlusCircle size={14} />
            Source New Supplier
          </button>
        </div>
      </div>
    </div>
  );
}
