"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Transport } from "@/components/beat/Transport";
import { TrackRow } from "@/components/beat/TrackRow";
import { Visualizer } from "@/components/beat/Visualizer";
import { SessionMenu } from "@/components/beat/SessionMenu";
import { RecordPanel } from "@/components/beat/RecordPanel";
import { getEngine } from "@/lib/audio/engine";
import { Scheduler } from "@/lib/audio/scheduler";
import { createDefaultPattern, decodeShareUrl, type Pattern, type TrackState } from "@/lib/pattern";
import { clamp } from "@/lib/utils";

export default function Home() {
  const [pattern, setPattern] = useState<Pattern>(createDefaultPattern());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [vizMode, setVizMode] = useState<"waveform" | "bars" | "circle">("waveform");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [initialized, setInitialized] = useState(false);

  const schedulerRef = useRef<Scheduler | null>(null);
  const patternRef = useRef<Pattern>(pattern);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (s) {
      const loaded = decodeShareUrl(s);
      setPattern(loaded);
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleTogglePlay();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, initialized]);

  async function initEngine() {
    if (initialized) return;
    const engine = getEngine();
    await engine.init();
    engine.setMasterVolume(patternRef.current.masterVol);
    patternRef.current.tracks.forEach((t) => {
      engine.setTrackVolume(t.id, t.vol);
    });
    setAnalyser(engine.getAnalyser());
    setInitialized(true);
  }

  const onStep = useCallback((step: number, time: number) => {
    setCurrentStep(step);
    const p = patternRef.current;
    const engine = getEngine();
    const hasSolo = p.tracks.some((t) => t.solo);
    p.tracks.forEach((track) => {
      if (track.mute) return;
      if (hasSolo && !track.solo) return;
      if (track.steps[step]) {
        engine.playBuffer(track.sampleId, track.id, time);
      }
    });
  }, []);

  async function handleTogglePlay() {
    await initEngine();
    const engine = getEngine();
    await engine.resume();

    if (isPlaying) {
      schedulerRef.current?.stop();
      setIsPlaying(false);
      setCurrentStep(null);
    } else {
      const ctx = engine.getAudioContext();
      if (!ctx) return;
      const scheduler = new Scheduler({
        audioContext: ctx,
        getBpm: () => patternRef.current.bpm,
        getStepCount: () => patternRef.current.stepCount,
        onStep,
      });
      schedulerRef.current = scheduler;
      scheduler.start();
      setIsPlaying(true);
    }
  }

  function updateTrack(index: number, updater: (t: TrackState) => TrackState) {
    setPattern((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t, i) => (i === index ? updater(t) : t)),
    }));
  }

  function handleBpmChange(bpm: number) {
    setPattern((prev) => ({ ...prev, bpm: clamp(bpm, 60, 200) }));
  }

  function handleMasterVolChange(vol: number) {
    const clamped = clamp(vol, 0, 1);
    setPattern((prev) => ({ ...prev, masterVol: clamped }));
    if (initialized) getEngine().setMasterVolume(clamped);
  }

  function handleToggleStep(trackIndex: number, step: number) {
    updateTrack(trackIndex, (t) => ({
      ...t,
      steps: t.steps.map((v, i) => (i === step ? !v : v)),
    }));
  }

  function handleChangeSample(trackIndex: number, sampleId: string) {
    updateTrack(trackIndex, (t) => ({ ...t, sampleId }));
  }

  function handleChangeVol(trackIndex: number, vol: number) {
    updateTrack(trackIndex, (t) => ({ ...t, vol }));
    if (initialized) getEngine().setTrackVolume(pattern.tracks[trackIndex].id, vol);
  }

  function handleToggleMute(trackIndex: number) {
    updateTrack(trackIndex, (t) => ({ ...t, mute: !t.mute }));
  }

  function handleToggleSolo(trackIndex: number) {
    updateTrack(trackIndex, (t) => ({ ...t, solo: !t.solo }));
  }

  function handleStepCountChange(count: 16 | 32) {
    setPattern((prev) => ({
      ...prev,
      stepCount: count,
      tracks: prev.tracks.map((t) => ({
        ...t,
        steps: count > t.steps.length
          ? [...t.steps, ...Array(count - t.steps.length).fill(false)]
          : t.steps.slice(0, count),
      })),
    }));
  }

  return (
    <Container className="py-6 space-y-4">

      {/* Transport */}
      <Card>
        <Transport
          isPlaying={isPlaying}
          bpm={pattern.bpm}
          masterVol={pattern.masterVol}
          stepCount={pattern.stepCount}
          onTogglePlay={handleTogglePlay}
          onBpmChange={handleBpmChange}
          onMasterVolChange={handleMasterVolChange}
          onStepCountChange={handleStepCountChange}
        />
      </Card>

      {/* Visualizer */}
      <Card className="p-0 overflow-hidden">
        <Visualizer
          analyser={analyser}
          mode={vizMode}
          onSetMode={setVizMode}
          isPlaying={isPlaying}
        />
      </Card>

      {/* Step sequencer */}
      <Card className="overflow-x-auto p-0">
        <div className="min-w-[700px]">
          {/* Step number header */}
          <div className="flex items-center gap-3 px-2 py-2 border-b border-rim">
            <div className="w-52 min-w-52 shrink-0" />
            <div className="flex gap-1">
              {Array.from({ length: pattern.stepCount }, (_, i) => (
                <React.Fragment key={i}>
                  {i > 0 && i % 4 === 0 && <div className="w-1.5 shrink-0" aria-hidden="true" />}
                  <div className={`w-8 min-w-8 shrink-0 text-center text-[10px] font-mono ${
                    i % 4 === 0 ? "text-ink-dim" : "text-ink-ghost"
                  }`}>
                    {i % 4 === 0 ? i + 1 : "·"}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="w-16 shrink-0" />
          </div>

          {/* Track rows */}
          {pattern.tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              trackIndex={i}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onToggleStep={(step) => handleToggleStep(i, step)}
              onChangeSample={(sampleId) => handleChangeSample(i, sampleId)}
              onChangeVol={(vol) => handleChangeVol(i, vol)}
              onToggleMute={() => handleToggleMute(i)}
              onToggleSolo={() => handleToggleSolo(i)}
            />
          ))}
        </div>
      </Card>

      {/* Record + Session side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <RecordPanel getMediaStream={() => getEngine().getMediaStream()} />
        </Card>
        <Card>
          <SessionMenu pattern={pattern} onLoad={setPattern} />
        </Card>
      </div>

      {!initialized && (
        <p className="text-center text-xs text-ink-dim pb-2">
          Press <kbd className="rounded bg-well border border-rim px-1.5 py-0.5 font-mono text-ink-dim">Space</kbd> or click Play to start the audio engine.
        </p>
      )}
    </Container>
  );
}
