/** GM drum channel note mappings (channel 10 / 0x99) */
export const GM_DRUM_NOTES: Record<string, number> = {
  kick:       36, // Bass Drum 1
  snare:      38, // Acoustic Snare
  hat:        42, // Closed Hi Hat
  "open-hat": 46, // Open Hi Hat
  ride:       51, // Ride Cymbal 1
  clap:       39, // Hand Clap
  rimshot:    37, // Side Stick
  tom:        47, // Low-Mid Tom
  shaker:     54, // Tambourine
  cowbell:    56, // Cowbell
  perc:       63, // High Conga
  fx:         49, // Crash Cymbal 1
  sub:        35, // Acoustic Bass Drum
  bass:       43, // High Floor Tom
  chord:      81, // Open Triangle
  synth:      80, // Muted Triangle
};

export interface MidiOutputInfo {
  id: string;
  name: string;
}

let _access: MIDIAccess | null = null;

/** Request Web MIDI access; returns null if unavailable or denied */
export async function ensureMidiAccess(): Promise<MIDIAccess | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) return null;
    if (!_access) _access = await navigator.requestMIDIAccess();
    return _access;
  } catch {
    return null;
  }
}

/** List available MIDI output devices */
export function listMidiOutputs(access: MIDIAccess): MidiOutputInfo[] {
  return Array.from(access.outputs.values()).map((p) => ({
    id: p.id,
    name: p.name ?? `Output ${p.id}`,
  }));
}

/** Send a drum note-on + delayed note-off on MIDI channel 10 */
export function sendDrumNote(
  access: MIDIAccess,
  outputId: string,
  sampleId: string,
  velocity = 100,
): void {
  const output = access.outputs.get(outputId);
  if (!output) return;
  const note = GM_DRUM_NOTES[sampleId] ?? 38;
  output.send([0x99, note, velocity]);
  output.send([0x89, note, 0], performance.now() + 60);
}

/** Send a melodic note-on + delayed note-off on MIDI channel 1 */
export function sendMelodicNote(
  access: MIDIAccess,
  outputId: string,
  midiNote: number,
  velocity = 90,
  durationMs = 500,
): void {
  const output = access.outputs.get(outputId);
  if (!output) return;
  output.send([0x90, midiNote, velocity]);
  output.send([0x80, midiNote, 0], performance.now() + durationMs);
}
