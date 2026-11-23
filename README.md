# PING! Zero-Day ⚡

> **Cybernetic Arcade Defense Protocol** built with TypeScript, Phaser 3, and Vite.  
> Inspired by retro arcade classics like *Pang* (*Buster Bros*), modernized with high-voltage neon cyberpunk aesthetics, real-world cyber threat vectors, defensive server infrastructure, and three completely distinct gameplay formats.

---

## 🎮 Key Features

### 1. Cyber Operative with Plasma Thruster Jump
- **Plasma Thruster Jump**: Leap into the air with dual jet thrusters in your active movement direction (<kbd>W</kbd> or <kbd>↑</kbd>). Dodge bounding packets, escape tight corners, and leap between high platforms.
- **Climbing Conduits**: Mount vertical conduits and ladders to navigate multi-tiered environments.

### 2. Dual Aiming Modes (Vertical Default & Angled Free-Aim)
- **Default Precision Aim (Straight Up ⇡)**: Harpoons shoot straight vertical by default for classic pinpoint anti-air precision.
- **Angled Free-Aim Toggle (<kbd>T</kbd> / HUD Button ⤢)**: Switch anytime to directional aiming. Shoot diagonally while running left/right (`-33°` / `+33°`) or aim freely with mouse cursor / touch coords (`-70°` to `+70°`).

### 3. Real CVE Threat Packages
- Scaled cyber threat crates with glowing hazard decals, status runes, and real-world vulnerability tags:
  - **Tier 4 (Radius 52px)**: `CVE-2026-0DAY`, `CRITICAL RCE`, `SUPPLY CHAIN`
  - **Tier 3 (Radius 38px)**: `CVE-2024-3094`, `XZ-BACKDOOR`, `POISON WEIGHT`
  - **Tier 2 (Radius 26px)**: `LOG4J-JNDI`, `PROMPT INJECT`, `K8S ESCAPE`
  - **Tier 1 (Radius 16px)**: `DOS PING`, `SQL INJECT`, `MEM LEAK`

### 4. Critical Server Infrastructure Defense
- Grounded **Server Racks** deployed across all worlds with 4-HP impact capacity.
- Servers feature 4 animated damage states: Normal, Damaged, Critical, and Offline.
- **Off-Screen Immunity**: In scrolling worlds (AI Tower and DevOps Rush), servers are 100% safe when off-screen.
- **Survival Bonus**: Every server remaining operational awards **+1,000 bonus points** upon stage clear.

### 5. Three Distinct Mission Sectors

| Sector | Arena Dimensions | Camera Dynamic | Mission Objective |
| :--- | :--- | :--- | :--- |
| **Cybersec Defense** | `960 x 540` | Fixed Arena | Defend server clusters from falling zero-days; bypass breakable firewalls. |
| **AI / LLM Security** | `960 x 1500` | Vertical Ascent | Screen tracks upward as you climb 1,500px of ladders and platforms. Dodge falling tokens and destroy the giant **[ ROGUE TOKENS CORE ]** at the summit! |
| **DevOps / SRE** | `2400 x 540` | Horizontal Rush | Side-scrolling sprint across 2,400px of staging clusters. Leap over gaps and blast open the **[ PROD DEPLOY TERMINAL GATE ]**! |

### 6. Interactive System Bootcamp / Tutorial Wizard
- Press `[ ? HOW TO PLAY // SYSTEM BOOTCAMP WIZARD ]` on the menu (or hit <kbd>H</kbd>) for a 4-step illustrated interactive walkthrough:
  1. Operative Controls & Plasma Thruster Jump
  2. Vertical Default vs. Angled Aiming Modes
  3. CVE Threat Crates & Server Preservation
  4. The 3 Distinct Mission Formats

### 7. Procedural Synthwave Audio & Sound Engine
- **6 Procedural BGM Tracks**: Dark Synth (D-Min), Neon Outrun (A-Min), Cyber Acid (B-Min), AI Synapse (E-Phrygian), DevOps Drive (G-Min), and Zero-Day Protocol (F-Min).
- **Random Track Generator**: Automatically randomizes a fresh track every time sound is unmuted.
- Full SFX suite: Jump thrusters, RJ45 shots, orb splits, server impacts, boss hits, boss destruction explosions, shield breaks, and time freezes.

---

## 🕹️ Controls Reference

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> | `◀` / `▶` Buttons |
| **Plasma Thruster Jump** | <kbd>W</kbd> or <kbd>↑</kbd> | `[ ⤒ JUMP ]` Button |
| **Climb Ladders / Conduits** | <kbd>W</kbd> (Up) / <kbd>S</kbd> (Down) | `▲` / `▼` Buttons |
| **Fire Harpoon** | <kbd>SPACE</kbd> or Click | `[ ⚡ FIRE ]` / `↖` / `↗` Buttons |
| **Toggle Aim Mode** | <kbd>T</kbd> | `[ ⇡ AIM ]` HUD Button |
| **Reset Current Stage** | <kbd>R</kbd> | `[ ↺ RESET ]` HUD Button |
| **Toggle Music (Random Track)** | <kbd>M</kbd> | `[ BGM ♫ ]` HUD Button |
| **Mission Pause / Resume** | <kbd>P</kbd> or <kbd>ESC</kbd> | `[ \|\| ]` HUD Button |
| **Open Bootcamp Wizard** | <kbd>H</kbd> (Menu) | `[ ? HOW TO PLAY ]` Button |

---

## ⚡ Power-Ups

- **Time Freeze (10s)**: Halts all bouncing packets; HUD countdown bar with cryo-glitch overlay.
- **WAF Shield**: Deploy a rotating hexagonal energy barrier that absorbs 1 fatal collision.
- **Dual Harpoon**: Fire two concurrent fiber beams.
- **Triple Harpoon**: Fire three spread-shot fiber beams.
- **Sticky Grapple**: Harpoons anchor to ceilings or platforms for 3.5s to trap threats.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/your-username/PING-Zero-Day.git
cd PING-Zero-Day
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```
The optimized bundle will be compiled into `dist/`.

---

## 🛠️ Tech Stack

- **Engine**: Phaser 3 / 4
- **Language**: TypeScript
- **Bundler**: Vite
- **Asset Pipeline**: Pure procedural 2D canvas synthesis (zero binary image dependencies)
- **Audio Engine**: Web Audio API Procedural Synthesizer
