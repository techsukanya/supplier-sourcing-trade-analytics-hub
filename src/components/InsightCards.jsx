import React from "react";
import { TriangleAlert, BadgeCheck, GitBranch, ArrowRight } from "lucide-react";
import { insightCards } from "../data/mockData";

const toneMap = {
  critical: { icon: TriangleAlert, iconClass: "text-status-critical", kickerClass: "text-status-critical" },
  good: { icon: BadgeCheck, iconClass: "text-status-good", kickerClass: "text-status-good" },
  info: { icon: GitBranch, iconClass: "text-series-1", kickerClass: "text-series-1" },
};

export default function InsightCards() {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
      {insightCards.map((c) => {
        const tone = toneMap[c.tone];
        const Icon = tone.icon;
        return (
          <div key={c.title} className="rounded-lg border border-hairline bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.kickerClass}`}>
                <Icon size={13} />
                {c.kicker}
              </span>
              <span className="text-[10px] font-medium text-ink-muted">{c.kickerRight}</span>
            </div>
            <h4 className="mt-2 text-sm font-semibold text-ink-primary">{c.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{c.body}</p>
            <a href="#" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-series-1 hover:underline">
              {c.cta} <ArrowRight size={12} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
