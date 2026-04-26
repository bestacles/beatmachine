"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Text shown in the tooltip bubble. */
  content: string;
  children: React.ReactNode;
  /** Which side the bubble appears on relative to the trigger. Default: top */
  position?: "top" | "bottom" | "right";
  className?: string;
}

/**
 * Portal-based tooltip — renders into document.body so it's never clipped
 * by parent overflow containers.
 */
export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const computeStyle = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const GAP = 6;
    if (position === "right") {
      setStyle({
        position: "fixed",
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: "translateY(-50%)",
      });
    } else if (position === "bottom") {
      setStyle({
        position: "fixed",
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      });
    } else {
      setStyle({
        position: "fixed",
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%) translateY(-100%)",
      });
    }
  }, [position]);

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => { computeStyle(); setVisible(true); }}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => { computeStyle(); setVisible(true); }}
      onBlur={() => setVisible(false)}
    >
      {children}
      {mounted && visible && createPortal(
        <div
          role="tooltip"
          style={{ ...style, zIndex: 9999 }}
          className="px-2 py-1 text-[11px] font-medium leading-snug text-white bg-zinc-900 dark:bg-zinc-700 rounded-md shadow-lg whitespace-nowrap pointer-events-none select-none"
        >
          {content}
        </div>,
        document.body,
      )}
    </div>
  );
}

