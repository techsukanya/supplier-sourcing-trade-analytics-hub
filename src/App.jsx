import React from "react";
import { FiltersProvider } from "./context/FiltersContext";
import TopNav from "./components/TopNav";
import PageHeader from "./components/PageHeader";
import FilterBar from "./components/FilterBar";
import StatsRow from "./components/StatsRow";
import TradeFlowCard from "./components/TradeFlowCard";
import TopologyMeshCard from "./components/TopologyMeshCard";
import VulnerabilityAlert from "./components/VulnerabilityAlert";
import ShipmentVelocityChart from "./components/ShipmentVelocityChart";
import PerformanceMatrixChart from "./components/PerformanceMatrixChart";
import SpendDonutChart from "./components/SpendDonutChart";
import TariffArbitrageCard from "./components/TariffArbitrageCard";
import ExportersTable from "./components/ExportersTable";
import InsightCards from "./components/InsightCards";
import SupplierFormModal from "./components/SupplierFormModal";

export default function App() {
  return (
    <FiltersProvider>
      <div className="min-h-screen bg-plane font-sans text-ink-primary">
        <TopNav />

        <main className="mx-auto max-w-[1400px] pb-10">
          <PageHeader />
          <FilterBar />
          <StatsRow />

          <div className="mt-3 grid grid-cols-1 gap-3 px-4 lg:grid-cols-2 lg:px-6">
            <TradeFlowCard />
            <TopologyMeshCard />
          </div>

          <div className="px-4 lg:px-6">
            <VulnerabilityAlert />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 px-4 lg:grid-cols-2 lg:px-6">
            <ShipmentVelocityChart />
            <PerformanceMatrixChart />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 px-4 lg:grid-cols-2 lg:px-6">
            <SpendDonutChart />
            <TariffArbitrageCard />
          </div>

          <div className="mt-3 px-4 lg:px-6">
            <ExportersTable />
          </div>

          <div className="px-4 lg:px-6">
            <InsightCards />
          </div>
        </main>

        <SupplierFormModal />
      </div>
    </FiltersProvider>
  );
}
