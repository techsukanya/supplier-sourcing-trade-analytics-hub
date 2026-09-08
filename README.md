# DealBridge — Supplier Sourcing & Trade Analytics Hub

A React recreation of the "Supplier Sourcing & Trade Analytics Hub" dashboard: top nav with live
FX tickers, KPI stat tiles, a trade-flow map, a buyer/supplier topology mesh, a shipment-velocity
trend chart, a supplier performance quadrant, a sourcing-spend donut, tariff/FTA arbitrage bars,
a searchable/paginated top-exporters table, and bottom insight cards.

The filter taxonomy (corridors, commodities, trailing-window options) is modeled loosely on how
India's **Trade Analytics Portal** (TIA — Dept. of Commerce, trade-analytics.commerce.gov.in)
structures its own country/commodity/time filters — see "Wiring in real trade data" below for how
to point this at an actual feed.

## Stack

- **React 18** + **Vite** — app shell / dev server / build
- **Tailwind CSS** — styling, using a small custom palette (`tailwind.config.js`)
- **Recharts** — the area/line, scatter/bubble, and donut charts
- **lucide-react** — icon set
- **xlsx** (SheetJS) — the "Export Intelligence Dossier" multi-sheet Excel export
- No dependency for CSV export — `src/utils/csv.js` is a ~20-line Blob-based downloader

The trade-flow map and the topology mesh are drawn as lightweight custom SVG (no geo/graph
dependency, so the project stays small). Swap `TradeFlowCard.jsx` for
[`react-simple-maps`](https://www.react-simple-maps.io/) + a topojson world atlas if you need a
real geographic projection, or swap `TopologyMeshCard.jsx` for a graph library (e.g. `react-flow`,
`react-force-graph`) if the mesh needs to be interactive/force-directed.

## Getting started

```bash
npm install
npm run dev      # starts Vite on http://localhost:5173
npm run build     # production build to /dist
npm run preview   # preview the production build
```

## What's interactive

- **Dynamic, cascading dropdowns** — `FilterBar.jsx`. Changing **Origin Corridor** re-scopes the
  **Commodity/Sector** options to whatever that corridor actually sources (see
  `data/filterOptions.js#commoditiesByCorridor`); **Time Trajectory** and **Sourcing Risk Tier**
  filter independently. Every change re-derives — not just re-labels — every visualization on the
  page, all flowing through `data/selectors.js`:
  - **KPI tiles** — corridor/commodity-specific numbers (`analyticsModel.js#deriveMetrics`).
  - **Global Trade Flow card** — all 3 tabs redraw: **Active Corridors** dims routes/ports outside
    the selected corridor, **Tariff Heatmap** narrows its corridor×commodity grid and recolors
    every cell, **Transit Times** re-sorts/highlights its bar chart.
  - **Buyer-Supplier Topology Mesh** — the 3 "Tier-1 Exporter" nodes, the subtier labels, and the
    Network Density / Critical Node Risk stats are all rebuilt from the filtered supplier list.
  - **Monthly Shipment Velocity** — the entire 24-month curve (and its target line) is
    regenerated per corridor+commodity, not just re-sliced by trajectory
    (`analyticsModel.js#generateVelocitySeries`).
  - **Supplier Performance Matrix** — bubbles are the filtered suppliers themselves.
  - **Sourcing Spend donut** — category values *and* the total figure rescale per corridor
    (`analyticsModel.js#corridorSpendMultiplier`), not just an opacity highlight.
  - **FTA/Tariff Arbitrage** and the **exporters table** dim/filter to the selected corridor too.
- **Export Intelligence Dossier** (button, top right) — `utils/excelExport.js` builds a 6-sheet
  `.xlsx` (Filters Applied, KPI Summary, Suppliers, Shipment Velocity, Spend Categories, Tariff
  Arbitrage) from whatever is currently filtered on screen.
- **Source New Supplier** (button, top right) — `components/SupplierFormModal.jsx` opens a form
  whose fields mirror every column the exporters table/KPI tiles actually use (corridor →
  commodity cascades here too). Submitting prepends the new row to the in-memory supplier list —
  it's immediately searchable, filterable, exportable, and shows up in the performance matrix.
- **Top Exporters table** — live **search** (name/D-U-N-S/sector/role/location),
  **CSV export** of the full filtered result set (not just the visible page), and real
  **pagination** (6 rows/page over a 24-supplier sample spanning 9 corridors) with
  Previous/Next + numbered pages.
- **Simulated real-time feed** — `services/tradeDataService.js#useLiveFeed()` ticks the FX
  tickers and the "Ledger Synced" clock every 5s with a small random walk; the "Live Sync" pill in
  the top nav is clickable to pause/resume it.

## Project structure

```
src/
  data/
    mockData.js         # seed content: tickers, exporters, velocity series, spend, tariffs...
    filterOptions.js     # dropdown option lists + corridor→commodity cascade
    analyticsModel.js     # corridor/commodity → KPI-tile numbers (deriveMetrics)
    selectors.js            # filters+search+exporters -> exactly what each component renders
  context/
    FiltersContext.jsx        # lifted filter/search/page/exporters state + derived selectors
  services/
    tradeDataService.js         # simulated live ticker feed + fetchTradeSnapshot() API stub
  utils/
    csv.js                        # CSV builder + download trigger
    excelExport.js                 # SheetJS multi-sheet workbook builder
    prng.js                         # tiny seeded RNG (deterministic per-corridor chart variation)
  components/
    TopNav.jsx               # logo, search, live FX tickers, live-sync toggle, profile
    PageHeader.jsx            # breadcrumb, title, export-dossier / source-supplier actions
    FilterBar.jsx               # the 4 cascading dropdowns
    StatsRow.jsx                  # 5 KPI stat tiles (derived from filters)
    TradeFlowCard.jsx               # map/heatmap/transit-time tab switcher + corridor chips
    TariffHeatmapView.jsx             # "Tariff Heatmap" tab — corridor × commodity duty grid
    TransitTimesView.jsx               # "Transit Times" tab — Recharts bar chart
    TopologyMeshCard.jsx                 # mesh rebuilt from the filtered supplier list
    VulnerabilityAlert.jsx                 # single-source concentration warning banner
    ShipmentVelocityChart.jsx                # Recharts area chart, regenerated per filter
    PerformanceMatrixChart.jsx                 # Recharts scatter/bubble, derived from suppliers
    SpendDonutChart.jsx                          # Recharts donut, values rescale per corridor
    TariffArbitrageCard.jsx                        # FTA/tariff savings bars, dim by corridor
    ExportersTable.jsx                               # search + CSV export + pagination
    SupplierFormModal.jsx                              # "Source New Supplier" form
    InsightCards.jsx                                     # 3 bottom AI-insight cards
  App.jsx                                                 # FiltersProvider + page composition
  main.jsx                                                  # React root
```

## Wiring in real trade data

Everything currently runs off the local mock model (`data/mockData.js` + `data/analyticsModel.js`),
read through `data/selectors.js`. That indirection is the integration seam: to go live, you don't
touch the components — you replace what feeds `FiltersContext`.

**Why not call India's Trade Analytics Portal directly from the browser?** TIA
(trade-analytics.commerce.gov.in) is a server-rendered analytics UI, not a public CORS-enabled
JSON API — there's no endpoint a browser's `fetch()` can call cross-origin. To use real data you
need a small backend that either:

1. pulls TIA's "Data Extraction" exports on a schedule into your own database,
2. calls a licensed trade-data provider that mirrors the same HS-code-level export/import series
   (DGCIS, ITC Trade Map, UN Comtrade), or
3. proxies an internal ERP/customs feed, if this sits inside an org that already has one.

Point that backend's base URL at `VITE_TRADE_API_BASE_URL` (a `.env` file) and implement the
matching route — `services/tradeDataService.js#fetchTradeSnapshot(filters)` is already written as
a documented stub with the exact shape `selectors.js` expects back. Once it returns real data,
call it from `FiltersContext` (e.g. in a `useEffect` keyed on `filters`) instead of running
`deriveMetrics()`/`filterExporters()` against the local mock arrays.

## Notes on color & accessibility

The palette in `tailwind.config.js` (the `series.*` and `status.*` colors) is a validated,
colorblind-safe categorical set — keep the hue **order** fixed if you add series rather than
re-assigning colors by rank, and reserve the `status.*` colors for state (good/warning/serious/
critical) rather than reusing them as generic series colors.
