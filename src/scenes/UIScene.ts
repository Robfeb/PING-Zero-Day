import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private scoreText?: Phaser.GameObjects.Text;
  private lifeIcons: Phaser.GameObjects.Image[] = [];
  private timerText?: Phaser.GameObjects.Text;
  private weaponBadge?: Phaser.GameObjects.Text;
  private serverText?: Phaser.GameObjects.Text;
  private bossHudText?: Phaser.GameObjects.Text;
  private aimBtn?: Phaser.GameObjects.Text;
  private musicBtn?: Phaser.GameObjects.Text;
  private pauseBtn?: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super('UI');
  }

  create(): void {
    // Top HUD Glass Panel (Full-width sleek banner)
    const hudBar = this.add.graphics();
    hudBar.fillStyle(0x060c18, 0.88);
    hudBar.fillRect(0, 0, 960, 32);

    // Neon Bottom Border
    hudBar.lineStyle(1.8, 0x00f0ff, 0.7);
    hudBar.lineBetween(0, 32, 960, 32);

    // Decorative corner notches
    hudBar.fillStyle(0x00f0ff, 1);
    hudBar.fillRect(0, 30, 16, 2);
    hudBar.fillRect(944, 30, 16, 2);

    // 1. Score Readout
    this.add.text(14, 5, 'SCORE', {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '8px',
      color: '#00f0ff',
      fontStyle: 'bold',
    });
    this.scoreText = this.add.text(14, 14, '000000', {
      fontFamily: "'Orbitron', monospace",
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // 2. Lives Display (Icons + Label)
    this.add.text(125, 5, 'NODES', {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '8px',
      color: '#00f0ff',
      fontStyle: 'bold',
    });
    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add
        .image(135 + i * 18, 21, 'hero_life')
        .setDisplaySize(15, 17)
        .setAlpha(1);
      this.lifeIcons.push(icon);
    }

    // 3. Aim Mode Toggle Button (Default Vertical)
    this.aimBtn = this.add
      .text(245, 16, '⇡ AIM: VERTICAL', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#00f0ff',
        backgroundColor: '#0a1828',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.aimBtn.on('pointerover', () => this.aimBtn?.setBackgroundColor('#142b44'));
    this.aimBtn.on('pointerout', () =>
      this.aimBtn?.setBackgroundColor(
        this.aimBtn.text.includes('VERTICAL') ? '#0a1828' : '#281c08',
      ),
    );
    this.aimBtn.on('pointerdown', () => this.toggleAimMode());

    // 4. Central Mission Countdown Timer
    this.add
      .text(355, 4, 'SYS.TIMER', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '8px',
        color: '#9aa8b8',
      })
      .setOrigin(0.5, 0);

    this.timerText = this.add
      .text(355, 14, '01:15', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // 5. Server Defense Indicator
    this.serverText = this.add
      .text(465, 16, '', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '10px',
        color: '#39ff14',
        fontStyle: 'bold',
        backgroundColor: '#071810',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // 6. Boss Objective Indicator (AI / DevOps modes)
    this.bossHudText = this.add
      .text(560, 16, '', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '10px',
        color: '#c77dff',
        fontStyle: 'bold',
        backgroundColor: '#1b0928',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // 7. Active Weapon Telemetry Badge
    this.weaponBadge = this.add
      .text(665, 16, 'WIRE: RJ45', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '10px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 8. Reset Level Button
    const resetBtn = this.add
      .text(765, 16, '↺ RESET', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#ff8c00',
        backgroundColor: '#16120b',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    resetBtn.on('pointerover', () => resetBtn.setBackgroundColor('#2a1e10'));
    resetBtn.on('pointerout', () => resetBtn.setBackgroundColor('#16120b'));
    resetBtn.on('pointerdown', () => this.triggerReset());

    // 9. Audio / BGM Toggle Button (Random track each toggle)
    this.musicBtn = this.add
      .text(850, 16, 'BGM ♫', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#7cff6b',
        backgroundColor: '#0a1626',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.musicBtn.on('pointerover', () => this.musicBtn?.setBackgroundColor('#142b4a'));
    this.musicBtn.on('pointerout', () => this.musicBtn?.setBackgroundColor('#0a1626'));
    this.musicBtn.on('pointerdown', () => {
      const game = this.scene.get('Game') as Phaser.Scene & {
        toggleMusic: () => boolean;
        getMusicTrackName: () => string;
      };
      const enabled = game.toggleMusic();
      const trackName = game.getMusicTrackName();
      this.musicBtn?.setText(enabled ? `♫ ${trackName.split('//')[0]?.trim() ?? 'ON'}` : 'BGM: OFF');
      this.musicBtn?.setColor(enabled ? '#7cff6b' : '#ff5555');
    });

    // 10. Pause Button
    this.pauseBtn = this.add
      .text(935, 16, '||', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '12px',
        color: '#00f0ff',
        backgroundColor: '#0a1626',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.pauseBtn.on('pointerdown', () => this.togglePause());

    // Listen for HUD updates
    this.events.on(
      'hud',
      (data: {
        score: number;
        lives: number;
        time: number;
        weapon: string;
        aimMode?: 'vertical' | 'angled';
        serversTotal?: number;
        serversAlive?: number;
        bossName?: string;
        bossHp?: number;
        bossMaxHp?: number;
      }) => {
        this.scoreText?.setText(String(data.score).padStart(6, '0'));

        // Update lives icons
        this.lifeIcons.forEach((icon, idx) => {
          if (idx < data.lives) {
            icon.setAlpha(1);
            icon.clearTint();
          } else {
            icon.setAlpha(0.25);
            icon.setTint(0x444444);
          }
        });

        // Aim mode badge
        if (data.aimMode) {
          this.updateAimBadge(data.aimMode);
        }

        // Weapon badge with cyberpunk iconography
        const weaponMap: Record<string, string> = {
          standard: '[|] RJ45',
          double: '[||] DUAL',
          triple: '[\\|/] TRIPLE',
          sticky: '[⚓] STICKY',
        };
        const label = weaponMap[data.weapon.toLowerCase()] ?? data.weapon.toUpperCase();
        this.weaponBadge?.setText(label);

        // Server Defense Telemetry
        if (data.serversTotal && data.serversTotal > 0) {
          this.serverText?.setVisible(true);
          const alive = data.serversAlive ?? 0;
          const total = data.serversTotal;
          this.serverText?.setText(`SRV: ${alive}/${total}`);
          if (alive === total) {
            this.serverText?.setColor('#39ff14');
          } else if (alive > 0) {
            this.serverText?.setColor('#ffd700');
          } else {
            this.serverText?.setColor('#ff2a55');
          }
        } else {
          this.serverText?.setVisible(false);
        }

        // Boss Objective Telemetry
        if (data.bossName && data.bossMaxHp && data.bossMaxHp > 0) {
          this.bossHudText?.setVisible(true);
          const bHp = Math.max(0, data.bossHp ?? 0);
          this.bossHudText?.setText(`TARGET: ${bHp}/${data.bossMaxHp}`);
          const ratio = bHp / data.bossMaxHp;
          if (ratio > 0.5) {
            this.bossHudText?.setColor('#c77dff');
          } else if (ratio > 0.2) {
            this.bossHudText?.setColor('#ffd700');
          } else {
            this.bossHudText?.setColor('#ff2a55');
          }
        } else {
          this.bossHudText?.setVisible(false);
        }

        // Timer
        const seconds = Math.max(0, Math.ceil(data.time));
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        this.timerText?.setText(`${mm}:${ss}`);

        // Urgent red flashing when under 15 seconds
        if (seconds <= 15) {
          const flash = Math.floor(this.time.now / 250) % 2 === 0;
          this.timerText?.setColor(flash ? '#ff2a55' : '#ffffff');
        } else {
          this.timerText?.setColor('#ffffff');
        }
      },
    );

    this.events.on('aim-mode', (mode: 'vertical' | 'angled') => {
      this.updateAimBadge(mode);
    });

    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-R', () => this.triggerReset());
    this.input.keyboard?.on('keydown-T', () => this.toggleAimMode());
  }

  private toggleAimMode(): void {
    const game = this.scene.get('Game') as Phaser.Scene & {
      toggleAimMode: () => 'vertical' | 'angled';
    };
    const mode = game.toggleAimMode();
    this.updateAimBadge(mode);
  }

  private updateAimBadge(mode: 'vertical' | 'angled'): void {
    if (mode === 'vertical') {
      this.aimBtn?.setText('⇡ AIM: VERTICAL');
      this.aimBtn?.setColor('#00f0ff');
      this.aimBtn?.setBackgroundColor('#0a1828');
    } else {
      this.aimBtn?.setText('⤢ AIM: ANGLED');
      this.aimBtn?.setColor('#ffd700');
      this.aimBtn?.setBackgroundColor('#281c08');
    }
  }

  private triggerReset(): void {
    const game = this.scene.get('Game') as Phaser.Scene & { resetCurrentStage: () => void };
    game.resetCurrentStage();
  }

  private togglePause(): void {
    const game = this.scene.get('Game');
    if (game.scene.isPaused()) {
      game.scene.resume();
      this.pauseBtn?.setText('||');
      this.pauseBtn?.setColor('#00f0ff');
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = undefined;
      }
    } else {
      game.scene.pause();
      this.pauseBtn?.setText('▶');
      this.pauseBtn?.setColor('#ffd700');
      this.showPauseOverlay();
    }
  }

  private showPauseOverlay(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = undefined;
    }
    this.pauseOverlay = this.add.container(0, 0).setDepth(300);

    const scrim = this.add
      .rectangle(480, 270, 960, 540, 0x020610, 0.78)
      .setInteractive();
    this.pauseOverlay.add(scrim);

    const panel = this.add.graphics();
    panel.fillStyle(0x061122, 0.96);
    panel.fillRect(320, 190, 320, 150);
    panel.lineStyle(2, 0x00f0ff, 0.9);
    panel.strokeRect(320, 190, 320, 150);

    // Glowing corner notches
    panel.fillStyle(0x00f0ff, 1);
    panel.fillRect(320, 190, 12, 3);
    panel.fillRect(320, 190, 3, 12);
    panel.fillRect(628, 190, 12, 3);
    panel.fillRect(637, 190, 3, 12);
    panel.fillRect(320, 337, 12, 3);
    panel.fillRect(320, 328, 3, 12);
    panel.fillRect(628, 337, 12, 3);
    panel.fillRect(637, 328, 3, 12);
    this.pauseOverlay.add(panel);

    const pauseTitle = this.add
      .text(480, 225, '❚❚ MISSION PAUSED', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '18px',
        color: '#00f0ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.pauseOverlay.add(pauseTitle);

    const resumeBtn = this.add
      .text(480, 278, '▶ RESUME MISSION [ P / ESC ]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '12px',
        color: '#050c18',
        backgroundColor: '#00f0ff',
        fontStyle: 'bold',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    resumeBtn.on('pointerover', () => resumeBtn.setBackgroundColor('#ffffff'));
    resumeBtn.on('pointerout', () => resumeBtn.setBackgroundColor('#00f0ff'));
    resumeBtn.on('pointerdown', () => this.togglePause());
    this.pauseOverlay.add(resumeBtn);
  }
}
