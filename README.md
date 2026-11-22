# PING-Zero-Day

PING! Zero-Day is a neon 2D arcade game built with TypeScript, Vite, and Phaser 3.

## Features

- Campaign and endless modes
- Three worlds: Cybersec, AI/LLM Security, and DevOps/SRE
- Tiered orb split mechanic (larger orbs split into smaller ones)
- Power-ups: freeze, shield, double/triple/sticky wire
- Procedurally generated textures and retro HUD styling

## Controls

- Move left/right: `A` / `D` or `←` / `→`
- Climb ladder: `W` / `S` or `↑` / `↓`
- Fire wire/harpoon: `Space`
- Toggle music: `M`
- Game over return to menu: `Enter` (or click button)

## Gameplay Notes

- Orbs bounce off floors, platforms, and side walls.
- Stand near a ladder and press up/down to enter climb mode.
- Clearing all active orbs advances the stage.
- If lives reach `0`, the run ends immediately with a game-over screen.

## Run Locally

```sh
npm install
npm run dev
```

## Build for Production

```sh
npm run build
npm run preview
```

The production bundle is emitted to `dist/` and can be deployed to any static host.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: type-check and create production bundle
- `npm run preview`: serve the production build locally
