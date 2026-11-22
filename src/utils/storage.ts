export interface GameSettings { music: boolean; sfx: boolean; }

const scoreKey = (world: string, mode: string) => `ping-zero-day:${world}:${mode}:highscore`;

export function getHighScore(world: string, mode: string): number {
  return Number(localStorage.getItem(scoreKey(world, mode)) ?? 0);
}

export function setHighScore(world: string, mode: string, score: number): void {
  if (score > getHighScore(world, mode)) localStorage.setItem(scoreKey(world, mode), String(score));
}

export function getSettings(): GameSettings {
  return {
    music: localStorage.getItem('ping-zero-day:music') !== 'false',
    sfx: localStorage.getItem('ping-zero-day:sfx') !== 'false',
  };
}

export function setSetting(key: 'music' | 'sfx', value: boolean): void {
  localStorage.setItem(`ping-zero-day:${key}`, String(value));
}
