import React from "react";
import { Boxes, Search, Bell, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { useLiveFeed } from "../services/tradeDataService";

export default function TopNav() {
  const { tickers, isLive, toggleLive } = useLiveFeed();
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-surface">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-series-1 text-white">
            <Boxes size={16} />
          </span>
          <span className="text-[15px] font-semibold text-ink-primary">DealBridge</span>
          <span className="hidden items-center gap-1 rounded-md bg-plane px-2 py-0.5 text-xs font-medium text-ink-secondary sm:flex">
            Intelligence Hub
            <span className="rounded bg-series-1/10 px-1 text-[10px] font-semibold text-series-1">v4.8</span>
          </span>
        </div>

        <div className="relative hidden max-w-xs flex-1 md:block">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            placeholder="Search"
            readOnly
            className="w-full rounded-md border border-hairline bg-plane py-1.5 pl-8 pr-10 text-xs text-ink-secondary outline-none"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-muted">
            ⌘K
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-4 lg:flex">
            {tickers.map((t) => (
              <div key={t.pair} className="flex items-center gap-1.5 text-xs">
                <span className="text-ink-muted">{t.pair}</span>
                <span className="tabular font-semibold text-ink-primary">{t.value}</span>
                <span
                  className={`flex items-center tabular font-medium ${
                    t.up ? "text-status-good" : "text-status-critical"
                  }`}
                >
                  {t.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {t.delta}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={toggleLive}
            title={isLive ? "Live feed active — click to pause" : "Live feed paused — click to resume"}
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:flex ${
              isLive ? "bg-status-good/10 text-status-good" : "bg-plane text-ink-muted"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-status-good animate-pulse" : "bg-ink-muted"}`} />
            {isLive ? "Live Sync" : "Sync Paused"}
          </button>

          <button className="relative rounded-md p-1.5 text-ink-secondary hover:bg-plane" aria-label="Notifications">
            <Bell size={16} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-series-2" />
          </button>

          <div className="flex items-center gap-2 border-l border-hairline pl-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-series-7 text-xs font-semibold text-white">
              MS
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-medium text-ink-primary">Marcus Sterling</p>
              <p className="text-[11px] text-ink-muted">Sr. Procurement Dir.</p>
            </div>
            <ChevronDown size={14} className="hidden text-ink-muted sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
