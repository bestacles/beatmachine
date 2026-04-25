"use client";
import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";

const STEP_TIPS: Record<number, string> = {
  8:  "8 steps — half-time / sparse feel",
  16: "16 steps — standard 1-bar pattern",
  32: "32 steps — 2-bar extended pattern",
  64: "64 steps — 4-bar phrase",
};

interface TransportProps {
  isPlaying: boolean;
  bpm: number;
  masterVol: number;
  stepCount: 8 | 16 | 32 | 64;
  swing: number;
  activeSlot: 0 | 1;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
  onMasterVolChange: (vol: number) => void;
  onStepCountChange: (count: 8 | 16 | 32 | 64) => void;
  onTapTempo: () => void;
  onSwingChange: (swing: number) => void;
  onSlotChange: (slot: 0 | 1) => void;
}

export function Transport({
  isPlaying, bpm, masterVol, stepCount, swing, activeSlot,
  onTogglePlay, onBpmChange, onMasterVolChange, onStepCountChange,
  onTapTempo, onSwingChange, onSlotChange,
}: TransportProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">

      {/* A / B slot selector */}
      <div className="flex items-center gap-2">
        <Tooltip content="Switch between two independent patterns (A / B)" position="bottom">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-dim cursor-default">Pat</span>
        </Tooltip>
        <div className="flex rounded-lg bg-well border border-rim p-0.5">
          {([0, 1] as const).map((s) => (
            <Tooltip key={s} content={s === 0 ? "Pattern A" : "Pattern B"} position="bottom">
              <button
                type="button"
                onClick={() => onSlotChange(s)}
                aria-pressed={activeSlot === s}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                  activeSlot === s ? "bg-indigo-600 text-white" : "text-ink-dim hover:text-ink"
                }`}
              >
                {s === 0 ? "A" : "B"}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Play / Pause */}
      <Tooltip content="Play / Pause  ·  Shortcut: Space" position="bottom">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas text-white ${
            isPlaying
              ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500"
              : "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-500"
          }`}
        >
          <span className="text-base leading-none" aria-hidden="true">{isPlaying ? "⏸" : "▶"}</span>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </Tooltip>

      <div className="hidden sm:block h-8 w-px bg-rim" aria-hidden="true" />

      {/* BPM */}
      <div className="flex items-center gap-3">
        <Tooltip content="Beats per minute (60–200)" position="bottom">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-dim cursor-default">BPM</span>
        </Tooltip>
        <Tooltip content="Type a BPM value" position="bottom">
          <input
            id="bpm-number"
            type="number"
            min={60}
            max={200}
            value={bpm}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onBpmChange(v); }}
            className="w-14 rounded-lg bg-well border border-rim px-2 py-1 text-sm font-mono text-ink text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="BPM value"
          />
        </Tooltip>
        <Tooltip content="Drag to adjust tempo" position="bottom">
          <input
            type="range"
            min={60}
            max={200}
            step={1}
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
            className="w-24 accent-indigo-500 cursor-pointer"
            aria-label="BPM slider"
          />
        </Tooltip>
        <Tooltip content="Tap Tempo — tap 3+ times to set BPM by feel" position="bottom">
          <button
            type="button"
            onClick={onTapTempo}
            className="rounded-lg bg-well border border-rim px-3 py-1 text-xs font-semibold text-ink-dim hover:text-ink hover:bg-rim transition-colors"
          >
            Tap
          </button>
        </Tooltip>
      </div>

      <div className="hidden sm:block h-8 w-px bg-rim" aria-hidden="true" />

      {/* Swing */}
      <div className="flex items-center gap-3">
        <Tooltip content="Shuffle feel · 0 = straight 16ths · 100 = triplet swing" position="bottom">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-dim cursor-default">Swing</span>
        </Tooltip>
        <Tooltip content={`Swing: ${swing}%`} position="bottom">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={swing}
            onChange={(e) => onSwingChange(parseInt(e.target.value, 10))}
            className="w-20 accent-indigo-500 cursor-pointer"
            aria-label="Swing amount"
          />
        </Tooltip>
        <span className="text-xs font-mono text-ink-dim w-6 shrink-0">{swing}</span>
      </div>

      <div className="hidden sm:block h-8 w-px bg-rim" aria-hidden="true" />

      {/* Master Volume */}
      <div className="flex items-center gap-3">
        <Tooltip content="Master output volume" position="bottom">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-dim cursor-default">Vol</span>
        </Tooltip>
        <Tooltip content={`Master volume: ${Math.round(masterVol * 100)}%`} position="bottom">
          <input
            type="range"
            id="master-vol"
            min={0}
            max={1}
            step={0.01}
            value={masterVol}
            onChange={(e) => onMasterVolChange(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
            aria-label="Master volume"
          />
        </Tooltip>
        <span className="text-xs font-mono text-ink-dim w-8 shrink-0">{Math.round(masterVol * 100)}%</span>
      </div>

      <div className="hidden sm:block h-8 w-px bg-rim" aria-hidden="true" />

      {/* Step count */}
      <div className="flex items-center gap-2">
        <Tooltip content="Number of steps in the pattern loop" position="bottom">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-dim cursor-default">Steps</span>
        </Tooltip>
        <div className="flex items-center rounded-lg bg-well border border-rim p-0.5">
          {([8, 16, 32, 64] as const).map((n) => (
            <Tooltip key={n} content={STEP_TIPS[n]} position="bottom">
              <button
                type="button"
                onClick={() => onStepCountChange(n)}
                aria-pressed={stepCount === n}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  stepCount === n
                    ? "bg-indigo-600 text-white"
                    : "text-ink-dim hover:text-ink"
                }`}
              >
                {n}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
