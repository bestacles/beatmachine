"use client";
import React from "react";
import { type TrackState } from "@/lib/pattern";
import { SampleSelect } from "./SampleSelect";
import { StepGrid } from "./StepGrid";
import { Toggle } from "@/components/ui/Toggle";

interface TrackRowProps {
  track: TrackState;
  trackIndex: number;
  currentStep: number | null;
  isPlaying: boolean;
  onToggleStep: (step: number) => void;
  onChangeSample: (sampleId: string) => void;
  onChangeVol: (vol: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
}

export function TrackRow({
  track,
  trackIndex,
  currentStep,
  isPlaying,
  onToggleStep,
  onChangeSample,
  onChangeVol,
  onToggleMute,
  onToggleSolo,
}: TrackRowProps) {
  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-opacity ${track.mute ? "opacity-40" : ""}`}>
      {/* Track controls */}
      <div className="flex items-center gap-2 w-52 min-w-52 shrink-0">
        <span className="text-xs font-mono text-ink-ghost w-4 text-right shrink-0">{trackIndex + 1}</span>
        <SampleSelect value={track.sampleId} trackIndex={trackIndex} onChange={onChangeSample} />
        <Toggle pressed={track.mute} onToggle={onToggleMute} label="M" variant="mute" />
        <Toggle pressed={track.solo} onToggle={onToggleSolo} label="S" variant="solo" />
      </div>

      {/* Step grid */}
      <StepGrid
        steps={track.steps}
        currentStep={isPlaying ? currentStep : null}
        trackIndex={trackIndex}
        onToggle={onToggleStep}
      />

      {/* Per-track volume */}
      <div className="w-16 shrink-0">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={track.vol}
          onChange={(e) => onChangeVol(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
          aria-label={`Track ${trackIndex + 1} volume`}
        />
      </div>
    </div>
  );
}
