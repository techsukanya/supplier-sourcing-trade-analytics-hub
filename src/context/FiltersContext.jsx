import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { defaultFilters, getCommodityOptions } from "../data/filterOptions";
import { exporters as seedExporters } from "../data/mockData";
import {
  filterExporters,
  paginate,
  buildVelocity,
  computeVelocityStats,
  getStatTiles,
  getSpendCategories,
  getTariffHeatmap,
  getTransitTimes,
  getTopologyView,
} from "../data/selectors";

const PAGE_SIZE = 6;

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, setFiltersState] = useState(defaultFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [exporters, setExporters] = useState(seedExporters);
  const [isSupplierFormOpen, setSupplierFormOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  // Changing the corridor re-scopes the commodity dropdown (cascading
  // filters). If the previously-selected commodity isn't valid for the new
  // corridor, fall back to "All Primary Commodities" for that corridor.
  const setFilter = useCallback((key, value) => {
    setFiltersState((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "corridor") {
        const validCommodities = getCommodityOptions(value);
        if (!validCommodities.includes(prev.commodity)) {
          next.commodity = validCommodities[0];
        }
      }
      return next;
    });
    setPage(1);
  }, []);

  const setSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const addSupplier = useCallback((supplier) => {
    setExporters((prev) => [supplier, ...prev]);
    setLastAdded(supplier.name);
    setPage(1);
  }, []);

  const filteredExporters = useMemo(
    () => filterExporters(exporters, filters, searchTerm),
    [exporters, filters, searchTerm]
  );

  const pagination = useMemo(
    () => paginate(filteredExporters, page, PAGE_SIZE),
    [filteredExporters, page]
  );

  const velocity = useMemo(() => buildVelocity(filters), [filters.corridor, filters.commodity, filters.trajectory]);
  const velocitySlice = velocity.slice;
  const velocityTarget = velocity.target;
  const velocityStats = useMemo(
    () => computeVelocityStats(velocitySlice, filteredExporters),
    [velocitySlice, filteredExporters]
  );
  const statTiles = useMemo(() => getStatTiles(filters), [filters]);
  const spendCategories = useMemo(() => getSpendCategories(filters), [filters]);
  const tariffHeatmap = useMemo(() => getTariffHeatmap(filters), [filters.corridor, filters.commodity]);
  const transitTimes = useMemo(() => getTransitTimes(filters), [filters.corridor]);
  const topologyView = useMemo(() => getTopologyView(filters, filteredExporters), [filters, filteredExporters]);

  const value = {
    filters,
    setFilter,
    searchTerm,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    exporters,
    filteredExporters,
    pagination,
    addSupplier,
    lastAdded,
    velocitySlice,
    velocityTarget,
    velocityStats,
    statTiles,
    spendCategories,
    tariffHeatmap,
    transitTimes,
    topologyView,
    isSupplierFormOpen,
    openSupplierForm: () => setSupplierFormOpen(true),
    closeSupplierForm: () => setSupplierFormOpen(false),
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within a FiltersProvider");
  return ctx;
}
