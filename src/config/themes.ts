import type { WorldId } from './constants';

export interface WorldTheme {
  id: WorldId;
  name: string;
  accent: number;
  accentHex: string;
  target: string;
  weapon: string;
  antagonist: string;
  background: string;
}

export const WORLDS: Record<WorldId, WorldTheme> = {
  cybersec: { id: 'cybersec', name: 'CYBERSEC', accent: 0x00f0ff, accentHex: '#00f0ff', target: 'Malware / Botnet Orbs', weapon: 'RJ45 Ethernet Harpoon', antagonist: 'AI Hacker Terminal', background: '0a1620' },
  ai: { id: 'ai', name: 'AI / LLM SEC', accent: 0xc77dff, accentHex: '#c77dff', target: 'Prompt Injection Bubbles', weapon: 'Guardrail Sanitizer Stream', antagonist: 'Rogue LLM Core', background: '170d24' },
  devops: { id: 'devops', name: 'DEVOPS / SRE', accent: 0x7cff6b, accentHex: '#7cff6b', target: 'Bug Orbs / Memory Leaks', weapon: 'Hotfix Git Revert Beam', antagonist: 'Failing CI/CD Pipeline', background: '0d1a12' },
};
