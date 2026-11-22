# PING! Zero-Day — Implementation Plan

## 1. Project Overview

**PING! Zero-Day** is a single-player 2D arcade web game inspired by classic *Pang* (*Buster Bros.*), set across three IT and security worlds (**Cybersec**, **AI / LLM Sec**, and **DevOps / SRE**). It is designed for 60 FPS browser gameplay on both desktop and mobile devices, compiling to static assets with zero external binary dependencies.

## 2. Tech Stack & Architecture

* **Game Engine:** Phaser 3 (latest)

* **Language:** TypeScript (strict mode)

* **Bundler:** Vite

* **Storage:** `localStorage` (high scores per world/mode, audio preferences)

* **Assets:** Hybrid procedural vector-neon (`Phaser.GameObjects.Graphics` baked via `generateTexture()`) + inline Base64 SVGs (`textures.addBase64()`)

* **Audio:** Procedural Web Audio API synthesizer (retro synth SFX + switchable background music sequencer)

* **Deployment Target:** Static hosting (Vercel, Netlify, Cloudflare Pages, or GitHub Pages)

### Directory Structure

```
src/
├── main.ts                 # Phaser Game config & bootstrap (960x540 FIT/AUTO_CENTER)
├── config/
│   ├── constants.ts        # Physics constants, orb tier heights/radii, CVSS colors
│   ├── themes.ts           # Cybersec, AI/LLM Sec, DevOps/SRE palettes & labels
│   └── levels.ts           # Hand-crafted level layouts + endless wave spawner config
├── assets/
│   ├── svgAssets.ts        # Inline SVG strings (hero, antagonist, orb icons, pickups)
│   └── proceduralArt.ts    # Phaser Graphics texture generators (orbs, tiles, cables, FX)
├── audio/
│   └── SynthAudio.ts       # Web Audio API SFX synthesizer & switchable BGM sequencer
├── entities/
│   ├── Player.ts           # Horizontal movement, ladder climbing, shield, i-frames
│   ├── Orb.ts              # Classic Pang fixed-height bounce & 4-tier splitting
│   ├── Harpoon.ts          # Floor-to-ceiling tethered wire + Sticky/Grapple state
│   └── PowerUp.ts          # Falling pickups (Time Freeze, Shield, Multi-Wire, Sticky)
├── scenes/
│   ├── BootScene.ts        # Bake all procedural & SVG textures before menu launch
│   ├── MenuScene.ts        # World selector, Mode selector, High Scores
│   ├── GameScene.ts        # Core loop, collisions, level progression, AI antagonist HUD
│   ├── UIScene.ts          # Overlay HUD (Score, Lives, Timer, Active Weapon, Audio)
│   └── TouchControls.ts    # Auto-detected mobile overlay controls
└── utils/
    └── storage.ts          # localStorage wrapper for high scores & settings

```

## 3. Themes & Visual Design

**Style:** Clean modern vector-neon on a dark terminal grid (`#0a0e17`) with glowing edges and particle bursts.

### Selectable Worlds (`themes.ts`)

Players choose a world from the Main Menu. Each world swaps the color palette, inner orb SVG icon, harpoon visual, background motif, and power-up flavor text:

| World | Orbs (Targets) | Harpoon (Weapon) | Antagonist HUD | 
| ----- | ----- | ----- | ----- | 
| **Cybersec** | Malware / Botnet Orbs (package icon; `CVE-26-XXXX` tag on Tier 4 XL orbs only) | RJ45 Ethernet Harpoon | AI Hacker Terminal | 
| **AI / LLM Sec** | Prompt Injection Bubbles (token / neural node icon) | Guardrail Laser / Sanitizer Stream | Rogue LLM Core | 
| **DevOps / SRE** | Bug Orbs / Memory Leaks (bug / container icon) | Hotfix Tether / Git Revert Beam | Failing CI/CD Pipeline | 

## 4. Core Gameplay & Physics Specifications

### 4.1 Orb Physics & 4-Tier Splitting (`Orb.ts`)

* **Hitbox:** Strictly circular (`body.setCircle(radius)`) to ensure fair, readable arcade dodging.

* **CVSS Color-Coded Tiers:**

  * **Tier 4 (XL - Critical):** `#ff2a55` | Radius: `48px` | Max Bounce Height: `~75%` of arena height

  * **Tier 3 (L - High):** `#ff8c00` | Radius: `32px` | Max Bounce Height: `~58%` of arena height

  * **Tier 2 (M - Medium):** `#ffd700` | Radius: `20px` | Max Bounce Height: `~42%` of arena height

  * **Tier 1 (S - Low):** `#00f0ff` | Radius: `11px` | Max Bounce Height: `~28%` of arena height

* **Fixed-Height Bounce Formula:** On floor or platform top impact, override vertical velocity so every bounce reaches the tier's exact arcade height:
  

  $$
  v_y = -\sqrt{2 \cdot g \cdot h_{\text{tier}}}
  $$

* **Splitting:** Popping an orb of `tier > 1` spawns 2 orbs of `tier - 1` at the impact point with opposite horizontal velocities (`-vx`, `+vx`) and a small upward pop impulse (`vy = -220`). Popping a `Tier 1` orb destroys it completely.

### 4.2 Harpoon / Tethered Wire (`Harpoon.ts`)

* Fires vertically upward from the player's X position, stretching continuously from the floor/platform to its rising tip.

* Any orb touching the tip **or** the vertical wire body pops immediately and destroys that wire.

* **Ceiling / Solid Platform Impact:** Standard wires disappear on impact. **Sticky/Grapple** wires latch for `3.5s` (flashing during the final `1.0s`).

* **Breakable Block Impact:** Destroys the block with a particle burst, awards bonus points, and consumes the wire.

* **Active Wire Limits:** Standard (`1`), Double Wire (`2`), Triple Wire (`3`).

### 4.3 Arena Obstacles

* **Solid Platforms:** Block harpoons from below; support orb bounces and player walking.

* **Breakable Blocks:** Solid until destroyed by a harpoon.

* **Ladders:** Connect floor to platforms; pressing Up/Down while overlapping locks the player to the ladder center for vertical traversal.

### 4.4 Lives, Shield, Power-Ups & Timer

* **Lives:** Start with **3 lives**. Taking a hit without a shield deducts 1 life, resets weapon to Standard Single Wire, and triggers stage reset / brief invulnerability. Game Over at `0` lives.

* **Protection Shield:** Absorbs **1 hit**, shatters with visual/audio feedback, and grants `1.5s` of invulnerability frames (i-frames).

* **Weapon Persistence:** Double, Triple, and Sticky upgrades last until the player is hit or picks up a different weapon.

* **Time Freeze:** Freezes all orbs and the level countdown timer for **10 seconds** with a cyan screen tint and countdown bar.

* **Power-Up Drops:** \~18% drop chance from popped orbs; pickups fall to the floor and despawn after `6s` (blinking before disappearing).

* **Level Countdown Timer:** Per-stage countdown (e.g., 60–90s). Reaching `0` costs 1 life and restarts the stage. Remaining time converts to bonus points on clear.

## 5. Audio Architecture (`SynthAudio.ts`)

Self-contained Web Audio API module (unlocked on first user gesture):

* **SFX:**

  * `playShoot()` — rising zap sweep

  * `playPop(tier)` — noise + sine drop (pitch increases as tier decreases)

  * `playPowerUp()` — ascending arpeggio

  * `playShieldBreak()` — metallic shatter / downward square sweep

  * `playTimeFreeze()` — low-pass filter sweep / freeze chime

  * `playPlayerHit()` / `playGameOver()` — descending arcade synth

  * `playLevelClear()` — celebratory chiptune fanfare

* **Switchable BGM:** Lightweight synthwave bassline + arpeggio step-sequencer with per-world key/tempo variations. Toggleable via HUD buttons and `M` key, persisted in `localStorage`.

## 6. Controls & Responsive Layout

* **Scaling:** `Phaser.Scale.FIT` + `AUTO_CENTER` at `960x540` logical resolution.

* **Auto-Detection:** Check `this.sys.game.device.input.touch` / `window.matchMedia('(pointer: coarse)')`.

  * **Desktop:** `A`/`D` or `Left`/`Right` (move), `W`/`S` or `Up`/`Down` (ladders), `Space` (shoot), `P`/`Esc` (pause), `M` (toggle BGM).

  * **Mobile/Tablet:** Multi-touch-safe neon overlay (`Left`, `Right`, `Up`, `Down` bottom-left; `FIRE` bottom-right).

## 7. Phased Implementation Roadmap

> Status audit (22 November 2026): Phases 1–4 are complete. The project includes the scaffold, assets, physics, obstacles, power-ups, audio, 15 distinct campaign levels, endless mode, menus, HUD, pause controls, and touch controls. The final static production build passes. Deployment is external to this workspace and requires a selected hosting provider and credentials; browser/manual gameplay testing remains the final optional verification step.

### Phase 1: Project Scaffold & Asset Pipeline

* [x] Initialize Vite + TypeScript + Phaser 3 project (`package.json`, `tsconfig.json`, `index.html`).

* [x] Implement `constants.ts`, `themes.ts`, and `storage.ts`.

* [x] Build `svgAssets.ts` and `proceduralArt.ts`, and wire up `BootScene.ts` to bake all textures cleanly.

### Phase 2: Core Mechanics & Physics

* [x] Implement `Player.ts` (movement, bounds, i-frames, shield state, and ladder traversal).

* [x] Implement `Orb.ts` with fixed-height bounce math and 4-tier splitting.

* [x] Implement `Harpoon.ts` with multi-shot limits, Sticky latch state, platform collision, and breakable block destruction.

* [x] Wire up core loop and collisions in `GameScene.ts`.

### Phase 3: Arena Obstacles, Power-Ups & Audio

* [x] Add solid platforms, breakable blocks, and ladder climbing mechanics.

* [x] Implement `PowerUp.ts` (Time Freeze, Shield, Double, Triple, Sticky), drop logic, floor settling, and 6-second blink/despawn lifecycle.

* [x] Build `SynthAudio.ts` with all SFX and a switchable world-varied BGM sequencer.

### Phase 4: Modes, UI & Mobile Support

* [x] Author 5 hand-crafted levels per world (15 total) + Endless Survival wave spawner in `levels.ts`.

* [x] Build `MenuScene.ts`, `UIScene.ts`, world/mode selection, high scores, HUD, audio controls, and pause support.

* [x] Implement `TouchControls.ts` with automatic touch-device detection and pointer-release handling.

### Phase 5: Polish & Verification

* [x] Verify `npm run build` compiles with zero TypeScript errors.

* [ ] Complete manual browser testing across all 3 worlds, fixed-height bounces, splitting edge cases, ladders, audio, and multi-touch controls.

* [ ] Deploy the static build to a selected Vercel, Netlify, or GitHub Pages target.