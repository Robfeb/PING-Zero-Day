export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const FLOOR_Y = 500;
export const GRAVITY = 950;

export const TIER = {
  1: { radius: 11, color: 0x00f0ff, height: 151, bounceVy: -380 },
  2: { radius: 19, color: 0xffd700, height: 227, bounceVy: -480 },
  3: { radius: 30, color: 0xff8c00, height: 313, bounceVy: -580 },
  4: { radius: 44, color: 0xff2a55, height: 405, bounceVy: -680 },
} as const;

export type Tier = keyof typeof TIER;
export type WorldId = 'cybersec' | 'ai' | 'devops';
export type GameMode = 'campaign' | 'endless';
