"use client";
import React, { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Read whatever the anti-FOUC script already set
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <Tooltip content={dark ? "Switch to light mode" : "Switch to dark mode"} position="bottom">
      <button
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="rounded-md p-1.5 text-ink-dim hover:text-ink hover:bg-well transition-colors"
        suppressHydrationWarning
      >
        {dark === null ? null : dark ? "☀️" : "🌙"}
      </button>
    </Tooltip>
  );
}
