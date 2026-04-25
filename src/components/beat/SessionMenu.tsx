"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { type Pattern } from "@/lib/pattern";
import { saveSession, loadSessions, deleteSession, getSessionPattern, exportPatternJson, type SavedSession } from "@/lib/session";
import { buildShareLink } from "@/lib/pattern";

interface SessionMenuProps {
  pattern: Pattern;
  onLoad: (pattern: Pattern) => void;
}

export function SessionMenu({ pattern, onLoad }: SessionMenuProps) {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [saveName, setSaveName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  function handleSave() {
    const name = saveName.trim() || `Session ${Date.now()}`;
    saveSession(name, pattern);
    setSessions(loadSessions());
    setSaveName("");
  }

  function handleLoad(session: SavedSession) {
    onLoad(getSessionPattern(session));
    setShowSessions(false);
  }

  function handleDelete(id: string) {
    deleteSession(id);
    setSessions(loadSessions());
  }

  function handleShare() {
    const link = buildShareLink(pattern, window.location.origin + window.location.pathname);
    setShareLink(link);
    navigator.clipboard.writeText(link).catch(() => {});
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const p = JSON.parse(text) as Pattern;
        onLoad(p);
      } catch {
        alert("Invalid session file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-dim mb-3">Session</p>

      {/* Save row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Session name…"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="rounded-lg bg-well border border-rim px-2.5 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-36 placeholder:text-ink-ghost"
          aria-label="Session name"
        />
        <Button variant="secondary" size="sm" onClick={handleSave}>Save</Button>
        <Button variant="secondary" size="sm" onClick={() => setShowSessions(!showSessions)}>
          {showSessions ? "Hide" : "Load"} ({sessions.length})
        </Button>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={handleShare}>Share Link</Button>
        <Button variant="ghost" size="sm" onClick={() => exportPatternJson(pattern)}>Export JSON</Button>
        <label className="cursor-pointer">
          <span className="inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium text-ink-dim hover:text-ink hover:bg-well transition-colors">
            Import JSON
          </span>
          <input type="file" accept=".json" className="hidden" onChange={handleImport} aria-label="Import JSON session file" />
        </label>
      </div>

      {shareLink && (
        <p className="mt-2 text-xs text-indigo-400 break-all" aria-live="polite">
          Copied! {shareLink.slice(0, 60)}…
        </p>
      )}

      {showSessions && (
        <div className="mt-3 rounded-lg bg-panel border border-rim overflow-hidden">
          {sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-ink-dim">No saved sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 border-b border-rim last:border-0">
                <span className="text-xs text-ink truncate flex-1 mr-2">{s.name}</span>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleLoad(s)}>Load</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>✕</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
