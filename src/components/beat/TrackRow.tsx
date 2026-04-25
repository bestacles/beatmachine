"use client";
import React from "react";
import { type TrackState } from "@/lib/pattern";
import { SampleSelect } from "./SampleSelect";
import { StepGrid } from "./StepGrid";
import { Toggle } from "@/components/ui/Toggle";
import { Tooltip } from "@/components/ui/Tooltip";

interface TrackRowProps {
  track: TrackState;
  trackIndex: number;
  currentStep: number | null;
  isPlaying: boolean;
  trackColor: string;
  onToggleStep: (step: number) => void;
  onChangeSample: (sampleId: string) => void;
  onChangeVol: (vol: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onClear: () => void;
  onRandomize: () => void;
}

export function TrackRow({
  track,
  trackIndex,
  currentStep,
  isPlaying,
  trackColor,
  onToggleStep,
  onChangeSample,
  onChangeVol,
  onToggleMute,
  onToggleSolo,
  onClear,
  onRandomize,
}: TrackRowProps) {
  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-opacity ${track.mute ? "opacity-40" : ""}`}>
      {/* Track controls */}
      <div className="flex items-center gap-2 w-52 min-w-52 shrink-0">
        {/* Color strip */}
        <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: trackColor }} />
        <span className="text-xs font-mono text-ink-ghost w-4 text-right shrink-0">{trackIndex + 1}</span>
        <SampleSelect value={track.sampleId} trackIndex={trackIndex} onChange={onChangeSample} />
        <Toggle pressed={track.mute} onToggle={onToggleMute} label="M" variant="mute" tooltip={track.mute ? "Unmute this track" : "Mute this track"} />
        <Toggle pressed={track.solo} onToggle={onToggleSolo} label="S" variant="solo" tooltip={track.solo ? "Unsolo" : "Solo — mute all other tracks"} />
      </div>

      {/* Step grid */}
      <StepGrid
        steps={track.steps}
        currentStep={isPlaying ? currentStep : null}
        trackIndex={trackIndex}
        trackColor={trackColor}
        onToggle={onToggleStep}
      />

      {/* Per-track volume + quick actions */}
      <div className="flex items-center gap-1.5 w-24 shrink-0">
        <Tooltip content={`Track volume: ${Math.round(track.vol * 100)}%`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={track.vol}
            onChange={(e) => onChangeVol(parseFloat(e.target.value))}
            className="w-14 accent-indigo-500 cursor-pointer"
            aria-label={`Track ${trackIndex + 1} volume`}
          />
        </Tooltip>
        <Tooltip content="Randomize — fill steps randomly (~30% density)">
          <button
            type="button"
            onClick={onRandomize}
            className="h-6 w-6 flex items-center justify-center rounded text-ink-ghost hover:text-ink hover:bg-well text-sm transition-colors shrink-0"
          >
            ⚄
          </button>
        </Tooltip>
        <Tooltip content="Clear — erase all steps on this track">
          <button
            type="button"
            onClick={onClear}
            className="h-6 w-6 flex items-center justify-center rounded text-ink-ghost hover:text-ink hover:bg-well text-xs transition-colors shrink-0"
          >
            ✕
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
