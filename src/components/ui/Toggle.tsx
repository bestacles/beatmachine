import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  pressed: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
  variant?: "mute" | "solo" | "default";
}

export function Toggle({ pressed, onToggle, label, className, variant = "default" }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label === "M" ? "Mute track" : label === "S" ? "Solo track" : label}
      onClick={onToggle}
      className={cn(
        "rounded px-1.5 py-0.5 text-xs font-bold tracking-wide transition-colors",
        !pressed && "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 border border-zinc-700",
        pressed && variant === "mute" && "bg-red-600 text-white border border-red-500",
        pressed && variant === "solo" && "bg-yellow-400 text-zinc-900 border border-yellow-300",
        pressed && variant === "default" && "bg-indigo-600 text-white border border-indigo-500",
        className
      )}
    >
      {label}
    </button>
  );
}
