"use client";
import React from "react";

interface TransportProps {
  isPlaying: boolean;
  bpm: number;
  masterVol: number;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
  onMasterVolChange: (vol: number) => void;
}

export function Transport({ isPlaying, bpm, masterVol, onTogglePlay, onBpmChange, onMasterVolChange }: TransportProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 text-white ${
          isPlaying
            ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500"
            : "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-500"
        }`}
      >
        <span className="text-base leading-none" aria-hidden="true">{isPlaying ? "⏸" : "▶"}</span>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div className="hidden sm:block h-8 w-px bg-zinc-700" aria-hidden="true" />

      {/* BPM */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">BPM</span>
        <input
          id="bpm-number"
          type="number"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onBpmChange(v); }}
          className="w-14 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm font-mono text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="BPM value"
        />
        <input
          type="range"
          min={60}
          max={200}
          step={1}
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          className="w-28 accent-indigo-500 cursor-pointer"
          aria-label="BPM slider"
        />
      </div>

      <div className="hidden sm:block h-8 w-px bg-zinc-700" aria-hidden="true" />

      {/* Master Volume */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Vol</span>
        <input
          type="range"
          id="master-vol"
          min={0}
          max={1}
          step={0.01}
          value={masterVol}
          onChange={(e) => onMasterVolChange(parseFloat(e.target.value))}
          className="w-28 accent-indigo-500 cursor-pointer"
          aria-label="Master volume"
        />
        <span className="text-xs font-mono text-zinc-500 w-8 shrink-0">{Math.round(masterVol * 100)}%</span>
      </div>
    </div>
  );
}
