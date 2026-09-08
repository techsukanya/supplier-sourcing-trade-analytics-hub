import React from "react";
import { ChevronDown } from "lucide-react";
import { corridors, getCommodityOptions, trajectories, riskTiers } from "../data/filterOptions";
import { useFilters } from "../context/FiltersContext";

// Native <select> styled to look like the original dropdown chips, but
// fully controlled + cascading: changing Origin Corridor re-scopes the
// Commodity/Sector option list (see FiltersContext.setFilter), and every
// other change immediately re-derives the KPI tiles, charts, and table via
// data/selectors.js — so picking a new value visibly changes the
// visualizations, not just the filter chip's label.
function FilterSelect({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-hairline bg-surface px-3 py-2 pr-8 text-left text-sm text-ink-primary shadow-sm outline-none hover:bg-plane focus:border-series-1"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}

export default function FilterBar() {
  const { filters, setFilter } = useFilters();
  const commodityOptions = getCommodityOptions(filters.corridor);

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <FilterSelect
        label="Origin Corridor"
        value={filters.corridor}
        onChange={(v) => setFilter("corridor", v)}
        options={corridors.map((c) => ({ value: c.id, label: c.label }))}
      />
      <FilterSelect
        label="Commodity / Sector"
        value={filters.commodity}
        onChange={(v) => setFilter("commodity", v)}
        options={commodityOptions.map((c) => ({ value: c, label: c }))}
      />
      <FilterSelect
        label="Time Trajectory"
        value={filters.trajectory}
        onChange={(v) => setFilter("trajectory", v)}
        options={trajectories.map((t) => ({ value: t.id, label: t.label }))}
      />
      <FilterSelect
        label="Sourcing Risk Tier"
        value={filters.riskTier}
        onChange={(v) => setFilter("riskTier", v)}
        options={riskTiers.map((r) => ({ value: r.id, label: r.label }))}
      />
    </div>
  );
}
