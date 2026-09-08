// ---------------------------------------------------------------------------
// Trade data service layer.
//
// Two things live here:
//
// 1. `useLiveFeed()` — a small simulated "real-time" feed (FX tickers +
//    ledger-sync timestamp) driven by a client-side interval, purely so the
//    dashboard demonstrably updates on its own the way a live desk would.
//
// 2. `fetchTradeSnapshot(filters)` — a documented STUB for the real
//    integration. India's Trade Analytics Portal (TIA, Dept. of Commerce —
//    trade-analytics.commerce.gov.in) is a server-rendered analytics UI, not
//    a public CORS-enabled JSON API: there's no endpoint a browser can call
//    directly with fetch(). To wire real trade data you need a small backend
//    (Node/Express, a serverless function, etc.) that either:
//      a) scrapes/queries TIA's "Data Extraction" exports on a schedule and
//         caches them in your own database, or
//      b) calls a licensed data provider (DGCIS, ITC Trade Map, Comtrade)
//         that mirrors the same HS-code-level export/import series, or
//      c) proxies an internal ERP/customs feed if this is deployed inside an
//         enterprise that already has one.
//    Point `API_BASE_URL` below at that backend and this function becomes a
//    straightforward fetch — every component already reads through
//    data/selectors.js, so nothing else in the app needs to change.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from "react";
import { tickers as seedTickers } from "../data/mockData";

const API_BASE_URL = import.meta.env?.VITE_TRADE_API_BASE_URL || null;

/**
 * Real integration point. Swap the mock resolve() for a fetch once
 * API_BASE_URL is set — the shape it should resolve to is documented below
 * so selectors.js / analyticsModel.js can be pointed at it unchanged.
 *
 * @param {{corridor: string, commodity: string, trajectory: string, riskTier: string}} filters
 * @returns {Promise<{statTiles: object[], exporters: object[], velocity: object[]}>}
 */
export async function fetchTradeSnapshot(filters) {
  if (!API_BASE_URL) {
    // No backend configured — the app runs entirely off the local mock
    // model in data/analyticsModel.js + data/mockData.js.
    return null;
  }

  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE_URL}/trade-snapshot?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Trade snapshot request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function jitterValue(value, magnitudePct) {
  const change = value * (magnitudePct / 100) * (Math.random() * 2 - 1);
  return value + change;
}

function formatTicker(pair, prevValue, nextValue) {
  const decimals = prevValue < 10 ? 2 : 2;
  const deltaPct = ((nextValue - prevValue) / prevValue) * 100;
  return {
    pair,
    value: nextValue.toFixed(decimals),
    delta: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%`,
    up: deltaPct >= 0,
  };
}

/**
 * Simulated real-time feed for the FX ticker strip + "Ledger Synced" clock
 * in TopNav / PageHeader. Ticks every `intervalMs` (default 5s) with a small
 * random walk on each currency pair. Replace the interval body with a
 * WebSocket/SSE subscription to go fully live.
 */
export function useLiveFeed(intervalMs = 5000) {
  const [tickers, setTickers] = useState(seedTickers);
  const [lastSync, setLastSync] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const valuesRef = useRef(seedTickers.map((t) => parseFloat(t.value)));

  useEffect(() => {
    if (!isLive) return undefined;
    const id = setInterval(() => {
      setTickers((prev) =>
        prev.map((t, i) => {
          const prevVal = valuesRef.current[i];
          const nextVal = jitterValue(prevVal, 0.08);
          valuesRef.current[i] = nextVal;
          return formatTicker(t.pair, prevVal, nextVal);
        })
      );
      setLastSync(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, isLive]);

  const toggleLive = useCallback(() => setIsLive((v) => !v), []);

  const ledgerSyncedLabel = `Today ${lastSync.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} UTC`;

  return { tickers, lastSync, ledgerSyncedLabel, isLive, toggleLive };
}
