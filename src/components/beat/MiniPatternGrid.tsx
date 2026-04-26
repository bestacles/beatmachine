"use client";
import React from "react";
import { type InstrumentSection } from "@/lib/pattern";
import { TRACK_COLORS } from "@/lib/utils";

interface MiniPatternGridProps {
  section: InstrumentSection;
  stepCount: number;
  currentStep: number | null;
  isPlaying: boolean;
}

/**
 * A compact read-only representation of all tracks in a section.
 * Used in the Mix overview tab.
 */
export function MiniPatternGrid({ section, stepCount, currentStep, isPlaying }: MiniPatternGridProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {section.tracks.map((track, ti) => {
        const color = track.color ?? TRACK_COLORS[ti % TRACK_COLORS.length];
        return (
          <div key={track.id} className="flex gap-px">
            {Array.from({ length: stepCount }, (_, si) => {
              const isOn   = track.steps[si] ?? false;
              const isNow  = isPlaying && currentStep === si;
              return (
                <div
                  key={si}
                  className={`h-2 flex-1 rounded-sm transition-colors duration-75 ${
                    isNow && isOn
                      ? "opacity-100 shadow-sm"
                      : isOn
                        ? "opacity-80"
                        : "opacity-10 bg-rim"
                  }`}
                  style={isOn ? { backgroundColor: color } : undefined}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
