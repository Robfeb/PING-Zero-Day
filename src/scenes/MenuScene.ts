import Phaser from 'phaser';
import { getHighScore } from '../utils/storage';
import { WORLDS } from '../config/themes';
import type { WorldId, GameMode } from '../config/constants';
import { SynthAudio } from '../audio/SynthAudio';

export class MenuScene extends Phaser.Scene {
  private world: WorldId = 'cybersec';
  private mode: GameMode = 'campaign';
  private focusedRow: 'sector' | 'protocol' | 'action' = 'sector';
  private focusedAction: 'deploy' | 'wizard' = 'deploy';
  private currentWizardStep = 0;
  private audio = new SynthAudio();
  private readonly worldList: WorldId[] = ['cybersec', 'ai', 'devops'];
  private readonly modeList: GameMode[] = ['campaign', 'endless'];

  private cards: Record<
    WorldId,
    {
      container: Phaser.GameObjects.Container;
      bg: Phaser.GameObjects.Graphics;
      title: Phaser.GameObjects.Text;
      hi: Phaser.GameObjects.Text;
      badge: Phaser.GameObjects.Text;
    }
  > = {} as any;

  private modeButtons: Record<
    GameMode,
    { text: Phaser.GameObjects.Text; bg: Phaser.GameObjects.Graphics }
  > = {} as any;

  private highText?: Phaser.GameObjects.Text;
  private launchBtn?: Phaser.GameObjects.Text;
  private wizardBtn?: Phaser.GameObjects.Text;
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

      // Shortcut Number Badge [ 1 / 2 / 3 ]
      const badge = this.add
        .text(cardWidth / 2 - 12, -cardHeight / 2 + 10, `[ ${idx + 1} ]`, {
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: theme.accentHex,
          backgroundColor: '#040b16dd',
          padding: { x: 5, y: 2 },
        })
        .setOrigin(1, 0);
      container.add(badge);

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
        this.focusedRow = 'sector';
        this.audio.playWeaponSwitch();
        this.updateSelection();
      });

      this.cards[id] = { container, bg, title, hi, badge };
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

    const modes: Array<{ id: GameMode; label: string; shortcut: string; x: number }> = [
      { id: 'campaign', label: 'CAMPAIGN // 5 STAGES', shortcut: '[ C ]', x: cx - 140 },
      { id: 'endless', label: 'ENDLESS // SURVIVAL', shortcut: '[ E ]', x: cx + 140 },
    ];

    modes.forEach((m) => {
      const bg = this.add.graphics();
      const text = this.add
        .text(m.x, 320, `${m.shortcut} ${m.label}`, {
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
        this.focusedRow = 'protocol';
        this.audio.playWeaponSwitch();
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
    this.launchBtn = this.add
      .text(cx, 435, '▶ DEPLOY SYSTEM [ ENTER ]', {
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
      targets: this.launchBtn,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.launchBtn.on('pointerover', () => this.launchBtn?.setBackgroundColor('#ffffff'));
    this.launchBtn.on('pointerout', () => this.launchBtn?.setBackgroundColor(this.focusedRow === 'action' && this.focusedAction === 'deploy' ? '#39ff14' : '#00f0ff'));
    this.launchBtn.on('pointerdown', () => {
      this.focusedRow = 'action';
      this.focusedAction = 'deploy';
      this.startGame();
    });

    // 6. Interactive "HOW TO PLAY / SYSTEM BOOTCAMP" Button
    this.wizardBtn = this.add
      .text(cx, 488, '? HOW TO PLAY // SYSTEM BOOTCAMP [ H ]', {
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

    this.wizardBtn.on('pointerover', () => {
      this.wizardBtn?.setBackgroundColor('#102d4e');
      this.wizardBtn?.setColor('#ffffff');
    });
    this.wizardBtn.on('pointerout', () => {
      this.wizardBtn?.setBackgroundColor('#071626');
      this.wizardBtn?.setColor('#00f0ff');
    });
    this.wizardBtn.on('pointerdown', () => {
      this.focusedRow = 'action';
      this.focusedAction = 'wizard';
      this.openWizard(0);
    });

    // 7. Keyboard Navigation Hint Bar
    this.add
      .text(
        cx,
        522,
        '[ ▲/▼/W/S ] ROW   [ ◀/▶/A/D ] OPTION   [ 1/2/3 ] SECTOR   [ C/E ] MODE   [ ENTER ] CONFIRM',
        {
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#65829d',
          backgroundColor: '#030812cc',
          padding: { x: 12, y: 3 },
        },
      )
      .setOrigin(0.5);

    // Keyboard Navigation Event Listeners
    this.input.keyboard?.on('keydown-UP', () => this.navigateRow(-1));
    this.input.keyboard?.on('keydown-W', () => this.navigateRow(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateRow(1));
    this.input.keyboard?.on('keydown-S', () => this.navigateRow(1));

    this.input.keyboard?.on('keydown-LEFT', () => this.navigateCol(-1));
    this.input.keyboard?.on('keydown-A', () => this.navigateCol(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.navigateCol(1));
    this.input.keyboard?.on('keydown-D', () => this.navigateCol(1));

    this.input.keyboard?.on('keydown-ONE', () => this.selectSector(0));
    this.input.keyboard?.on('keydown-TWO', () => this.selectSector(1));
    this.input.keyboard?.on('keydown-THREE', () => this.selectSector(2));
    this.input.keyboard?.on('keydown-NUMPAD_ONE', () => this.selectSector(0));
    this.input.keyboard?.on('keydown-NUMPAD_TWO', () => this.selectSector(1));
    this.input.keyboard?.on('keydown-NUMPAD_THREE', () => this.selectSector(2));

    this.input.keyboard?.on('keydown-C', () => this.selectMode('campaign'));
    this.input.keyboard?.on('keydown-E', () => this.selectMode('endless'));

    this.input.keyboard?.on('keydown-H', () => this.toggleWizard());

    this.input.keyboard?.on('keydown-ENTER', () => this.activateCurrent());
    this.input.keyboard?.on('keydown-SPACE', () => this.activateCurrent());
    this.input.keyboard?.on('keydown-ESC', () => this.handleEscape());

    this.updateSelection();
  }

  private openWizard(step: number): void {
    this.currentWizardStep = step;
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
      const heroPreview = this.add
        .image(cx - 195, contentBoxY - 40, 'hero_walk_0')
        .setDisplaySize(38, 50);
      this.wizardContainer.add(heroPreview);

      const h1 = this.add
        .text(cx + 15, contentBoxY - 40, '1. OPERATIVE MOVEMENT & PLASMA JET JUMP', {
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
      // 2. Weapons & Infinite Roof Harpoons
      const h1 = this.add
        .text(cx, contentBoxY - 40, '2. WEAPONS: UNLIMITED HARPOONS & VERTICAL PATCH BLASTER', {
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
          `• UNLIMITED FIXED HARPOONS:\n` +
            `  Harpoons anchored to the ceiling stay fixed indefinitely! You can deploy INFINITE\n` +
            `  fixed ceiling wires to create a massive defensive web against falling threats.\n\n` +
            `• VERTICAL "PATCH" BLASTER [ Q ] / [ E ] / [ X ] / [ ⇄ WPN ]:\n` +
            `  Toggle anytime to fire rapid vertical "PATCH" bullets! Destroys threat orbs, deals\n` +
            `  critical boss damage, and repairs damaged server infrastructure (+1 HP)!\n\n` +
            `• ANGLED AIM TOGGLE [ V ] / [ T ] / [ ⤢ AIM ]:\n` +
            `  Toggle directional mode to fire angled beams while running left/right or with cursor.\n` +
            `• REAL-TIME DIAGNOSTICS [ L ] / [ 📋 LOGS ] : Monitor engine health and event audit log.`,
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
        .text(cx, contentBoxY - 40, '3. CVE THREATS, SERVER ROOFTOP WALKING & CONTINUOUS PLAY', {
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
          `• WALK ON TOP OF SERVERS:\n` +
            `  Operatives can leap onto and walk across server rack roofs to gain tactical high ground!\n\n` +
            `• FORTIFY SERVERS WITH ITEMS & PATCH WEAPONS:\n` +
            `  Collect Firewall Shields and shoot PATCH bullets at servers to heal and fortify them!\n\n` +
            `• SEAMLESS CONTINUATION ON DAMAGE (5 NODES):\n` +
            `  Taking damage continues the game seamlessly in the exact same state with i-frame recovery.\n` +
            `  No stage reset until you lose your final 5th node!`,
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
      this.currentWizardStep = 0;
      this.updateSelection();
    }
  }

  private navigateRow(dir: -1 | 1): void {
    if (this.wizardContainer) return;
    const rows: Array<'sector' | 'protocol' | 'action'> = ['sector', 'protocol', 'action'];
    let idx = rows.indexOf(this.focusedRow) + dir;
    if (idx < 0) idx = rows.length - 1;
    if (idx >= rows.length) idx = 0;
    this.focusedRow = rows[idx];
    this.audio.playWeaponSwitch();
    this.updateSelection();
  }

  private navigateCol(dir: -1 | 1): void {
    if (this.wizardContainer) {
      if (dir === -1 && this.currentWizardStep > 0) {
        this.openWizard(this.currentWizardStep - 1);
        this.audio.playWeaponSwitch();
      } else if (dir === 1 && this.currentWizardStep < 3) {
        this.openWizard(this.currentWizardStep + 1);
        this.audio.playWeaponSwitch();
      }
      return;
    }

    if (this.focusedRow === 'sector') {
      let idx = this.worldList.indexOf(this.world) + dir;
      if (idx < 0) idx = this.worldList.length - 1;
      if (idx >= this.worldList.length) idx = 0;
      this.world = this.worldList[idx];
      this.audio.playWeaponSwitch();
      this.updateSelection();
    } else if (this.focusedRow === 'protocol') {
      let idx = this.modeList.indexOf(this.mode) + dir;
      if (idx < 0) idx = this.modeList.length - 1;
      if (idx >= this.modeList.length) idx = 0;
      this.mode = this.modeList[idx];
      this.audio.playWeaponSwitch();
      this.updateSelection();
    } else if (this.focusedRow === 'action') {
      this.focusedAction = this.focusedAction === 'deploy' ? 'wizard' : 'deploy';
      this.audio.playWeaponSwitch();
      this.updateSelection();
    }
  }

  private selectSector(index: number): void {
    if (this.wizardContainer) return;
    if (index >= 0 && index < this.worldList.length) {
      this.world = this.worldList[index];
      this.focusedRow = 'sector';
      this.audio.playWeaponSwitch();
      this.updateSelection();
    }
  }

  private selectMode(mode: GameMode): void {
    if (this.wizardContainer) return;
    this.mode = mode;
    this.focusedRow = 'protocol';
    this.audio.playWeaponSwitch();
    this.updateSelection();
  }

  private toggleWizard(): void {
    if (this.wizardContainer) {
      this.closeWizard();
      this.audio.playWeaponSwitch();
    } else {
      this.focusedRow = 'action';
      this.focusedAction = 'wizard';
      this.audio.playWeaponSwitch();
      this.openWizard(0);
    }
  }

  private handleEscape(): void {
    if (this.wizardContainer) {
      this.closeWizard();
      this.audio.playWeaponSwitch();
    }
  }

  private activateCurrent(): void {
    if (this.wizardContainer) {
      if (this.currentWizardStep < 3) {
        this.openWizard(this.currentWizardStep + 1);
        this.audio.playWeaponSwitch();
      } else {
        this.closeWizard();
        this.startGame();
      }
      return;
    }

    if (this.focusedRow === 'action') {
      if (this.focusedAction === 'wizard') {
        this.openWizard(0);
        this.audio.playWeaponSwitch();
      } else {
        this.startGame();
      }
    } else {
      // Direct deploy from keyboard confirmation on any row
      this.startGame();
    }
  }

  private updateSelection(): void {
    const cardWidth = 270;
    const cardHeight = 110;

    (Object.keys(this.cards) as WorldId[]).forEach((id) => {
      const card = this.cards[id];
      const isSelected = this.world === id;
      const isRowFocused = this.focusedRow === 'sector';
      const hasFullFocus = isSelected && isRowFocused;
      const theme = WORLDS[id];

      card.bg.clear();
      // Glass fill
      card.bg.fillStyle(hasFullFocus ? 0x142842 : isSelected ? 0x0c1c2e : 0x060f18, 0.9);
      card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

      // Border
      card.bg.lineStyle(
        hasFullFocus ? 3 : isSelected ? 2 : 1,
        hasFullFocus ? 0x00f0ff : theme.accent,
        hasFullFocus ? 1 : isSelected ? 0.75 : 0.35,
      );
      card.bg.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

      if (hasFullFocus) {
        // Glowing corner brackets
        card.bg.fillStyle(0x00f0ff, 1);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 14, 4);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 4, 14);
        card.bg.fillRect(cardWidth / 2 - 14, -cardHeight / 2, 14, 4);
        card.bg.fillRect(cardWidth / 2 - 4, -cardHeight / 2, 4, 14);
        card.bg.fillRect(-cardWidth / 2, cardHeight / 2 - 4, 14, 4);
        card.bg.fillRect(-cardWidth / 2, cardHeight / 2 - 14, 4, 14);
        card.bg.fillRect(cardWidth / 2 - 14, cardHeight / 2 - 4, 14, 4);
        card.bg.fillRect(cardWidth / 2 - 4, cardHeight / 2 - 14, 4, 14);

        card.title.setText(`▶ ${theme.name} ◀`).setColor('#ffffff');
        card.badge.setColor('#040a14').setBackgroundColor('#00f0ff');
      } else if (isSelected) {
        card.bg.fillStyle(theme.accent, 1);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 10, 3);
        card.bg.fillRect(-cardWidth / 2, -cardHeight / 2, 3, 10);
        card.bg.fillRect(cardWidth / 2 - 10, -cardHeight / 2, 10, 3);
        card.bg.fillRect(cardWidth / 2 - 3, -cardHeight / 2, 3, 10);

        card.title.setText(theme.name).setColor('#ffffff');
        card.badge.setColor(theme.accentHex).setBackgroundColor('#040b16dd');
      } else {
        card.title.setText(theme.name).setColor('#7d93a8');
        card.badge.setColor('#5c7084').setBackgroundColor('#040b16aa');
      }

      // Sync high score label
      card.hi.setText(`RECORD: ${String(getHighScore(id, this.mode)).padStart(6, '0')}`);
    });

    // Mode Buttons
    (Object.keys(this.modeButtons) as GameMode[]).forEach((m) => {
      const isSelected = this.mode === m;
      const isRowFocused = this.focusedRow === 'protocol';
      const hasFullFocus = isSelected && isRowFocused;
      const btn = this.modeButtons[m];

      if (hasFullFocus) {
        btn.text.setColor('#040a14');
        btn.text.setBackgroundColor('#00f0ff');
        btn.text.setText(
          m === 'campaign' ? '▶ [ C ] CAMPAIGN // 5 STAGES ◀' : '▶ [ E ] ENDLESS // SURVIVAL ◀',
        );
      } else if (isSelected) {
        btn.text.setColor('#00f0ff');
        btn.text.setBackgroundColor('#0d2138');
        btn.text.setText(
          m === 'campaign' ? '[ C ] CAMPAIGN // 5 STAGES' : '[ E ] ENDLESS // SURVIVAL',
        );
      } else {
        btn.text.setColor('#5c7084');
        btn.text.setBackgroundColor('#06101a');
        btn.text.setText(
          m === 'campaign' ? '[ C ] CAMPAIGN // 5 STAGES' : '[ E ] ENDLESS // SURVIVAL',
        );
      }
    });

    // Action Buttons
    const isActionRow = this.focusedRow === 'action';
    if (this.launchBtn) {
      const isLaunchFocused = isActionRow && this.focusedAction === 'deploy';
      if (isLaunchFocused) {
        this.launchBtn.setText('▶▶ DEPLOY SYSTEM [ ENTER ] ◀◀');
        this.launchBtn.setBackgroundColor('#39ff14');
        this.launchBtn.setColor('#040a14');
      } else {
        this.launchBtn.setText('▶ DEPLOY SYSTEM [ ENTER ]');
        this.launchBtn.setBackgroundColor('#00f0ff');
        this.launchBtn.setColor('#050c18');
      }
    }

    if (this.wizardBtn) {
      const isWizardFocused = isActionRow && this.focusedAction === 'wizard';
      if (isWizardFocused) {
        this.wizardBtn.setText('▶ ? HOW TO PLAY // SYSTEM BOOTCAMP [ H ] ◀');
        this.wizardBtn.setBackgroundColor('#00f0ff');
        this.wizardBtn.setColor('#040a14');
        this.wizardBtn.setStroke('#ffffff', 1);
      } else {
        this.wizardBtn.setText('? HOW TO PLAY // SYSTEM BOOTCAMP [ H ]');
        this.wizardBtn.setBackgroundColor('#071626');
        this.wizardBtn.setColor('#00f0ff');
        this.wizardBtn.setStroke('#00f0ff', 1);
      }
    }

    // Hi-score text
    const high = getHighScore(this.world, this.mode);
    this.highText?.setText(
      `SECTOR: ${WORLDS[this.world].name}  |  PROTOCOL: ${this.mode.toUpperCase()}  |  RECORD HIGH: ${String(high).padStart(6, '0')}`,
    );
  }

  private startGame(): void {
    this.audio.playPowerUp();
    this.scene.start('Game', { world: this.world, mode: this.mode });
  }
}
