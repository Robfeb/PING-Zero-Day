import Phaser from 'phaser';
import { getHighScore } from '../utils/storage';
import { WORLDS } from '../config/themes';
import type { WorldId, GameMode } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  private world: WorldId = 'cybersec';
  private mode: GameMode = 'campaign';
  private cards: Record<WorldId, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }> = {} as any;
  private modeButtons: Record<GameMode, { text: Phaser.GameObjects.Text; bg: Phaser.GameObjects.Graphics }> = {} as any;
  private highText?: Phaser.GameObjects.Text;
  private wizardContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('Menu');
  }

  create(): void {
    const cx = 480;
    this.cameras.main.setBackgroundColor('#040812');

    // 1. Dynamic Animated Synthwave Floor Grid
    const grid = this.add.graphics().setDepth(-5);
    grid.lineStyle(1, 0x00f0ff, 0.14);
    const horizonY = 320;
    for (let y = horizonY; y <= 540; y += Math.max(10, (y - horizonY) * 0.45)) {
      grid.lineBetween(0, y, 960, y);
    }
    for (let x = -150; x <= 1110; x += 60) {
      grid.lineBetween(cx + (x - cx) * 0.12, horizonY, x, 540);
    }

    // Drifting Cyber Particles
    const particles = this.add
      .particles(cx, 160, 'particle', {
        speed: { min: 10, max: 40 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 2500,
        frequency: 180,
        tint: 0x00f0ff,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(-4);

    this.events.on('shutdown', () => particles.destroy());

    // 2. High-Impact Retro Arcade Neon Logo
    // Chromatic glitch shadow
    this.add
      .text(cx + 3, 44, 'PING!', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '56px',
        color: '#ff007f',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setAlpha(0.6);

    // Main Logo
    this.add
      .text(cx, 42, 'PING!', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '56px',
        color: '#00f0ff',
        fontStyle: '900',
        stroke: '#020b16',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(cx, 90, 'ZERO-DAY // CYBERNETIC ARCADE PROTOCOL', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '14px',
        color: '#ff2a55',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 3. SELECT SECTOR (World Cards)
    this.add
      .text(cx, 132, 'SELECT TARGET SECTOR', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '12px',
        color: '#9aa8b8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const worldIds: WorldId[] = ['cybersec', 'ai', 'devops'];
    const cardWidth = 270;
    const cardHeight = 110;
    const startX = cx - (cardWidth * 1.5 + 20) + cardWidth / 2;

    worldIds.forEach((id, idx) => {
      const theme = WORLDS[id];
      const cardX = startX + idx * (cardWidth + 20);
      const cardY = 205;

      const container = this.add.container(cardX, cardY);
      const bg = this.add.graphics();
      container.add(bg);

      // Title
      const title = this.add
        .text(0, -32, theme.name, {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '15px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add(title);

      // Weapon
      const weapon = this.add
        .text(0, -8, `WEAPON: ${theme.weapon}`, {
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: theme.accentHex,
        })
        .setOrigin(0.5);
      container.add(weapon);

      // Target
      const target = this.add
        .text(0, 12, `THREAT: ${theme.target}`, {
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: '#8da0b4',
        })
        .setOrigin(0.5);
      container.add(target);

      // High Score label inside card
      const hiScore = getHighScore(id, this.mode);
      const hi = this.add
        .text(0, 32, `RECORD: ${String(hiScore).padStart(6, '0')}`, {
          fontFamily: "'Orbitron', monospace",
          fontSize: '10px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
      container.add(hi);

      // Hit area for interaction
      const hitZone = this.add
        .zone(0, 0, cardWidth, cardHeight)
        .setRectangleDropZone(cardWidth, cardHeight)
        .setInteractive();
      container.add(hitZone);

      hitZone.on('pointerdown', () => {
        this.world = id;
        this.updateSelection();
      });

      this.cards[id] = { container, bg };
    });

    // 4. SELECT PROTOCOL (Mode Buttons)
    this.add
      .text(cx, 285, 'EXECUTION PROTOCOL', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '12px',
        color: '#9aa8b8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const modes: Array<{ id: GameMode; label: string; x: number }> = [
      { id: 'campaign', label: 'CAMPAIGN // 5 STAGES', x: cx - 140 },
      { id: 'endless', label: 'ENDLESS // SURVIVAL', x: cx + 140 },
    ];

    modes.forEach((m) => {
      const bg = this.add.graphics();
      const text = this.add
        .text(m.x, 320, m.label, {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive();

      text.on('pointerdown', () => {
        this.mode = m.id;
        this.updateSelection();
      });

      this.modeButtons[m.id] = { text, bg };
    });

    // High Score Summary Bar
    this.highText = this.add
      .text(cx, 375, '', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '13px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 5. Pulsing "DEPLOY SYSTEM" Button
    const launchBtn = this.add
      .text(cx, 435, '▶ DEPLOY SYSTEM [ INSERT COIN ]', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '16px',
        color: '#050c18',
        backgroundColor: '#00f0ff',
        fontStyle: 'bold',
        padding: { x: 26, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.tweens.add({
      targets: launchBtn,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    launchBtn.on('pointerover', () => launchBtn.setBackgroundColor('#ffffff'));
    launchBtn.on('pointerout', () => launchBtn.setBackgroundColor('#00f0ff'));
    launchBtn.on('pointerdown', () => this.startGame());

    // 6. Interactive "HOW TO PLAY / SYSTEM BOOTCAMP" Button
    const wizardBtn = this.add
      .text(cx, 488, '? HOW TO PLAY // SYSTEM BOOTCAMP WIZARD', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#00f0ff',
        backgroundColor: '#071626',
        stroke: '#00f0ff',
        strokeThickness: 1,
        padding: { x: 16, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();

    wizardBtn.on('pointerover', () => {
      wizardBtn.setBackgroundColor('#102d4e');
      wizardBtn.setColor('#ffffff');
    });
    wizardBtn.on('pointerout', () => {
      wizardBtn.setBackgroundColor('#071626');
      wizardBtn.setColor('#00f0ff');
    });
    wizardBtn.on('pointerdown', () => this.openWizard(0));

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.on('keydown-H', () => this.openWizard(0));

    this.updateSelection();
  }

  private openWizard(step: number): void {
    if (this.wizardContainer) {
      this.wizardContainer.destroy();
      this.wizardContainer = undefined;
    }

    const cx = 480;
    const cy = 270;
    const w = 700;
    const h = 430;

    this.wizardContainer = this.add.container(0, 0).setDepth(200);

    // Dimmed background backdrop
    const backdrop = this.add
      .rectangle(cx, cy, 960, 540, 0x020610, 0.92)
      .setInteractive();
    this.wizardContainer.add(backdrop);

    // Main modal window panel
    const panel = this.add.graphics();
    panel.fillStyle(0x061120, 0.98);
    panel.fillRect(cx - w / 2, cy - h / 2, w, h);

    panel.lineStyle(2, 0x00f0ff, 0.85);
    panel.strokeRect(cx - w / 2, cy - h / 2, w, h);

    // Glowing corner brackets
    panel.fillStyle(0x00f0ff, 1);
    panel.fillRect(cx - w / 2, cy - h / 2, 16, 3);
    panel.fillRect(cx - w / 2, cy - h / 2, 3, 16);
    panel.fillRect(cx + w / 2 - 16, cy - h / 2, 16, 3);
    panel.fillRect(cx + w / 2 - 3, cy - h / 2, 3, 16);
    panel.fillRect(cx - w / 2, cy + h / 2 - 3, 16, 3);
    panel.fillRect(cx - w / 2, cy + h / 2 - 16, 3, 16);
    panel.fillRect(cx + w / 2 - 16, cy + h / 2 - 3, 16, 3);
    panel.fillRect(cx + w / 2 - 3, cy + h / 2 - 16, 3, 16);
    this.wizardContainer.add(panel);

    // Modal Title Bar
    const title = this.add
      .text(cx, cy - h / 2 + 28, 'SYSTEM BOOTCAMP // OPERATIVE PROTOCOL', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '16px',
        color: '#00f0ff',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.wizardContainer.add(title);

    // Step Progress Dots
    let dotStr = '';
    for (let i = 0; i < 4; i++) {
      dotStr += i === step ? '●  ' : '○  ';
    }
    const dots = this.add
      .text(cx, cy - h / 2 + 52, `STAGE ${step + 1} OF 4   [ ${dotStr.trim()} ]`, {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.wizardContainer.add(dots);

    // Step Specific Content
    const contentBoxY = cy - 40;

    if (step === 0) {
      // 1. Controls & Plasma Jump
      const h1 = this.add
        .text(cx, contentBoxY - 40, '1. OPERATIVE MOVEMENT & PLASMA JET JUMP', {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.wizardContainer.add(h1);

      const desc = this.add
        .text(
          cx,
          contentBoxY + 35,
          `• [ A ] / [ D ] or [ ◀ ] / [ ▶ ]  : Move Operative horizontally\n` +
            `• [ W ] or [ ▲ ]              : PLASMA THRUSTER JUMP! (Leaps in your movement direction)\n` +
            `• [ W ] / [ S ] on Ladders    : Climb vertical cyber conduits and platforms\n` +
            `• [ SPACE ] or [ ⚡ FIRE ]     : Shoot high-frequency fiber-optic harpoon\n\n` +
            `PRO TIP: Jump across moving CVE threat orbs to dodge damage and reach high vantage points!`,
          {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: '#bdfcff',
            lineSpacing: 8,
            align: 'center',
          },
        )
        .setOrigin(0.5);
      this.wizardContainer.add(desc);
    } else if (step === 1) {
      // 2. Aim Modes (Default Vertical + Angled)
      const h1 = this.add
        .text(cx, contentBoxY - 40, '2. DEFAULT VERTICAL & ANGLED FREE-AIM', {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.wizardContainer.add(h1);

      const desc = this.add
        .text(
          cx,
          contentBoxY + 35,
          `• DEFAULT AIM [ ⇡ VERTICAL ]:\n` +
            `  Harpoons shoot straight UP for classic arcade pinpoint accuracy.\n\n` +
            `• ANGLED AIM TOGGLE [ T ] / [ ⤢ AIM BUTTON ]:\n` +
            `  Toggle directional mode to fire angled beams while running left or right!\n` +
            `  Supports mouse cursor aiming (-70° to +70°) and touch direction clusters.\n\n` +
            `Switch modes anytime mid-combat depending on the threat trajectory!`,
          {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: '#bdfcff',
            lineSpacing: 8,
            align: 'center',
          },
        )
        .setOrigin(0.5);
      this.wizardContainer.add(desc);
    } else if (step === 2) {
      // 3. Real CVE Threats & Infrastructure Defense
      const h1 = this.add
        .text(cx, contentBoxY - 40, '3. CVE THREAT PACKAGES & SERVER DEFENSE', {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.wizardContainer.add(h1);

      const desc = this.add
        .text(
          cx,
          contentBoxY + 35,
          `• PACKAGES CARRY REAL VULNERABILITIES:\n` +
            `  Shoot Tier 4 (CVE-2026-0DAY) to split into Tier 3 (CRITICAL RCE), Tier 2 (LOG4J),\n` +
            `  and Tier 1 (DOS PING) until completely eliminated!\n\n` +
            `• CRITICAL SERVER INFRASTRUCTURE DEFENSE:\n` +
            `  Ground server racks can withstand 4 impacts before going offline.\n` +
            `  Protect your servers! Each surviving server awards +1,000 pts bonus upon stage clear!`,
          {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: '#bdfcff',
            lineSpacing: 8,
            align: 'center',
          },
        )
        .setOrigin(0.5);
      this.wizardContainer.add(desc);
    } else {
      // 4. Distinct Dynamics: Cybersec, AI Tower, DevOps Rush
      const h1 = this.add
        .text(cx, contentBoxY - 40, '4. THREE DISTINCT COMBAT EXPERIENCES', {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.wizardContainer.add(h1);

      const desc = this.add
        .text(
          cx,
          contentBoxY + 35,
          `• CYBERSEC ARENA : Classic Pang defense with breakable firewalls and server hubs.\n\n` +
            `• AI TOWER ASCENT : Vertical escape! The screen scrolls as you climb 1,500px up ladders.\n` +
            `  Dodge falling tokens and destroy the giant [ ROGUE TOKENS CORE ] at the top!\n\n` +
            `• DEVOPS CI/CD RUSH : Horizontal sprint! Dash 2,400px to the right, leap over obstacles,\n` +
            `  and blast through the [ PROD DEPLOY TERMINAL GATE ] to ship the hotfix!`,
          {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12.5px',
            color: '#bdfcff',
            lineSpacing: 7,
            align: 'center',
          },
        )
        .setOrigin(0.5);
      this.wizardContainer.add(desc);
    }

    // Modal Action Buttons at Bottom
    const btnY = cy + h / 2 - 38;

    if (step > 0) {
      const prevBtn = this.add
        .text(cx - 160, btnY, '◀ PREVIOUS', {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#00f0ff',
          backgroundColor: '#0a1a2e',
          padding: { x: 14, y: 7 },
        })
        .setOrigin(0.5)
        .setInteractive();

      prevBtn.on('pointerdown', () => this.openWizard(step - 1));
      this.wizardContainer.add(prevBtn);
    }

    if (step < 3) {
      const nextBtn = this.add
        .text(cx + 160, btnY, 'NEXT STAGE ▶', {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#050c18',
          backgroundColor: '#00f0ff',
          fontStyle: 'bold',
          padding: { x: 16, y: 7 },
        })
        .setOrigin(0.5)
        .setInteractive();

      nextBtn.on('pointerdown', () => this.openWizard(step + 1));
      this.wizardContainer.add(nextBtn);
    } else {
      const deployFromWizard = this.add
        .text(cx + 160, btnY, '▶ DEPLOY NOW', {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#050c18',
          backgroundColor: '#39ff14',
          fontStyle: 'bold',
          padding: { x: 16, y: 7 },
        })
        .setOrigin(0.5)
        .setInteractive();

      deployFromWizard.on('pointerdown', () => {
        this.closeWizard();
        this.startGame();
      });
      this.wizardContainer.add(deployFromWizard);
    }

    // Close Button (Center)
    const closeBtn = this.add
      .text(cx, btnY, '✖ CLOSE', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#ff2a55',
        backgroundColor: '#1b0912',
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setInteractive();

    closeBtn.on('pointerdown', () => this.closeWizard());
    this.wizardContainer.add(closeBtn);
  }

  private closeWizard(): void {
    if (this.wizardContainer) {
      this.wizardContainer.destroy();
      this.wizardContainer = undefined;
    }
  }

  private updateSelection(): void {
    const cardWidth = 270;
    const cardHeight = 110;

    (Object.keys(this.cards) as WorldId[]).forEach((id) => {
      const card = this.cards[id];
      const isSelected = this.world === id;
      const theme = WORLDS[id];

      card.bg.clear();
      // Glass fill
      card.bg.fillStyle(isSelected ? 0x0e1c2e : 0x07111c, 0.9);
      card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

      // Border
      card.bg.lineStyle(isSelected ? 2.5 : 1, theme.accent, isSelected ? 1 : 0.35);
      card.bg.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

      if (isSelected) {
        // Glowing corner brackets
        card.bg.fillStyle(theme.accent, 1);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 10, 3);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 3, 10);
        card.bg.fillRect(cardWidth / 2 - 10, -cardHeight / 2, 10, 3);
        card.bg.fillRect(cardWidth / 2 - 3, -cardHeight / 2, 3, 10);
      }
    });

    // Mode Buttons
    (Object.keys(this.modeButtons) as GameMode[]).forEach((m) => {
      const isSelected = this.mode === m;
      const btn = this.modeButtons[m];
      btn.text.setColor(isSelected ? '#00f0ff' : '#6f8398');
      btn.text.setBackgroundColor(isSelected ? '#0c1a2c' : '#07101a');
    });

    // Hi-score text
    const high = getHighScore(this.world, this.mode);
    this.highText?.setText(
      `SECTOR: ${WORLDS[this.world].name}  |  RECORD HIGH: ${String(high).padStart(6, '0')}`,
    );
  }

  private startGame(): void {
    this.scene.start('Game', { world: this.world, mode: this.mode });
  }
}
