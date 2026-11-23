import type { WorldId } from '../config/constants';
import { getSettings } from '../utils/storage';

export interface MusicTrack {
  id: string;
  name: string;
  tempo: number;
  notes: number[];
  subOsc: boolean;
  wave: OscillatorType;
}

const TRACKS: MusicTrack[] = [
  {
    id: 'darksynth',
    name: 'DARK SYNTH // D-MIN',
    tempo: 165,
    notes: [146.83, 146.83, 220.0, 174.61, 196.0, 164.81, 146.83, 130.81],
    subOsc: true,
    wave: 'sawtooth',
  },
  {
    id: 'outrun',
    name: 'NEON OUTRUN // A-MIN',
    tempo: 150,
    notes: [110.0, 164.81, 220.0, 261.63, 196.0, 164.81, 130.81, 164.81],
    subOsc: true,
    wave: 'triangle',
  },
  {
    id: 'cyber_acid',
    name: 'CYBER ACID // B-MIN',
    tempo: 140,
    notes: [123.47, 123.47, 185.0, 146.83, 246.94, 220.0, 185.0, 146.83],
    subOsc: false,
    wave: 'square',
  },
  {
    id: 'neural_glitch',
    name: 'AI SYNAPSE // E-PHRYGIAN',
    tempo: 180,
    notes: [82.41, 123.47, 164.81, 174.61, 220.0, 196.0, 164.81, 123.47],
    subOsc: true,
    wave: 'sawtooth',
  },
  {
    id: 'sre_overdrive',
    name: 'DEVOPS DRIVE // G-MIN',
    tempo: 155,
    notes: [98.0, 146.83, 196.0, 246.94, 220.0, 196.0, 146.83, 116.54],
    subOsc: true,
    wave: 'triangle',
  },
  {
    id: 'zero_day_protocol',
    name: 'ZERO-DAY // F-MIN',
    tempo: 175,
    notes: [87.31, 130.81, 174.61, 207.65, 174.61, 155.56, 130.81, 116.54],
    subOsc: true,
    wave: 'square',
  },
];

export class SynthAudio {
  private context?: AudioContext;
  private musicTimer?: number;
  private musicStep = 0;
  private currentTrack: MusicTrack = TRACKS[0];

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.05,
    destination = false,
  ): void {
    const settings = getSettings();
    if (!settings.sfx && !destination) return;
    this.context ??= new AudioContext();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  unlock(): void {
    this.context ??= new AudioContext();
    void this.context.resume();
  }

  playShoot(): void {
    this.tone(320, 0.12, 'sawtooth', 0.04);
  }

  playPop(tier: number): void {
    this.tone(220 + (4 - tier) * 95, 0.09, 'triangle', 0.07);
  }

  playPowerUp(): void {
    [320, 480, 680].forEach((n, i) => setTimeout(() => this.tone(n, 0.12), i * 70));
  }

  playShieldBreak(): void {
    this.tone(120, 0.25, 'square', 0.08);
  }

  playBlockBreak(): void {
    this.tone(150, 0.18, 'square', 0.08);
    this.tone(90, 0.22, 'sawtooth', 0.04);
  }

  playTimeFreeze(): void {
    this.tone(180, 0.4, 'sine', 0.07);
  }

  playPlayerHit(): void {
    this.tone(90, 0.35, 'sawtooth', 0.09);
  }

  playGameOver(): void {
    [220, 160, 100].forEach((n, i) => setTimeout(() => this.tone(n, 0.25), i * 180));
  }

  playLevelClear(): void {
    [330, 440, 554, 660].forEach((n, i) => setTimeout(() => this.tone(n, 0.18), i * 100));
  }

  playJump(): void {
    this.tone(280, 0.09, 'triangle', 0.05);
    setTimeout(() => this.tone(440, 0.12, 'sine', 0.04), 35);
  }

  // Server defense sound effects
  playServerHit(): void {
    this.tone(110, 0.15, 'sawtooth', 0.08);
    this.tone(75, 0.2, 'square', 0.06);
  }

  playServerDestroyed(): void {
    [160, 110, 70, 45].forEach((n, i) =>
      setTimeout(() => this.tone(n, 0.22, 'sawtooth', 0.09), i * 80),
    );
  }

  playBossHit(): void {
    this.tone(180, 0.12, 'sawtooth', 0.08);
    this.tone(120, 0.15, 'square', 0.06);
  }

  playBossDefeated(): void {
    [220, 330, 440, 660, 880].forEach((n, i) =>
      setTimeout(() => this.tone(n, 0.2, 'sawtooth', 0.09), i * 110),
    );
  }

  getCurrentTrackName(): string {
    return this.currentTrack.name;
  }

  startMusic(_world?: WorldId, forceNewRandom = true): void {
    this.unlock();
    if (!getSettings().music) return;

    if (this.musicTimer) {
      this.stopMusic();
    }

    // Pick a random track from the pool
    if (forceNewRandom) {
      const candidates = TRACKS.filter((t) => t.id !== this.currentTrack.id);
      this.currentTrack = candidates[Math.floor(Math.random() * candidates.length)] ?? TRACKS[0];
    }

    const track = this.currentTrack;
    this.musicStep = 0;

    this.musicTimer = window.setInterval(() => {
      if (!getSettings().music) return;
      const note = track.notes[this.musicStep % track.notes.length];

      // Bass note
      this.tone(note, 0.15, track.wave, 0.02, true);

      // Higher octave lead
      if (this.musicStep % 2 === 0) {
        this.tone(note * 2, 0.07, 'square', 0.012, true);
      }

      // Occasional sub-bass punch
      if (track.subOsc && this.musicStep % 4 === 0) {
        this.tone(note * 0.5, 0.2, 'sine', 0.03, true);
      }

      this.musicStep++;
    }, track.tempo);
  }

  stopMusic(): void {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
  }

  toggleMusic(world: WorldId): boolean {
    const enabled = !getSettings().music;
    localStorage.setItem('ping-zero-day:music', String(enabled));
    if (enabled) {
      // Pick a random track every time music is enabled!
      this.startMusic(world, true);
    } else {
      this.stopMusic();
    }
    return enabled;
  }
}
