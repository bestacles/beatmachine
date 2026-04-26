"use client";
import React from "react";
import { type InstrumentSection, type SectionType, SECTION_EMOJI } from "@/lib/pattern";
import { Tooltip } from "@/components/ui/Tooltip";

interface InstrumentTabsProps {
  sections: InstrumentSection[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onAddSection: () => void;
}

const TYPE_LABEL: Record<SectionType, string> = {
  drums:  "Drums",
  piano:  "Piano",
  bass:   "Bass",
  synth:  "Synth",
  custom: "Custom",
};

export function InstrumentTabs({
  sections,
  activeTabId,
  onTabChange,
  onAddSection,
}: InstrumentTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-rim px-2 pt-2">
      {/* One tab per section */}
      {sections.map((sec) => {
        const isActive = activeTabId === sec.id;
        return (
          <Tooltip key={sec.id} content={`${TYPE_LABEL[sec.type]} — ${sec.tracks.length} track${sec.tracks.length !== 1 ? "s" : ""}`}>
            <button
              type="button"
              onClick={() => onTabChange(sec.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-xs font-semibold transition-colors border border-b-0 ${
                isActive
                  ? "bg-panel border-rim text-ink"
                  : "bg-transparent border-transparent text-ink-dim hover:text-ink hover:bg-well"
              }`}
              style={isActive ? { borderTopColor: sec.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sec.color }}
                aria-hidden="true"
              />
              {sec.name}
              {sec.mute && (
                <span className="ml-0.5 text-[9px] text-red-400 font-bold" aria-label="muted">M</span>
              )}
            </button>
          </Tooltip>
        );
      })}

      {/* Add section */}
      <Tooltip content="Add a new instrument section">
        <button
          type="button"
          onClick={onAddSection}
          className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-ghost hover:text-indigo-400 hover:bg-well transition-colors"
          aria-label="Add section"
        >
          <span aria-hidden="true" className="text-sm leading-none">+</span>
        </button>
      </Tooltip>

      {/* Bottom border fill — makes active tab feel connected */}
      <div className="flex-1 border-b border-rim mb-0 h-full" aria-hidden="true" />
    </div>
  );
}
