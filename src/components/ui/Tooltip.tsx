import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Text shown in the tooltip bubble. */
  content: string;
  children: React.ReactNode;
  /** Which side the bubble appears on relative to the trigger. Default: top */
  position?: "top" | "bottom";
  className?: string;
}

/**
 * Lightweight CSS-only tooltip wrapper.
 * Wraps any element and shows a styled bubble on hover via Tailwind `group-hover`.
 *
 * Usage:
 *   <Tooltip content="Some help text">
 *     <button>…</button>
 *   </Tooltip>
 */
export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  return (
    <div className={cn("relative group inline-flex items-center", className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          // Base styles
          "absolute z-50 px-2 py-1 text-[11px] font-medium leading-snug",
          "text-white bg-zinc-900 dark:bg-zinc-700 rounded-md shadow-lg",
          // Keep it above pointer events and non-selectable
          "whitespace-nowrap pointer-events-none select-none",
          // Visibility
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          // Horizontal centering
          "left-1/2 -translate-x-1/2",
          // Vertical placement
          position === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
        )}
      >
        {content}
        {/* Arrow */}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent",
            position === "top"
              ? "top-full border-t-4 border-t-zinc-900 dark:border-t-zinc-700"
              : "bottom-full border-b-4 border-b-zinc-900 dark:border-b-zinc-700",
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
