import { SAMPLES, type SampleDef } from "./samples";

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private trackGains = new Map<string, GainNode>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.mediaStreamDest = this.context.createMediaStreamDestination();

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.analyser.connect(this.mediaStreamDest);

    this.initialized = true;
    await this.loadBuffers();
  }

  private async loadBuffers(): Promise<void> {
    if (!this.context) return;
    await Promise.all(
      SAMPLES.map(async (sample: SampleDef) => {
        try {
          const res = await fetch(sample.url);
          const arrayBuf = await res.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuf);
          this.buffers.set(sample.id, audioBuffer);
        } catch {
          // silently skip missing samples in tests
        }
      })
    );
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getMediaStream(): MediaStream | null {
    return this.mediaStreamDest?.stream ?? null;
  }

  getAudioContext(): AudioContext | null {
    return this.context;
  }

  setMasterVolume(vol: number): void {
    if (this.masterGain) this.masterGain.gain.value = vol;
  }

  getOrCreateTrackGain(trackId: string): GainNode | null {
    if (!this.context || !this.masterGain) return null;
    if (!this.trackGains.has(trackId)) {
      const g = this.context.createGain();
      g.connect(this.masterGain);
      this.trackGains.set(trackId, g);
    }
    return this.trackGains.get(trackId) ?? null;
  }

  setTrackVolume(trackId: string, vol: number): void {
    const g = this.getOrCreateTrackGain(trackId);
    if (g) g.gain.value = vol;
  }

  playBuffer(sampleId: string, trackId: string, time: number): void {
    if (!this.context || !this.initialized) return;
    const buffer = this.buffers.get(sampleId);
    if (!buffer) return;
    const trackGain = this.getOrCreateTrackGain(trackId);
    if (!trackGain) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(trackGain);
    source.start(time);
  }

  /**
   * Synthesise a piano-like tone and route it through the master gain / analyser.
   * velocity: 0-1, duration in seconds.
   */
  playTone(freq: number, velocity: number, duration: number): void {
    if (!this.context || !this.masterGain || !this.initialized) return;
    const ctx = this.context;
    const now = ctx.currentTime;

    const env = ctx.createGain();
    env.connect(this.masterGain);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(velocity * 0.7, now + 0.01);
    env.gain.exponentialRampToValueAtTime(velocity * 0.3, now + 0.15);
    env.gain.setValueAtTime(velocity * 0.3, now + Math.max(duration - 0.2, 0.05));
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);
    env.gain.setValueAtTime(0, now + duration + 0.01);

    const partials: Array<{ ratio: number; gain: number; type: OscillatorType }> = [
      { ratio: 1, gain: 1.00, type: "triangle" },
      { ratio: 2, gain: 0.50, type: "sine" },
      { ratio: 3, gain: 0.25, type: "sine" },
      { ratio: 4, gain: 0.12, type: "sine" },
      { ratio: 5, gain: 0.06, type: "sine" },
    ];

    for (const { ratio, gain, type } of partials) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * ratio;
      oscGain.gain.value = gain;
      osc.connect(oscGain);
      oscGain.connect(env);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  resume(): Promise<void> {
    return this.context?.resume() ?? Promise.resolve();
  }

  suspend(): Promise<void> {
    return this.context?.suspend() ?? Promise.resolve();
  }
}

let engineInstance: AudioEngine | null = null;

export function getEngine(): AudioEngine {
  if (!engineInstance) engineInstance = new AudioEngine();
  return engineInstance;
}
