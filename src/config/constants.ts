export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const FLOOR_Y = 500;
export const GRAVITY = 950;

export const TIER = {
  1: { radius: 16, color: 0x00f0ff, height: 160, bounceVy: -400 },
  2: { radius: 26, color: 0xffd700, height: 240, bounceVy: -500 },
  3: { radius: 38, color: 0xff8c00, height: 330, bounceVy: -600 },
  4: { radius: 52, color: 0xff2a55, height: 420, bounceVy: -700 },
} as const;

export type Tier = keyof typeof TIER;
export type WorldId = 'cybersec' | 'ai' | 'devops';
export type GameMode = 'campaign' | 'endless';
