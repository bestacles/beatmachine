import React from "react";

export function Footer() {
  return (
    <footer className="px-6 py-4 border-t border-zinc-800 text-center text-xs text-zinc-600">
      Built by{" "}
      <a
        href="https://github.com/bestacles"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        bestacles
      </a>
      {" · "}MIT License
    </footer>
  );
}
