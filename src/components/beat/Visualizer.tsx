"use client";
import React, { useRef, useEffect } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

type VizMode = "waveform" | "bars" | "circle" | "spectrum";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  mode: VizMode;
  onSetMode: (mode: VizMode) => void;
  isPlaying: boolean;
}

function getThemeColors() {
  const dark = document.documentElement.classList.contains("dark");
  return {
    bg:       dark ? "#09090b" : "#f9fafb",
    grid:     dark ? "#27272a" : "#e5e7eb",
  };
}

function setupDpiCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { ctx, W: rect.width, H: rect.height };
}

const MODE_LABELS: Record<VizMode, string> = {
  waveform: "Wave",
  bars:     "Bars",
  circle:   "Circle",
  spectrum: "Spectrum",
};

const MODE_TIPS: Record<VizMode, string> = {
  waveform: "Waveform — time-domain oscilloscope view",
  bars:     "Bars — FFT frequency spectrum",
  circle:   "Circle — polar oscilloscope",
  spectrum: "Spectrum — Bass / Mid / High frequency bands",
};

export function Visualizer({ analyser, mode, onSetMode, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);

  // Idle / stopped draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isPlaying) return;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const { ctx, W, H } = setupDpiCanvas(canvas);
    const { bg, grid } = getThemeColors();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [isPlaying, mode]);

  // Active draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !isPlaying) return;

    analyser.fftSize = mode === "circle" ? 2048 : 1024;
    const bufferLen = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLen);

    let { ctx, W, H } = setupDpiCanvas(canvas);

    // Re-setup on resize
    const ro = new ResizeObserver(() => {
      ({ ctx, W, H } = setupDpiCanvas(canvas));
    });
    ro.observe(canvas);

    function drawWaveform() {
      analyser!.getByteTimeDomainData(dataArray);
      const { bg, grid } = getThemeColors();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Centre line
      ctx.strokeStyle = grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // Build path once via Path2D
      const path = new Path2D();
      const sw = W / bufferLen;
      let x = 0;
      for (let i = 0; i < bufferLen; i++) {
        const y = (dataArray[i] / 128.0) * (H / 2);
        if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
        x += sw;
      }
      path.lineTo(W, H / 2);

      // Glow pass
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   "#818cf8");
      grad.addColorStop(0.5, "#6366f1");
      grad.addColorStop(1,   "#a855f7");

      ctx.save();
      ctx.filter = "blur(5px)";
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 5;
      ctx.stroke(path);
      ctx.restore();

      // Sharp pass
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke(path);
    }

    function drawBars() {
      analyser!.getByteFrequencyData(dataArray);
      const { bg } = getThemeColors();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const count = Math.min(bufferLen, 80);
      const gap   = 2;
      const barW  = (W - gap * (count - 1)) / count;

      for (let i = 0; i < count; i++) {
        const norm   = dataArray[i] / 255;
        const barH   = norm * H * 0.92;
        const hue    = 230 + (i / count) * 70;
        const lum    = 40 + norm * 22;
        const x      = i * (barW + gap);

        // Bar gradient
        const g = ctx.createLinearGradient(0, H, 0, H - barH);
        g.addColorStop(0, `hsla(${hue}, 80%, ${lum}%, 0.7)`);
        g.addColorStop(1, `hsla(${hue}, 90%, ${lum + 15}%, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(x, H - barH, barW, barH);
      }
    }

    function drawCircle() {
      analyser!.getByteTimeDomainData(dataArray);
      const { bg, grid } = getThemeColors();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const r  = Math.min(W, H) * 0.3;

      // Base circle
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Waveform path around circle
      const path = new Path2D();
      for (let i = 0; i < bufferLen; i++) {
        const amp   = (dataArray[i] / 128.0 - 1) * r * 0.6;
        const angle = (i / bufferLen) * Math.PI * 2 - Math.PI / 2;
        const pr    = r + amp;
        const x     = cx + pr * Math.cos(angle);
        const y     = cy + pr * Math.sin(angle);
        if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
      }
      path.closePath();

      const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      grad.addColorStop(0, "#818cf8");
      grad.addColorStop(0.5, "#6366f1");
      grad.addColorStop(1, "#a855f7");

      // Glow
      ctx.save();
      ctx.filter = "blur(6px)";
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 4;
      ctx.stroke(path);
      ctx.restore();

      // Sharp
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke(path);
    }

    function drawSpectrum() {
      analyser!.getByteFrequencyData(dataArray);
      const { bg } = getThemeColors();
      const dark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const sampleRate = analyser!.context.sampleRate;
      const binHz = sampleRate / analyser!.fftSize;
      const labelH = 18;
      const drawH = H - labelH;

      const bands = [
        { label: "BASS",  maxHz: 300,   color0: "#f43f5e", color1: "#fb7185" },
        { label: "MID",   maxHz: 3000,  color0: "#f97316", color1: "#fdba74" },
        { label: "HIGH",  maxHz: 16000, color0: "#3b82f6", color1: "#818cf8" },
      ];

      // How many bins cover 0–16 kHz
      const maxBin = Math.min(bufferLen, Math.ceil(16000 / binHz));
      const gap  = 1;
      const barW = Math.max(2, (W - gap * (maxBin - 1)) / maxBin);

      for (let i = 0; i < maxBin; i++) {
        const freqHz = i * binHz;
        const band = freqHz < 300 ? bands[0] : freqHz < 3000 ? bands[1] : bands[2];
        const norm = dataArray[i] / 255;
        const barH = norm * drawH * 0.95;
        const x = i * (barW + gap);
        const g = ctx.createLinearGradient(0, drawH, 0, drawH - barH);
        g.addColorStop(0, band.color0 + "77");
        g.addColorStop(1, band.color1);
        ctx.fillStyle = g;
        ctx.fillRect(x, drawH - barH, barW, Math.max(barH, 1));
      }

      // Band dividers + labels
      ctx.font = "bold 9px monospace";
      ctx.textBaseline = "bottom";
      for (let b = 0; b < bands.length; b++) {
        const startHz = b === 0 ? 0 : bands[b - 1].maxHz;
        const endHz   = bands[b].maxHz;
        const startX  = Math.floor(startHz / binHz) * (barW + gap);
        const endX    = Math.min(Math.floor(endHz / binHz) * (barW + gap), W);
        const midX    = (startX + endX) / 2;

        ctx.fillStyle = dark ? "#71717a" : "#6b7280";
        ctx.textAlign = "center";
        ctx.fillText(bands[b].label, midX, H);

        if (b > 0) {
          ctx.strokeStyle = dark ? "#3f3f46" : "#d1d5db";
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(startX, 0);
          ctx.lineTo(startX, drawH);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    function frame() {
      rafRef.current = requestAnimationFrame(frame);
      if      (mode === "waveform") drawWaveform();
      else if (mode === "bars")     drawBars();
      else if (mode === "circle")   drawCircle();
      else                          drawSpectrum();
    }

    frame();
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, mode, isPlaying]);

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: "120px" }}
          aria-label="Audio visualizer"
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-ink-ghost tracking-widest uppercase select-none">
              press play
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-rim">
        <span className="text-xs text-ink-dim">{MODE_LABELS[mode]}</span>
        <div className="flex gap-0.5 rounded-lg bg-well border border-rim p-0.5">
          {(["waveform", "bars", "circle", "spectrum"] as VizMode[]).map((m) => (
            <Tooltip key={m} content={MODE_TIPS[m]}>
              <button
                type="button"
                onClick={() => onSetMode(m)}
                aria-pressed={mode === m}
                className={`rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  mode === m
                    ? "bg-indigo-600 text-white"
                    : "text-ink-dim hover:text-indigo-400"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
