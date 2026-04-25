export type NoteName =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type ScaleName =
  | "major" | "minor" | "harmonicMinor" | "dorian"
  | "mixolydian" | "pentaMajor" | "pentaMinor" | "blues";

export const NOTE_NAMES: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

export const SCALE_LABELS: Record<ScaleName, string> = {
  major:         "Major",
  minor:         "Natural Minor",
  harmonicMinor: "Harmonic Minor",
  dorian:        "Dorian",
  mixolydian:    "Mixolydian",
  pentaMajor:    "Penta Major",
  pentaMinor:    "Penta Minor",
  blues:         "Blues",
};

export const SCALE_INTERVALS: Record<ScaleName, number[]> = {
  major:         [0, 2, 4, 5, 7, 9, 11],
  minor:         [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  dorian:        [0, 2, 3, 5, 7, 9, 10],
  mixolydian:    [0, 2, 4, 5, 7, 9, 10],
  pentaMajor:    [0, 2, 4, 7, 9],
  pentaMinor:    [0, 3, 5, 7, 10],
  blues:         [0, 3, 5, 6, 7, 10],
};

/** MIDI note number — C4 = 60, C0 = 12 */
export function midiNoteNumber(note: NoteName, octave: number): number {
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(note);
}

/** Frequency in Hz for a MIDI note number */
export function noteFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Returns the set of all MIDI note numbers in a given scale, any octave */
export function getScaleMidiSet(root: NoteName, scale: ScaleName): Set<number> {
  const rootIdx = NOTE_NAMES.indexOf(root);
  const intervals = SCALE_INTERVALS[scale];
  const set = new Set<number>();
  for (let midi = 0; midi < 128; midi++) {
    const dist = ((midi % 12) - rootIdx + 12) % 12;
    if (intervals.includes(dist)) set.add(midi);
  }
  return set;
}

export type ChordQuality = "maj" | "min" | "dim" | "aug" | "5";

export interface DiatonicChord {
  degree: string;
  quality: ChordQuality;
  label: string;
  midiNotes: number[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

/** Compute diatonic triads for a root + scale starting at the given octave */
export function getDiatonicChords(
  root: NoteName,
  scale: ScaleName,
  octave: number,
): DiatonicChord[] {
  const rootMidi = midiNoteNumber(root, octave);
  const intervals = SCALE_INTERVALS[scale];

  if (intervals.length < 7) {
    // Pentatonic / Blues: power chords (root + fifth)
    return intervals.map((interval, i) => {
      const noteMidi = rootMidi + interval;
      const noteName = NOTE_NAMES[(NOTE_NAMES.indexOf(root) + interval) % 12];
      return {
        degree: String(i + 1),
        quality: "5" as ChordQuality,
        label: noteName + "5",
        midiNotes: [noteMidi, noteMidi + 7],
      };
    });
  }

  return intervals.map((interval, i) => {
    const thirdIdx = (i + 2) % intervals.length;
    const fifthIdx = (i + 4) % intervals.length;

    // Add 12 if the index wrapped around (interval is lower in chromatic sense)
    const thirdInterval = intervals[thirdIdx] + (thirdIdx < i ? 12 : 0);
    const fifthInterval  = intervals[fifthIdx]  + (fifthIdx  < i ? 12 : 0);

    const thirdDist = thirdInterval - interval;
    const fifthDist  = fifthInterval  - interval;

    let quality: ChordQuality;
    if      (thirdDist === 4 && fifthDist === 7) quality = "maj";
    else if (thirdDist === 3 && fifthDist === 7) quality = "min";
    else if (thirdDist === 3 && fifthDist === 6) quality = "dim";
    else if (thirdDist === 4 && fifthDist === 8) quality = "aug";
    else quality = thirdDist >= 4 ? "maj" : "min";

    const noteName = NOTE_NAMES[(NOTE_NAMES.indexOf(root) + interval) % 12];
    const degree = quality === "min" || quality === "dim"
      ? ROMAN[i].toLowerCase()
      : ROMAN[i];
    const label =
      noteName +
      (quality === "min" ? "m" : quality === "dim" ? "°" : quality === "aug" ? "+" : "");

    return {
      degree,
      quality,
      label,
      midiNotes: [
        rootMidi + interval,
        rootMidi + interval + thirdDist,
        rootMidi + interval + fifthDist,
      ],
    };
  });
}
