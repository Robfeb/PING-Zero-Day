# PING! Zero-Day — Implementation Plan (V2)

## 1. Objective & Architecture
**PING! Zero-Day** is a 60 FPS, single-player 2D arcade web game inspired by classic *Pang* (*Buster Bros.*), built with **Phaser 3 + TypeScript + Vite**. It features three visually distinct IT/security worlds (**Cybersec**, **AI / LLM Sec**, **DevOps / SRE**), zero external binary assets, procedural Web Audio synth sound, and automatic desktop/mobile control detection.

### Key Architectural Upgrades Over V1
* **Synchronous Canvas2D Texture Baking:** Eliminate asynchronous `textures.addBase64()` race conditions by drawing all characters, icons, orbs, and UI elements synchronously onto Phaser `CanvasTexture` / `Graphics` objects inside `BootScene.create()`. Every texture must be verified before transitioning to `MenuScene`.
* **Explicit Arcade Physics Overrides:** Do not rely on Phaser's default elastic bounce or auto-locking overlaps. Use deterministic velocity overrides and an explicit player state machine.
* **3-Gate Verification:** Build and test the game in three isolated gates so core physics and visuals are verified before adding levels and modes.

---

## 2. Non-Negotiable Physics & Gameplay Rules

### 2.1 Guaranteed Fixed-Height Orb Bounce (`Orb.ts`)
* **Strict Circular Hitbox:** `body.setCircle(radius)`.
* **CVSS Color-Coded Tiers (Consistent Across All Worlds):**
  * **Tier 4 (XL — Critical):** `#ff2a55` | Radius `44px` | `bounceVy = -680`
  * **Tier 3 (L — High):** `#ff8c00` | Radius `30px` | `bounceVy = -580`
  * **Tier 2 (M — Medium):** `#ffd700` | Radius `19px` | `bounceVy = -480`
  * **Tier 1 (S — Low):** `#00f0ff` | Radius `11px` | `bounceVy = -380`
* **No Floor Sticking:** In `Orb.update()`, explicitly enforce:
  ```ts
  if (body.blocked.down || body.touching.down) {
    body.setVelocityY(this.bounceVy);
  }
  ```
* **Splitting:** Hitting an orb of `tier > 1` destroys it and spawns 2 orbs of `tier - 1` at the impact point with opposite horizontal velocities (`-vx`, `+vx`) and a small upward pop (`vy = -220`). Hitting Tier 1 destroys it completely.

### 2.2 Upward-Growing Tethered Harpoon (`Harpoon.ts`)
* **Anchor & Growth:** Anchor at `(player.x, player.bottom)` with **`setOrigin(0.5, 1)`** so increasing height grows strictly **upward** toward the ceiling.
* **Physics Sync:** Each frame, increase `height += WIRE_SPEED * dt` and update the Arcade Physics body (`body.setSize(6, height)` positioned upward from the anchor) so orbs colliding with *either* the tip or the vertical wire body pop immediately.
* **Tip Visual:** Render a distinct animated tip at `y = anchorY - height` (RJ45 plug / laser emitter / git node).
* **Sticky / Grapple Mode:** Latches to the ceiling or platform underside for `3.5s` (flashing during the final `1.0s`).
* **Active Limits:** Standard (`1`), Double (`2`), Triple (`3`).

### 2.3 Non-Blocking Ladder State Machine (`Player.ts`)
* Overlapping a ladder **never** auto-locks the player.
* Enter `CLIMBING` state **only** when overlapping a ladder AND pressing `Up` or `Down`.
* While `CLIMBING`, center `player.x` smoothly onto `ladder.x` and disable gravity.
* Pressing `Left` or `Right` immediately exits `CLIMBING` when within `14px` of the floor or top platform, restoring normal horizontal movement and gravity.

### 2.4 Lives, Shield, Power-Ups & Timer
* **Lives:** Start at `lives = 3`. On hit without a shield: decrement `lives`, reset weapon to Standard, and trigger **immediate Game Over when `lives <= 0`**.
* **Protection Shield:** Absorbs **1 hit**, shatters with a shockwave + `1.5s` of invulnerability frames (flashing sprite).
* **Weapon Persistence:** Double, Triple, and Sticky upgrades last until hit or replaced.
* **Time Freeze:** Freezes all orbs and the level countdown timer for `10s`.
* **Level Timer:** 60–90s per stage. Reaching `0` deducts 1 life and restarts the stage.

---

## 3. High-Impact Visuals, Art Direction & Arcade "Juice"

### 3.1 Recognizable Character & Entity Art (No Bare Circles)
* **The Hero (`Player.ts`):**
  * Draw a crisp, stylized **Cybersec/Sysadmin vector character** (`32x48px`) with a glowing cyan visor/headset, dark tech jacket, and distinct legs/arms.
  * **Animations:** 4-frame walk cycle (leg stride + slight bob), climbing pose, and an upward-aiming firing pose when launching a harpoon.
  * **Active Shield Visual:** Rotating segmented neon-cyan hexagonal/circular **WAF Shield** aura around the hero.
* **Multi-Layered Neon Orbs (`Orb.ts`):**
  * Each orb has: (1) an additive-blended outer glow halo, (2) a crisp bright neon rim, (3) a dark translucent core with a subtle glass highlight, and (4) a **centered white world-specific icon** that rotates gently as the orb moves.
  * Display a legible `CVE` badge on Tier 4 XL orbs in Cybersec mode.

### 3.2 Distinct World Environments & Reactive Antagonists
Each world must feel like a completely different arena—not just a color tint:

| World | Animated Background Environment | Reactive Antagonist (Top-Center HUD) | Inner Orb Icon | Harpoon Visual |
| :--- | :--- | :--- | :--- | :--- |
| **Cybersec** | Dark server-rack silhouettes with blinking green/amber status LEDs + subtle scrolling hex/packet rain | **AI Hacker Terminal** (glitching skull/visor face that laughs on player hit and glitches on orb pop) | Package / Payload box (+ `CVE` on XL) | Coiled Cat6 Ethernet cable + glowing RJ45 plug |
| **AI / LLM Sec** | Floating neural network nodes connected by pulsing synaptic lines | **Rogue LLM Core** (pulsing geometric eye that tracks the player's X position) | Neural token / spark node | High-energy magenta/cyan Guardrail Laser |
| **DevOps / SRE** | Scrolling CI/CD pipeline stages (`BUILD → TEST → FAIL`) with rotating warning beacons | **Incident Dashboard** (flashing `500 / P0` alert banner that reacts to combos) | Bug / Container cube | Glowing amber Hotfix Tether + Git commit node |

### 3.3 Impactful VFX & Tactile "Juice"
* **Orb Pop Explosions:**
  * Expanding neon **shockwave ring** (scales from `0.5x` to `2.2x` and fades out over `220ms`).
  * Directional **spark & pixel-shard particle burst** (`12–24` particles using `Phaser.BlendModes.ADD`) matching the orb's CVSS color.
* **Hit-Stop & Camera Shake:**
  * Brief `30ms` hit-stop (micro-freeze) on Tier 4 pops or player hits for arcade impact.
  * Scaled `cameras.main.shake()` (`0.004` for Tier 3/4 pops, `0.012` for shield shatter or player hit).
* **Floating Combat Text:**
  * Crisp monospace pop-ups (`+500`, `x3 COMBO!`, `PATCHED!`, `WAF BROKEN!`, `FREEZE 10s`) that float upward and fade out.
* **Harpoon Energy Pulse:**
  * Bright data-packet pulse traveling up the active wire, plus a spark shower when hitting the ceiling or shattering a breakable block.
* **Time Freeze Atmosphere:**
  * Translucent icy-cyan vignette overlay, subtle scanline pulse, and a sleek draining progress bar at the top of the arena.
* **Breakable Block Shatter:**
  * Cracked neon blocks visibly fracture and burst into tumbling neon fragments when hit by a harpoon.

---

## 4. Audio Architecture (`SynthAudio.ts`)
Self-contained Web Audio API module (unlocked on first user interaction):
* **SFX:** `playShoot()`, `playPop(tier)` (pitch scales up as tier shrinks), `playPowerUp()`, `playShieldBreak()`, `playTimeFreeze()`, `playBlockBreak()`, `playPlayerHit()`, `playGameOver()`, `playLevelClear()`.
* **Switchable BGM:** Synthwave bassline + arpeggio step-sequencer with unique tempo/key per world. Toggleable via HUD button and `M` key, saved in `localStorage`.

---

## 5. Controls & Responsive Layout
* **Viewport:** `960x540` logical resolution, `Phaser.Scale.FIT` + `AUTO_CENTER`.
* **Auto-Detection:** Check `this.sys.game.device.input.touch` / `window.matchMedia('(pointer: coarse)')`.
  * **Desktop:** `A`/`D` or `Left`/`Right` (move), `W`/`S` or `Up`/`Down` (ladders), `Space` (fire), `P`/`Esc` (pause), `M` (BGM toggle).
  * **Mobile/Tablet:** Multi-touch-safe glowing neon overlay (`Left`, `Right`, `Up`, `Down` bottom-left; `FIRE` bottom-right).

---

## 6. Strict 3-Gate Implementation Roadmap

### Gate 1 — Core *Pang* Sandbox & Visual Punch (Open Arena Only)
* [x] Scaffold Vite + TypeScript + Phaser 3 project.
* [x] Implement synchronous Canvas2D texture baking in `BootScene.ts` for the animated Hero, 4-tier CVSS Orbs (with Cybersec package icons), RJ45 Harpoon, and Cybersec server-rack background.
* [x] Implement `Orb.ts` (guaranteed fixed-height bounce + 4-tier splitting) and `Harpoon.ts` (upward-growing from floor, full-wire collision).
* [x] Add pop VFX (shockwave rings, additive spark particles, floating score text, subtle camera shake).
* [x] Implement 3 lives + immediate Game Over at `lives <= 0`.

> Gate 1 status (22 November 2026): Implemented and verified with `npm run build`.

### Gate 2 — Obstacles, Power-Ups & Synth Audio
* [x] Add solid platforms, breakable blocks (with shatter VFX), and non-blocking ladders (`CLIMBING` state machine).
* [x] Implement `PowerUp.ts` (10s Time Freeze with frost overlay, 1-hit WAF Shield with aura, Double/Triple/Sticky wires) and level countdown timer.
* [x] Build `SynthAudio.ts` with all retro synth SFX and switchable BGM.

> Gate 2 status (22 November 2026): Implemented and verified with `npm run build`.

### Gate 3 — All 3 Worlds, Modes & Mobile Polish
* [x] Build distinct backgrounds, reactive antagonists, orb icons, and harpoon styles for **AI / LLM Sec** and **DevOps / SRE**.
* [x] Author 5 hand-crafted Campaign levels per world (15 total) + Endless Survival wave spawner.
* [x] Build `MenuScene.ts` (world/mode selector, `localStorage` high scores), `UIScene.ts`, and `TouchControls.ts`.
* [x] Verify `npm run build` compiles with zero TypeScript errors.

> Gate 3 status (22 November 2026): Implemented and verified with `npm run build`. All three gates are complete.