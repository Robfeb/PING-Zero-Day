import { FLOOR_Y } from './constants';
import type { Tier, WorldId } from './constants';

export interface LevelOrb { x: number; y: number; tier: Tier; vx: number; }
export interface LevelPlatform { x: number; y: number; width: number; breakable?: boolean; }
export interface LevelLadder { x: number; top: number; bottom: number; }
export interface LevelLayout { name: string; seconds: number; platforms: LevelPlatform[]; ladders: LevelLadder[]; orbs: LevelOrb[]; }

const worldLayouts: Record<WorldId, LevelLayout[]> = {
  cybersec: [
    { name: 'CYBERSEC // STAGE 01', seconds: 75, platforms: [{ x: 480, y: 360, width: 220 }], ladders: [{ x: 480, top: 360, bottom: FLOOR_Y }], orbs: [{ x: 250, y: 130, tier: 3, vx: 100 }, { x: 710, y: 180, tier: 2, vx: -110 }] },
    { name: 'CYBERSEC // STAGE 02', seconds: 72, platforms: [{ x: 300, y: 350, width: 180, breakable: true }, { x: 650, y: 300, width: 200 }], ladders: [{ x: 300, top: 350, bottom: FLOOR_Y }, { x: 650, top: 300, bottom: FLOOR_Y }], orbs: [{ x: 480, y: 100, tier: 4, vx: 95 }] },
    { name: 'CYBERSEC // STAGE 03', seconds: 69, platforms: [{ x: 210, y: 320, width: 160 }, { x: 480, y: 230, width: 220, breakable: true }, { x: 750, y: 350, width: 160 }], ladders: [{ x: 480, top: 230, bottom: 500 }], orbs: [{ x: 200, y: 120, tier: 3, vx: 120 }, { x: 760, y: 150, tier: 3, vx: -120 }] },
    { name: 'CYBERSEC // STAGE 04', seconds: 66, platforms: [{ x: 320, y: 390, width: 180, breakable: true }, { x: 640, y: 390, width: 180, breakable: true }, { x: 480, y: 260, width: 250 }], ladders: [{ x: 320, top: 390, bottom: 500 }, { x: 640, top: 390, bottom: 500 }], orbs: [{ x: 300, y: 100, tier: 4, vx: 110 }, { x: 670, y: 140, tier: 2, vx: -130 }] },
    { name: 'CYBERSEC // STAGE 05', seconds: 63, platforms: [{ x: 200, y: 330, width: 150 }, { x: 480, y: 380, width: 190, breakable: true }, { x: 760, y: 330, width: 150 }, { x: 480, y: 220, width: 210 }], ladders: [{ x: 480, top: 220, bottom: 500 }], orbs: [{ x: 170, y: 100, tier: 3, vx: 130 }, { x: 790, y: 120, tier: 3, vx: -130 }, { x: 480, y: 80, tier: 2, vx: 110 }] },
  ],
  ai: [
    { name: 'AI / LLM SEC // STAGE 01', seconds: 75, platforms: [{ x: 480, y: 340, width: 280 }], ladders: [{ x: 480, top: 340, bottom: FLOOR_Y }], orbs: [{ x: 300, y: 140, tier: 2, vx: 115 }, { x: 690, y: 120, tier: 3, vx: -105 }] },
    { name: 'AI / LLM SEC // STAGE 02', seconds: 72, platforms: [{ x: 250, y: 310, width: 170 }, { x: 710, y: 310, width: 170 }, { x: 480, y: 410, width: 240, breakable: true }], ladders: [{ x: 250, top: 310, bottom: FLOOR_Y }, { x: 710, top: 310, bottom: FLOOR_Y }], orbs: [{ x: 480, y: 100, tier: 4, vx: 100 }] },
    { name: 'AI / LLM SEC // STAGE 03', seconds: 69, platforms: [{ x: 330, y: 370, width: 180 }, { x: 630, y: 370, width: 180 }, { x: 480, y: 240, width: 220, breakable: true }], ladders: [{ x: 480, top: 240, bottom: 500 }], orbs: [{ x: 220, y: 150, tier: 3, vx: 125 }, { x: 740, y: 150, tier: 3, vx: -125 }] },
    { name: 'AI / LLM SEC // STAGE 04', seconds: 66, platforms: [{ x: 180, y: 300, width: 140 }, { x: 780, y: 300, width: 140 }, { x: 480, y: 360, width: 220 }], ladders: [{ x: 180, top: 300, bottom: FLOOR_Y }, { x: 780, top: 300, bottom: FLOOR_Y }], orbs: [{ x: 340, y: 100, tier: 4, vx: 105 }, { x: 620, y: 160, tier: 3, vx: -115 }] },
    { name: 'AI / LLM SEC // STAGE 05', seconds: 63, platforms: [{ x: 240, y: 350, width: 180, breakable: true }, { x: 480, y: 220, width: 240 }, { x: 720, y: 350, width: 180, breakable: true }], ladders: [{ x: 480, top: 220, bottom: 500 }], orbs: [{ x: 150, y: 110, tier: 3, vx: 140 }, { x: 810, y: 110, tier: 3, vx: -140 }, { x: 480, y: 80, tier: 4, vx: 100 }] },
  ],
  devops: [
    { name: 'DEVOPS / SRE // STAGE 01', seconds: 75, platforms: [{ x: 480, y: 360, width: 260 }], ladders: [{ x: 480, top: 360, bottom: FLOOR_Y }], orbs: [{ x: 220, y: 130, tier: 3, vx: 110 }, { x: 740, y: 180, tier: 2, vx: -120 }] },
    { name: 'DEVOPS / SRE // STAGE 02', seconds: 72, platforms: [{ x: 300, y: 330, width: 190, breakable: true }, { x: 660, y: 330, width: 190 }], ladders: [{ x: 300, top: 330, bottom: FLOOR_Y }, { x: 660, top: 330, bottom: FLOOR_Y }], orbs: [{ x: 480, y: 100, tier: 4, vx: 100 }] },
    { name: 'DEVOPS / SRE // STAGE 03', seconds: 69, platforms: [{ x: 200, y: 380, width: 160 }, { x: 480, y: 270, width: 220, breakable: true }, { x: 760, y: 380, width: 160 }], ladders: [{ x: 480, top: 270, bottom: 500 }], orbs: [{ x: 200, y: 140, tier: 3, vx: 125 }, { x: 760, y: 140, tier: 3, vx: -125 }] },
    { name: 'DEVOPS / SRE // STAGE 04', seconds: 66, platforms: [{ x: 280, y: 390, width: 170 }, { x: 680, y: 390, width: 170 }, { x: 480, y: 250, width: 240, breakable: true }], ladders: [{ x: 280, top: 390, bottom: FLOOR_Y }, { x: 680, top: 390, bottom: FLOOR_Y }], orbs: [{ x: 300, y: 100, tier: 4, vx: 110 }, { x: 660, y: 140, tier: 2, vx: -130 }] },
    { name: 'DEVOPS / SRE // STAGE 05', seconds: 63, platforms: [{ x: 180, y: 330, width: 150, breakable: true }, { x: 480, y: 390, width: 210 }, { x: 780, y: 330, width: 150, breakable: true }, { x: 480, y: 220, width: 220 }], ladders: [{ x: 480, top: 220, bottom: 500 }], orbs: [{ x: 150, y: 100, tier: 3, vx: 140 }, { x: 810, y: 100, tier: 3, vx: -140 }, { x: 480, y: 70, tier: 4, vx: 100 }] },
  ],
};

export function getLevel(world: WorldId, stage: number): LevelLayout {
  const safeStage = Math.max(1, Math.min(5, stage));
  return worldLayouts[world][safeStage - 1];
}
