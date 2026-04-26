"use client";
import React from "react";
import { type InstrumentSection } from "@/lib/pattern";
import { SectionRow } from "./SectionRow";

interface SectionMixerProps {
  sections: InstrumentSection[];
  stepCount: number;
  currentStep: number | null;
  isPlaying: boolean;
  activeTabId: string;
  onSelectSection: (sectionId: string) => void;
  onSectionMute: (sectionId: string) => void;
  onSectionSolo: (sectionId: string) => void;
  onSectionVolChange: (sectionId: string, vol: number) => void;
}

/**
 * The "Mix" overview tab — a mixer-style view of all sections.
 */
export function SectionMixer({
  sections,
  stepCount,
  currentStep,
  isPlaying,
  activeTabId,
  onSelectSection,
  onSectionMute,
  onSectionSolo,
  onSectionVolChange,
}: SectionMixerProps) {
  return (
    <div className="flex flex-col divide-y divide-rim">
      {sections.map((sec) => (
        <SectionRow
          key={sec.id}
          section={sec}
          stepCount={stepCount}
          currentStep={currentStep}
          isPlaying={isPlaying}
          isActive={activeTabId === sec.id}
          onSelect={() => onSelectSection(sec.id)}
          onMute={() => onSectionMute(sec.id)}
          onSolo={() => onSectionSolo(sec.id)}
          onVolChange={(vol) => onSectionVolChange(sec.id, vol)}
        />
      ))}
    </div>
  );
}
