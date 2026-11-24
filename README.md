# PING! Zero-Day ⚡

> **Cybernetic Arcade Defense Protocol** built with TypeScript, Phaser 3, and Vite.  
> Inspired by retro arcade classics like *Pang* (*Buster Bros*), modernized with high-voltage neon cyberpunk aesthetics, real-world cyber threat vectors, defensive server infrastructure, and three completely distinct gameplay formats.

---

## 🎮 Key Features

### 1. Stylized Arcade Comic-Book Hero Sprite
- **Expressive Comic Art Style**: Redesigned from geometric shapes into an energetic, hand-inked retro-arcade comic book hero (inspired by classic Capcom/SNK sprites and cyberpunk graphic novels).
- **Bold Comic Inking & Cel-Shading**: 2px dark comic contours, warm anime skin cel-tones, vivid electric cyan spiky hair with specular white spike gleams, and a glowing neon magenta cyber visor with specular reflection slashes (`//`).
- **Dynamic Wind-Blown Crimson Scarf**: Multi-layered crimson hero scarf that billows and whips with aerodynamic motion waves during running, jumps, and firing recoil.
- **Plasma Thruster Jump**: Leap into the air (<kbd>W</kbd> or <kbd>↑</kbd>) with tucked athletic knees and dual boot thruster flame cones (white core + neon cyan plasma + fiery comic spark jets).
- **High-Tech Arsenal & Starburst Muzzle Flash**: Low-ready plasma buster in standard movement; when firing straight up (<kbd>Space</kbd>), character locks into a braced power stance with an explosive 8-point comic starburst muzzle flare.
- **Tactical Cyberdeck & Climbing Pose**: Rear-view sprite for ladder climbing with an active Cyberdeck backpack featuring multi-color status LED readouts and gloved rung grip.
- **Comic Bust HUD Sticker Badge**: Stylized character portrait badge for active node/life tracking.

### 2. Dual Aiming Modes & Unlimited Roof-Fixed Harpoons
- **Default Precision Aim (Straight Up ⇡)**: Harpoons shoot straight vertical by default for classic pinpoint anti-air precision.
- **Angled Free-Aim Toggle (<kbd>T</kbd> / HUD Button ⤢)**: Switch anytime to directional aiming. Shoot diagonally while running left/right (`-33°` / `+33°`) or aim freely with mouse cursor / touch coords (`-70°` to `+70°`).
- **Unlimited Roof-Fixed Harpoons**: Harpoons that reach the ceiling or solid platforms anchor firmly in place as persistent tripwires! You can deploy **infinite fixed harpoons** to weave a dense protective laser net across the arena.

### 3. Vertical "PATCH" Bullet Weapon & Hot-Swapping
- **Vertical "PATCH" Bullet**: Fire rapid vertical projectile rounds where the word **PATCH** is oriented vertically in glowing cyberpunk typography.
- **Dual-Purpose Munitions**: Blasts and splits threat packages, inflicts heavy damage on AI/DevOps boss cores, and **repairs damaged server racks (+1 HP)**!
- **Instant Weapon Toggling (<kbd>Q</kbd> / <kbd>E</kbd> / HUD Button / Touch `[ ⇄ WPN ]`)**: Seamlessly switch between Harpoon wire configurations and the PATCH Blaster mid-combat.

### 4. Real CVE Threat Packages
- Scaled cyber threat crates with glowing hazard decals, status runes, and real-world vulnerability tags:
  - **Tier 4 (Radius 52px)**: `CVE-2026-0DAY`, `CRITICAL RCE`, `SUPPLY CHAIN`
  - **Tier 3 (Radius 38px)**: `CVE-2024-3094`, `XZ-BACKDOOR`, `POISON WEIGHT`
  - **Tier 2 (Radius 26px)**: `LOG4J-JNDI`, `PROMPT INJECT`, `K8S ESCAPE`
  - **Tier 1 (Radius 16px)**: `DOS PING`, `SQL INJECT`, `MEM LEAK`

### 5. Critical Server Defense & Rooftop Tactical High Ground
- **Walk on Top of Servers**: Operatives can jump through and walk firmly on top of server rack roofs for tactical high ground.
- **Server Fortification Items & Weapons**:
  - Deployable **WAF Firewall Shields** wrap servers in energy dome barriers that absorb orb impacts without losing HP.
  - Shooting servers with **PATCH bullets** repairs damaged infrastructure (+1 HP) or adds shield layers.
  - Anchoring roof harpoons directly above servers creates a protective tripwire canopy.
- **Continuous Combat on Node Loss (3 Nodes)**: When taking damage, the game **continues seamlessly in the exact same state** (orbs, servers, timer, and score remain uninterrupted) with 3.5s of blinking i-frames. No stage reset until the final 3rd node is lost!
- **Off-Screen Immunity**: In scrolling worlds (AI Tower and DevOps Rush), servers are 100% safe when off-screen.
- **Survival Bonus**: Every server remaining operational awards **+1,000 bonus points** upon stage clear.

### 6. Three Distinct Mission Sectors

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
| **Fire Active Weapon** | <kbd>SPACE</kbd> or Left Click | `[ ⚡ FIRE ]` / `↖` / `↗` Buttons |
| **Toggle Weapon (RJ45 ⇄ PATCH)** | <kbd>Q</kbd>, <kbd>E</kbd>, or <kbd>X</kbd> | `[ ⇄ WPN ]` HUD Button |
| **Toggle Aim Mode (Vertical ⇄ Angled)** | <kbd>V</kbd> or <kbd>T</kbd> | `[ ⇡ AIM ]` HUD Button |
| **Toggle Diagnostics Logs Console** | <kbd>L</kbd> or <kbd>`</kbd> (Backtick) | `[ 📋 LOGS ]` HUD Button |
| **Reset Current Stage** | <kbd>R</kbd> | `[ ↺ RESET ]` HUD Button |
| **Toggle Music (Random Track)** | <kbd>M</kbd> | `[ BGM ♫ ]` HUD Button |
| **Mission Pause / Resume** | <kbd>P</kbd> or <kbd>ESC</kbd> | `[ \|\| ]` HUD Button |
| **Menu: Navigate Rows / Options** | <kbd>W</kbd>/<kbd>S</kbd> or <kbd>↑</kbd>/<kbd>↓</kbd>, <kbd>A</kbd>/<kbd>D</kbd> or <kbd>←</kbd>/<kbd>→</kbd> | Point & Click |
| **Menu: Direct Sector Select** | <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> (or Numpad) | Click Sector Card |
| **Menu: Protocol Mode Select** | <kbd>C</kbd> (Campaign), <kbd>E</kbd> (Endless) | Click Mode Button |
| **Menu: Confirm / Deploy** | <kbd>ENTER</kbd> or <kbd>SPACE</kbd> | `[ ▶ DEPLOY SYSTEM ]` Button |
| **Bootcamp Wizard Walkthrough** | <kbd>H</kbd> (Toggle), <kbd>ESC</kbd> (Close) | `[ ? HOW TO PLAY ]` Button |

---

## ⚡ Arsenal, Defense & Power-Ups

- **5 Operative Nodes (Lives)**: Operatives start with 5 node lives. Taking damage triggers 3.5 seconds of blinking i-frame invulnerability while action continues seamlessly without stage reloads until all 5 nodes are lost.
- **Infinite Fixed Ceiling Harpoons**: Harpoons that anchor into the ceiling remain fixed permanently! Operatives can fire unlimited harpoons to establish a continuous defensive tripwire canopy across the stage.
- **Vertical "PATCH" Blaster [Q / E / X]**: High-speed vertical kinetic pulses that spell `P-A-T-C-H`. Shreds falling threats, deals heavy damage to sector bosses, and automatically repairs/fortifies damaged server clusters (`+1 HP`).
- **Server Rack Platforms & Fortification**: Operatives can jump onto server racks and walk across their rooftops as tactical high-ground platforms. Server infrastructure can be fortified with **Firewall Dome Shields** and restored with **PATCH** bullets.
- **Real-Time Diagnostics Console [L / `]**: In-game audit log and telemetry screen showing live FPS, physics bodies, entity counts, audio status, and error detection to monitor stability.
- **Bounded Ladder Climbing**: Operatives climb smoothly within ladder bounds; reaching the top safely steps the hero onto the platform without climbing into empty air.
- **Time Freeze (10s)**: Halts all bouncing packets; HUD countdown bar with cryo-glitch overlay.
- **WAF Shield**: Deploy a rotating hexagonal energy barrier that absorbs 1 fatal collision.
- **Dual Harpoon**: Fire two concurrent fiber beams.
- **Triple Harpoon**: Fire three spread-shot fiber beams.
- **Sticky Grapple**: Harpoons anchor to ceilings or platforms to trap threats.

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
