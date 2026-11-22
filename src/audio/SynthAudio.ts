import type { WorldId } from '../config/constants';
import { getSettings } from '../utils/storage';

export class SynthAudio {
  private context?: AudioContext;
  private musicTimer?: number;
  private musicStep = 0;

  private tone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.05, destination = false): void {
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

  unlock(): void { this.context ??= new AudioContext(); void this.context.resume(); }
  playShoot(): void { this.tone(280, 0.12, 'sawtooth', 0.04); }
  playPop(tier: number): void { this.tone(220 + (4 - tier) * 90, 0.09, 'triangle', 0.07); }
  playPowerUp(): void { [300, 450, 650].forEach((n, i) => setTimeout(() => this.tone(n, 0.12), i * 70)); }
  playShieldBreak(): void { this.tone(120, 0.25, 'square', 0.08); }
  playBlockBreak(): void { this.tone(150, 0.18, 'square', 0.08); this.tone(90, 0.22, 'sawtooth', 0.04); }
  playTimeFreeze(): void { this.tone(180, 0.4, 'sine', 0.07); }
  playPlayerHit(): void { this.tone(90, 0.35, 'sawtooth', 0.09); }
  playGameOver(): void { [220, 160, 100].forEach((n, i) => setTimeout(() => this.tone(n, 0.25), i * 180)); }
  playLevelClear(): void { [330, 440, 554, 660].forEach((n, i) => setTimeout(() => this.tone(n, 0.18), i * 100)); }

  startMusic(world: WorldId): void {
    this.unlock();
    if (!getSettings().music || this.musicTimer) return;
    const roots: Record<WorldId, number[]> = {
      cybersec: [110, 110, 164.81, 130.81],
      ai: [98, 146.83, 196, 146.83],
      devops: [123.47, 123.47, 185, 138.59],
    };
    const notes = roots[world];
    const tempo = world === 'ai' ? 220 : world === 'devops' ? 180 : 200;
    this.musicTimer = window.setInterval(() => {
      if (!getSettings().music) return;
      const note = notes[this.musicStep % notes.length];
      this.tone(note, 0.16, 'triangle', 0.018, true);
      if (this.musicStep % 2 === 0) this.tone(note * 2, 0.08, 'square', 0.012, true);
      this.musicStep++;
    }, tempo);
  }

  stopMusic(): void {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
  }

  toggleMusic(world: WorldId): boolean {
    const enabled = !getSettings().music;
    localStorage.setItem('ping-zero-day:music', String(enabled));
    if (enabled) this.startMusic(world); else this.stopMusic();
    return enabled;
  }
}
