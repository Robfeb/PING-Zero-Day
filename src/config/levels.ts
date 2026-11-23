import { FLOOR_Y } from './constants';
import type { Tier, WorldId } from './constants';

export interface LevelOrb {
  x: number;
  y: number;
  tier: Tier;
  vx: number;
}

export interface LevelPlatform {
  x: number;
  y: number;
  width: number;
  breakable?: boolean;
}

export interface LevelLadder {
  x: number;
  top: number;
  bottom: number;
}

export interface LevelServer {
  x: number;
  y?: number;
  hp?: number;
  label?: string;
}

export interface BossObjective {
  x: number;
  y: number;
  type: 'tokens_core' | 'deploy_terminal';
  hp: number;
  name: string;
}

export interface LevelLayout {
  name: string;
  seconds: number;
  worldWidth?: number;
  worldHeight?: number;
  floorY?: number;
  platforms: LevelPlatform[];
  ladders: LevelLadder[];
  orbs: LevelOrb[];
  servers: LevelServer[];
  boss?: BossObjective;
}

const worldLayouts: Record<WorldId, LevelLayout[]> = {
  // -------------------------------------------------------------------------
  // 1. CYBERSEC: CLASSIC PANG ARENA INFRASTRUCTURE DEFENSE
  // -------------------------------------------------------------------------
  cybersec: [
    {
      name: 'CYBERSEC // STAGE 01 [DEFEND SERVERS]',
      seconds: 75,
      platforms: [{ x: 480, y: 360, width: 220 }],
      ladders: [{ x: 480, top: 360, bottom: FLOOR_Y }],
      orbs: [
        { x: 250, y: 130, tier: 3, vx: 100 },
        { x: 710, y: 180, tier: 2, vx: -110 },
      ],
      servers: [
        { x: 240, hp: 4, label: 'AUTH-GATEWAY' },
        { x: 720, hp: 4, label: 'FIREWALL-01' },
      ],
    },
    {
      name: 'CYBERSEC // STAGE 02 [DATABASE CLUSTER]',
      seconds: 72,
      platforms: [
        { x: 300, y: 350, width: 180, breakable: true },
        { x: 650, y: 300, width: 200 },
      ],
      ladders: [
        { x: 300, top: 350, bottom: FLOOR_Y },
        { x: 650, top: 300, bottom: FLOOR_Y },
      ],
      orbs: [{ x: 480, y: 100, tier: 4, vx: 95 }],
      servers: [
        { x: 320, hp: 4, label: 'POSTGRES-CORE' },
        { x: 640, hp: 4, label: 'REDIS-CACHE' },
      ],
    },
    {
      name: 'CYBERSEC // STAGE 03 [ZERO-DAY RCE ATTACK]',
      seconds: 69,
      platforms: [
        { x: 210, y: 320, width: 160 },
        { x: 480, y: 230, width: 220, breakable: true },
        { x: 750, y: 350, width: 160 },
      ],
      ladders: [{ x: 480, top: 230, bottom: 500 }],
      orbs: [
        { x: 200, y: 120, tier: 3, vx: 120 },
        { x: 760, y: 150, tier: 3, vx: -120 },
      ],
      servers: [
        { x: 180, hp: 4, label: 'PRIMARY-NODE' },
        { x: 480, hp: 4, label: 'KMS-VAULT' },
        { x: 780, hp: 4, label: 'BACKUP-NODE' },
      ],
    },
    {
      name: 'CYBERSEC // STAGE 04 [BOTNET DUAL RACKS]',
      seconds: 66,
      platforms: [
        { x: 320, y: 390, width: 180, breakable: true },
        { x: 640, y: 390, width: 180, breakable: true },
        { x: 480, y: 260, width: 250 },
      ],
      ladders: [
        { x: 320, top: 390, bottom: 500 },
        { x: 640, top: 390, bottom: 500 },
      ],
      orbs: [
        { x: 300, y: 100, tier: 4, vx: 110 },
        { x: 670, y: 140, tier: 2, vx: -130 },
      ],
      servers: [
        { x: 200, hp: 4, label: 'MAIN-FRAME A' },
        { x: 760, hp: 4, label: 'MAIN-FRAME B' },
      ],
    },
    {
      name: 'CYBERSEC // STAGE 05 [MAINFRAME LOCKDOWN]',
      seconds: 63,
      platforms: [
        { x: 200, y: 330, width: 150 },
        { x: 480, y: 380, width: 190, breakable: true },
        { x: 760, y: 330, width: 150 },
        { x: 480, y: 220, width: 210 },
      ],
      ladders: [{ x: 480, top: 220, bottom: 500 }],
      orbs: [
        { x: 170, y: 100, tier: 3, vx: 130 },
        { x: 790, y: 120, tier: 3, vx: -130 },
        { x: 480, y: 80, tier: 4, vx: 100 },
      ],
      servers: [
        { x: 220, hp: 5, label: 'CLUSTER-ALPHA' },
        { x: 480, hp: 5, label: 'ZERO-DAY CORE' },
        { x: 740, hp: 5, label: 'CLUSTER-BETA' },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // 2. AI / LLM SEC: VERTICAL TOWER ASCENT & TOKENS CORE PURGE
  // -------------------------------------------------------------------------
  ai: [
    {
      name: 'AI TOWER // TIER 01 [ASCEND & DEFEND]',
      seconds: 85,
      worldWidth: 960,
      worldHeight: 1500,
      floorY: 1450,
      platforms: [
        { x: 480, y: 1250, width: 280 },
        { x: 260, y: 1020, width: 220 },
        { x: 700, y: 840, width: 240 },
        { x: 380, y: 620, width: 260 },
        { x: 580, y: 400, width: 280 },
        { x: 480, y: 200, width: 320 },
      ],
      ladders: [
        { x: 480, top: 1250, bottom: 1450 },
        { x: 260, top: 1020, bottom: 1250 },
        { x: 700, top: 840, bottom: 1020 },
        { x: 380, top: 620, bottom: 840 },
        { x: 580, top: 400, bottom: 620 },
        { x: 480, top: 200, bottom: 400 },
      ],
      orbs: [
        { x: 300, y: 1100, tier: 3, vx: 110 },
        { x: 680, y: 750, tier: 2, vx: -115 },
        { x: 480, y: 350, tier: 3, vx: 120 },
      ],
      servers: [
        { x: 280, hp: 4, label: 'NEURAL NODE 01' },
        { x: 680, hp: 4, label: 'SYNAPSE HUB' },
      ],
      boss: {
        x: 480,
        y: 110,
        type: 'tokens_core',
        hp: 6,
        name: 'ROGUE TOKENS CORE',
      },
    },
    {
      name: 'AI TOWER // TIER 02 [JAILBREAK ESCAPE]',
      seconds: 80,
      worldWidth: 960,
      worldHeight: 1500,
      floorY: 1450,
      platforms: [
        { x: 340, y: 1280, width: 240, breakable: true },
        { x: 680, y: 1100, width: 240 },
        { x: 300, y: 900, width: 220 },
        { x: 650, y: 720, width: 260, breakable: true },
        { x: 400, y: 520, width: 250 },
        { x: 480, y: 220, width: 340 },
      ],
      ladders: [
        { x: 340, top: 1280, bottom: 1450 },
        { x: 680, top: 1100, bottom: 1280 },
        { x: 300, top: 900, bottom: 1100 },
        { x: 650, top: 720, bottom: 900 },
        { x: 400, top: 520, bottom: 720 },
        { x: 480, top: 220, bottom: 520 },
      ],
      orbs: [
        { x: 480, y: 1200, tier: 4, vx: 100 },
        { x: 350, y: 800, tier: 3, vx: -120 },
        { x: 600, y: 400, tier: 2, vx: 125 },
      ],
      servers: [
        { x: 260, hp: 4, label: 'MODEL WEIGHTS A' },
        { x: 700, hp: 4, label: 'MODEL WEIGHTS B' },
      ],
      boss: {
        x: 480,
        y: 110,
        type: 'tokens_core',
        hp: 8,
        name: 'ROGUE TOKENS CORE',
      },
    },
    {
      name: 'AI TOWER // TIER 03 [LATENT SPACE]',
      seconds: 78,
      worldWidth: 960,
      worldHeight: 1500,
      floorY: 1450,
      platforms: [
        { x: 500, y: 1260, width: 260 },
        { x: 250, y: 1040, width: 200, breakable: true },
        { x: 720, y: 860, width: 220 },
        { x: 380, y: 650, width: 240, breakable: true },
        { x: 620, y: 440, width: 240 },
        { x: 480, y: 220, width: 320 },
      ],
      ladders: [
        { x: 500, top: 1260, bottom: 1450 },
        { x: 250, top: 1040, bottom: 1260 },
        { x: 720, top: 860, bottom: 1040 },
        { x: 380, top: 650, bottom: 860 },
        { x: 620, top: 440, bottom: 650 },
        { x: 480, top: 220, bottom: 440 },
      ],
      orbs: [
        { x: 260, y: 1150, tier: 3, vx: 125 },
        { x: 700, y: 750, tier: 4, vx: -110 },
        { x: 400, y: 350, tier: 2, vx: 130 },
      ],
      servers: [
        { x: 240, hp: 4, label: 'ATTENTION NODE' },
        { x: 480, hp: 4, label: 'EMBEDDING DB' },
        { x: 720, hp: 4, label: 'KV-CACHE' },
      ],
      boss: {
        x: 480,
        y: 110,
        type: 'tokens_core',
        hp: 9,
        name: 'ROGUE TOKENS CORE',
      },
    },
    {
      name: 'AI TOWER // TIER 04 [PROMPT POISON]',
      seconds: 75,
      worldWidth: 960,
      worldHeight: 1500,
      floorY: 1450,
      platforms: [
        { x: 360, y: 1280, width: 240 },
        { x: 660, y: 1060, width: 240, breakable: true },
        { x: 300, y: 850, width: 220 },
        { x: 680, y: 640, width: 240 },
        { x: 380, y: 430, width: 240, breakable: true },
        { x: 480, y: 210, width: 340 },
      ],
      ladders: [
        { x: 360, top: 1280, bottom: 1450 },
        { x: 660, top: 1060, bottom: 1280 },
        { x: 300, top: 850, bottom: 1060 },
        { x: 680, top: 640, bottom: 850 },
        { x: 380, top: 430, bottom: 640 },
        { x: 480, top: 210, bottom: 430 },
      ],
      orbs: [
        { x: 500, y: 1150, tier: 4, vx: 115 },
        { x: 300, y: 750, tier: 3, vx: -125 },
        { x: 650, y: 350, tier: 3, vx: 130 },
      ],
      servers: [
        { x: 280, hp: 4, label: 'INFERENCE API' },
        { x: 680, hp: 4, label: 'GUARDRAIL SRV' },
      ],
      boss: {
        x: 480,
        y: 110,
        type: 'tokens_core',
        hp: 10,
        name: 'ROGUE TOKENS CORE',
      },
    },
    {
      name: 'AI TOWER // TIER 05 [SINGULARITY PINNACLE]',
      seconds: 72,
      worldWidth: 960,
      worldHeight: 1500,
      floorY: 1450,
      platforms: [
        { x: 500, y: 1260, width: 260, breakable: true },
        { x: 260, y: 1040, width: 220 },
        { x: 740, y: 840, width: 220, breakable: true },
        { x: 400, y: 630, width: 260 },
        { x: 640, y: 420, width: 240 },
        { x: 480, y: 200, width: 360 },
      ],
      ladders: [
        { x: 500, top: 1260, bottom: 1450 },
        { x: 260, top: 1040, bottom: 1260 },
        { x: 740, top: 840, bottom: 1040 },
        { x: 400, top: 630, bottom: 840 },
        { x: 640, top: 420, bottom: 630 },
        { x: 480, top: 200, bottom: 420 },
      ],
      orbs: [
        { x: 300, y: 1200, tier: 4, vx: 125 },
        { x: 700, y: 800, tier: 4, vx: -125 },
        { x: 480, y: 350, tier: 3, vx: 130 },
      ],
      servers: [
        { x: 220, hp: 5, label: 'CORE QUANTUM' },
        { x: 480, hp: 5, label: 'MASTER TENSOR' },
        { x: 740, hp: 5, label: 'SECURITY AIRGAP' },
      ],
      boss: {
        x: 480,
        y: 110,
        type: 'tokens_core',
        hp: 12,
        name: 'ROGUE TOKENS CORE',
      },
    },
  ],

  // -------------------------------------------------------------------------
  // 3. DEVOPS / SRE: HORIZONTAL CI/CD PIPELINE RUSH
  // -------------------------------------------------------------------------
  devops: [
    {
      name: 'CI/CD RUSH // TRACK 01 [SPRINT TO PROD]',
      seconds: 85,
      worldWidth: 2400,
      worldHeight: 540,
      floorY: 500,
      platforms: [
        { x: 400, y: 360, width: 200 },
        { x: 800, y: 320, width: 220, breakable: true },
        { x: 1250, y: 360, width: 240 },
        { x: 1680, y: 310, width: 220, breakable: true },
        { x: 2080, y: 360, width: 260 },
      ],
      ladders: [
        { x: 400, top: 360, bottom: 500 },
        { x: 1250, top: 360, bottom: 500 },
        { x: 2080, top: 360, bottom: 500 },
      ],
      orbs: [
        { x: 700, y: 120, tier: 3, vx: -110 },
        { x: 1500, y: 100, tier: 4, vx: -120 },
        { x: 2150, y: 140, tier: 2, vx: -130 },
      ],
      servers: [
        { x: 300, hp: 4, label: 'BUILD-RUNNER 01' },
        { x: 1150, hp: 4, label: 'STAGING-K8S' },
        { x: 1950, hp: 4, label: 'PROD-GATEWAY' },
      ],
      boss: {
        x: 2280,
        y: 340,
        type: 'deploy_terminal',
        hp: 6,
        name: 'PROD DEPLOY TERMINAL',
      },
    },
    {
      name: 'CI/CD RUSH // TRACK 02 [OUTAGE ROLLBACK]',
      seconds: 80,
      worldWidth: 2400,
      worldHeight: 540,
      floorY: 500,
      platforms: [
        { x: 450, y: 340, width: 220, breakable: true },
        { x: 880, y: 380, width: 240 },
        { x: 1300, y: 300, width: 200, breakable: true },
        { x: 1720, y: 360, width: 220 },
        { x: 2100, y: 330, width: 240 },
      ],
      ladders: [
        { x: 880, top: 380, bottom: 500 },
        { x: 1720, top: 360, bottom: 500 },
      ],
      orbs: [
        { x: 900, y: 100, tier: 4, vx: -115 },
        { x: 1600, y: 120, tier: 3, vx: -125 },
        { x: 2200, y: 110, tier: 3, vx: -130 },
      ],
      servers: [
        { x: 380, hp: 4, label: 'UNIT-TESTS' },
        { x: 1250, hp: 4, label: 'INTEG-CLUSTER' },
        { x: 2000, hp: 4, label: 'CANARY-PROD' },
      ],
      boss: {
        x: 2280,
        y: 340,
        type: 'deploy_terminal',
        hp: 8,
        name: 'PROD DEPLOY TERMINAL',
      },
    },
    {
      name: 'CI/CD RUSH // TRACK 03 [P0 HOTFIX SPRINT]',
      seconds: 78,
      worldWidth: 2400,
      worldHeight: 540,
      floorY: 500,
      platforms: [
        { x: 420, y: 360, width: 200 },
        { x: 820, y: 310, width: 220, breakable: true },
        { x: 1260, y: 370, width: 240 },
        { x: 1680, y: 320, width: 220, breakable: true },
        { x: 2120, y: 350, width: 250 },
      ],
      ladders: [
        { x: 420, top: 360, bottom: 500 },
        { x: 1260, top: 370, bottom: 500 },
        { x: 2120, top: 350, bottom: 500 },
      ],
      orbs: [
        { x: 800, y: 90, tier: 4, vx: -120 },
        { x: 1450, y: 110, tier: 4, vx: -130 },
        { x: 2180, y: 100, tier: 2, vx: -135 },
      ],
      servers: [
        { x: 280, hp: 4, label: 'GIT-RUNNER' },
        { x: 1100, hp: 4, label: 'TERRAFORM-CORE' },
        { x: 1980, hp: 4, label: 'REDIS-CACHE' },
      ],
      boss: {
        x: 2280,
        y: 340,
        type: 'deploy_terminal',
        hp: 9,
        name: 'PROD DEPLOY TERMINAL',
      },
    },
    {
      name: 'CI/CD RUSH // TRACK 04 [CHAOS ENGINEERING]',
      seconds: 75,
      worldWidth: 2400,
      worldHeight: 540,
      floorY: 500,
      platforms: [
        { x: 460, y: 330, width: 220, breakable: true },
        { x: 900, y: 380, width: 240 },
        { x: 1320, y: 310, width: 210, breakable: true },
        { x: 1740, y: 370, width: 230 },
        { x: 2140, y: 330, width: 240 },
      ],
      ladders: [
        { x: 900, top: 380, bottom: 500 },
        { x: 1740, top: 370, bottom: 500 },
      ],
      orbs: [
        { x: 950, y: 100, tier: 4, vx: -125 },
        { x: 1650, y: 110, tier: 4, vx: -130 },
        { x: 2250, y: 90, tier: 3, vx: -135 },
      ],
      servers: [
        { x: 320, hp: 4, label: 'LOAD-BALANCER' },
        { x: 1200, hp: 4, label: 'INGRESS-K8S' },
        { x: 2020, hp: 4, label: 'POSTGRES-PROD' },
      ],
      boss: {
        x: 2280,
        y: 340,
        type: 'deploy_terminal',
        hp: 10,
        name: 'PROD DEPLOY TERMINAL',
      },
    },
    {
      name: 'CI/CD RUSH // TRACK 05 [FINAL PRODUCTION GATE]',
      seconds: 72,
      worldWidth: 2400,
      worldHeight: 540,
      floorY: 500,
      platforms: [
        { x: 440, y: 360, width: 210, breakable: true },
        { x: 860, y: 320, width: 230 },
        { x: 1280, y: 370, width: 230, breakable: true },
        { x: 1700, y: 310, width: 240 },
        { x: 2120, y: 360, width: 250 },
      ],
      ladders: [
        { x: 860, top: 320, bottom: 500 },
        { x: 1700, top: 310, bottom: 500 },
        { x: 2120, top: 360, bottom: 500 },
      ],
      orbs: [
        { x: 850, y: 100, tier: 4, vx: -130 },
        { x: 1550, y: 90, tier: 4, vx: -135 },
        { x: 2220, y: 100, tier: 4, vx: -140 },
      ],
      servers: [
        { x: 260, hp: 5, label: 'PRIMARY-AUTH' },
        { x: 1150, hp: 5, label: 'GLOBAL-ROUTER' },
        { x: 1980, hp: 5, label: 'PROD-DATABASE' },
      ],
      boss: {
        x: 2280,
        y: 340,
        type: 'deploy_terminal',
        hp: 12,
        name: 'PROD DEPLOY TERMINAL',
      },
    },
  ],
};

export function getLevel(world: WorldId, stage: number): LevelLayout {
  const safeStage = Math.max(1, Math.min(5, stage));
  return worldLayouts[world][safeStage - 1];
}
