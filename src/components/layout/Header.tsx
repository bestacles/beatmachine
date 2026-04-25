import React from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">🥁</span>
        <span className="text-sm font-bold tracking-tight">
          Beat<span className="text-indigo-400">Machine</span>
        </span>
      </div>
      <nav className="flex items-center gap-1">
        <a
          href="https://github.com/bestacles/beatmachine"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="GitHub repository"
        >
          GitHub
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
