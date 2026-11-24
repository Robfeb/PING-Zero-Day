import Phaser from 'phaser';
import { Logger } from '../utils/logger';

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
  private logsBtn?: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private logsModal?: Phaser.GameObjects.Container;
  private logsRefreshTimer?: Phaser.Time.TimerEvent;

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

    // 2. Lives Display (5 Nodes)
    this.add.text(116, 5, 'NODES (5)', {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '8px',
      color: '#00f0ff',
      fontStyle: 'bold',
    });
    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const icon = this.add
        .image(124 + i * 18, 22, 'hero_life')
        .setDisplaySize(16, 18)
        .setAlpha(1);
      this.lifeIcons.push(icon);
    }

    // 3. Aim Mode Toggle Button (Default Vertical, V or T key)
    this.aimBtn = this.add
      .text(250, 16, '⇡ AIM [V]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#00f0ff',
        backgroundColor: '#0a1828',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.aimBtn.on('pointerover', () => this.aimBtn?.setBackgroundColor('#142b44'));
    this.aimBtn.on('pointerout', () =>
      this.aimBtn?.setBackgroundColor(
        this.aimBtn.text.includes('VERT') ? '#0a1828' : '#281c08',
      ),
    );
    this.aimBtn.on('pointerdown', () => this.toggleAimMode());

    // 4. Central Mission Countdown Timer
    this.add
      .text(335, 4, 'SYS.TIMER', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '8px',
        color: '#9aa8b8',
      })
      .setOrigin(0.5, 0);

    this.timerText = this.add
      .text(335, 14, '01:15', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // 5. Server Defense Indicator
    this.serverText = this.add
      .text(415, 16, '', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '10px',
        color: '#39ff14',
        fontStyle: 'bold',
        backgroundColor: '#071810',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // 6. Boss Objective Indicator (AI / DevOps modes)
    this.bossHudText = this.add
      .text(505, 16, '', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '10px',
        color: '#c77dff',
        fontStyle: 'bold',
        backgroundColor: '#1b0928',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // 7. Active Weapon Toggle Button (RJ45 Harpoon ⇄ PATCH Blaster)
    this.weaponBadge = this.add
      .text(605, 16, '⚡ RJ45 [Q]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#ffd700',
        backgroundColor: '#0a1828',
        padding: { x: 7, y: 4 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive();

    this.weaponBadge.on('pointerover', () => this.weaponBadge?.setBackgroundColor('#142b44'));
    this.weaponBadge.on('pointerout', () => this.weaponBadge?.setBackgroundColor('#0a1828'));
    this.weaponBadge.on('pointerdown', () => this.toggleWeapon());

    // 8. Reset Level Button
    const resetBtn = this.add
      .text(695, 16, '↺ RESET [R]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#ff8c00',
        backgroundColor: '#16120b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    resetBtn.on('pointerover', () => resetBtn.setBackgroundColor('#2a1e10'));
    resetBtn.on('pointerout', () => resetBtn.setBackgroundColor('#16120b'));
    resetBtn.on('pointerdown', () => this.triggerReset());

    // 9. Diagnostics Logs Button
    this.logsBtn = this.add
      .text(775, 16, '📋 LOGS [L]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#00f0ff',
        backgroundColor: '#071626',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.logsBtn.on('pointerover', () => this.logsBtn?.setBackgroundColor('#102d4e'));
    this.logsBtn.on('pointerout', () => this.logsBtn?.setBackgroundColor('#071626'));
    this.logsBtn.on('pointerdown', () => this.toggleLogsModal());

    // 10. Audio / BGM Toggle Button (Random track each toggle)
    this.musicBtn = this.add
      .text(855, 16, 'BGM ♫', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '9px',
        color: '#7cff6b',
        backgroundColor: '#0a1626',
        padding: { x: 6, y: 4 },
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

    // 11. Pause Button
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
          standard: '⚡ RJ45 [Q]',
          double: '⚡ DUAL RJ45 [Q]',
          triple: '⚡ TRIPLE RJ45 [Q]',
          sticky: '⚡ STICKY ROOF [Q]',
          patch: '💊 PATCH [Q]',
        };
        const label = weaponMap[data.weapon.toLowerCase()] ?? data.weapon.toUpperCase();
        this.weaponBadge?.setText(label);
        this.weaponBadge?.setColor(data.weapon.toLowerCase() === 'patch' ? '#39ff14' : '#ffd700');

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
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.logsModal) {
        this.toggleLogsModal();
      } else {
        this.togglePause();
      }
    });
    this.input.keyboard?.on('keydown-L', () => this.toggleLogsModal());
    this.input.keyboard?.on('keydown-BACKTICK', () => this.toggleLogsModal());
  }

  private toggleAimMode(): void {
    const game = this.scene.get('Game') as Phaser.Scene & {
      toggleAimMode: () => 'vertical' | 'angled';
    };
    const mode = game.toggleAimMode();
    this.updateAimBadge(mode);
  }

  private toggleWeapon(): void {
    const game = this.scene.get('Game') as Phaser.Scene & {
      toggleWeapon: () => 'harpoon' | 'patch';
    };
    if (typeof game.toggleWeapon === 'function') {
      game.toggleWeapon();
    }
  }

  private updateAimBadge(mode: 'vertical' | 'angled'): void {
    if (mode === 'vertical') {
      this.aimBtn?.setText('⇡ AIM: VERT [V]');
      this.aimBtn?.setColor('#00f0ff');
      this.aimBtn?.setBackgroundColor('#0a1828');
    } else {
      this.aimBtn?.setText('⤢ AIM: ANGLE [V]');
      this.aimBtn?.setColor('#ffd700');
      this.aimBtn?.setBackgroundColor('#281c08');
    }
  }

  private triggerReset(): void {
    const game = this.scene.get('Game') as Phaser.Scene & { resetCurrentStage: () => void };
    game.resetCurrentStage();
  }

  public toggleLogsModal(): void {
    if (this.logsModal) {
      this.logsRefreshTimer?.destroy();
      this.logsRefreshTimer = undefined;
      this.logsModal.destroy();
      this.logsModal = undefined;
      return;
    }

    const game = this.scene.get('Game') as any;
    const cx = 480;
    const cy = 270;
    const w = 880;
    const h = 480;

    this.logsModal = this.add.container(0, 0).setDepth(400);

    // Dark backdrop
    const scrim = this.add
      .rectangle(cx, cy, 960, 540, 0x02050e, 0.9)
      .setInteractive();
    this.logsModal.add(scrim);

    // Main window panel
    const panel = this.add.graphics();
    panel.fillStyle(0x050f1d, 0.98);
    panel.fillRect(cx - w / 2, cy - h / 2, w, h);
    panel.lineStyle(2, 0x00f0ff, 0.9);
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
    this.logsModal.add(panel);

    // Modal Title Bar
    const title = this.add
      .text(cx, cy - h / 2 + 22, 'SYSTEM DIAGNOSTICS & TELEMETRY // REAL-TIME LOGS', {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '15px',
        color: '#00f0ff',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.logsModal.add(title);

    // Subtitle
    const subtitle = this.add
      .text(cx, cy - h / 2 + 42, 'LIVE ENGINE TELEMETRY  |  PRESS [ L ] OR [ ESC ] TO DISMISS', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        color: '#7fa0be',
      })
      .setOrigin(0.5);
    this.logsModal.add(subtitle);

    // Telemetry text display
    const telemetryText = this.add
      .text(cx - w / 2 + 24, cy - h / 2 + 58, '', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        color: '#bdfcff',
        lineSpacing: 4,
      });
    this.logsModal.add(telemetryText);

    // Separator line
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x00f0ff, 0.35);
    sep.lineBetween(cx - w / 2 + 20, cy - h / 2 + 124, cx + w / 2 - 20, cy - h / 2 + 124);
    this.logsModal.add(sep);

    // Log Stream Header
    const logHeader = this.add
      .text(cx - w / 2 + 24, cy - h / 2 + 132, 'EVENT AUDIT TRAIL (MOST RECENT FIRST):', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#ffd700',
        fontStyle: 'bold',
      });
    this.logsModal.add(logHeader);

    // Log lines container
    const logsText = this.add
      .text(cx - w / 2 + 24, cy - h / 2 + 154, '', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        color: '#d4ecff',
        lineSpacing: 5,
      });
    this.logsModal.add(logsText);

    // Refresh function for telemetry & logs
    const updateModalData = () => {
      const fps = this.game.loop.actualFps.toFixed(1);
      const delta = this.game.loop.delta.toFixed(1);
      const orbsCount = game?.orbs?.filter((o: any) => o.active)?.length ?? 0;
      const bodiesCount = game?.physics?.world?.bodies?.entries?.length ?? 0;
      const inFlightHarpoons = game?.harpoon?.inFlightCount ?? 0;
      const activeHarpoons = game?.harpoon?.activeCount ?? 0;
      const patchCount = game?.patchBullets?.length ?? 0;
      const playerPos = game?.player ? `(${Math.round(game.player.x)}, ${Math.round(game.player.y)})` : 'N/A';
      const playerState = game?.player?.state ?? 'N/A';
      const playerLives = game?.lives ?? 'N/A';
      const playerShield = game?.player?.shield ? 'YES' : 'NO';
      const audioStatus = game?.audio ? (game.audio.isMuted() ? 'MUTED' : 'ACTIVE') : 'N/A';
      const musicTrack = game?.getMusicTrackName ? game.getMusicTrackName() : 'N/A';
      const serversAlive = game?.servers?.filter((s: any) => !s.isDestroyed)?.length ?? 0;
      const serversTotal = game?.servers?.length ?? 0;

      telemetryText.setText(
        `• ENGINE: FPS ${fps} / 60.0  |  Frame Delta: ${delta}ms  |  Physics Bodies: ${bodiesCount}\n` +
        `• OBJECTS: Threats: ${orbsCount}  |  Servers: ${serversAlive}/${serversTotal} Alive  |  RJ45 In-Flight: ${inFlightHarpoons}  |  Fixed Roof: ${Math.max(0, activeHarpoons - inFlightHarpoons)}  |  PATCH: ${patchCount}\n` +
        `• OPERATIVE: Pos ${playerPos}  |  State: ${playerState}  |  Lives: ${playerLives}/5  |  WAF Shield: ${playerShield}  |  Audio: ${audioStatus} [${musicTrack}]`
      );

      const entries = Logger.getLogs().slice(-14).reverse();
      if (entries.length === 0) {
        logsText.setText('No events logged yet.');
      } else {
        const lines = entries.map((e) => {
          const levelTag = e.level === 'ERROR' ? '[ERROR]' : e.level === 'WARN' ? '[WARN]' : e.level === 'PERF' ? '[PERF]' : '[INFO]';
          return `${e.timestamp} ${levelTag.padEnd(8)} ${e.message}`;
        });
        logsText.setText(lines.join('\n'));
      }
    };

    updateModalData();
    this.logsRefreshTimer = this.time.addEvent({
      delay: 350,
      callback: updateModalData,
      loop: true,
    });

    // Modal Control Buttons at bottom
    const btnY = cy + h / 2 - 30;

    // Clear Logs Button
    const clearBtn = this.add
      .text(cx - 240, btnY, '↺ CLEAR LOGS', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#ff8c00',
        backgroundColor: '#1b1207',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();
    clearBtn.on('pointerdown', () => {
      Logger.clear();
      updateModalData();
    });
    this.logsModal.add(clearBtn);

    // Copy Diagnostics Button
    const copyBtn = this.add
      .text(cx, btnY, '📋 COPY DIAGNOSTICS', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#00f0ff',
        backgroundColor: '#0a1d33',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();
    copyBtn.on('pointerdown', () => {
      const logs = Logger.getLogs().map((e) => `[${e.timestamp}] [${e.level}] ${e.message}`).join('\n');
      const telemetry = telemetryText.text;
      const fullText = `PING! ZERO-DAY DIAGNOSTICS REPORT\n==============================\n${telemetry}\n\nLOG HISTORY:\n${logs}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
          copyBtn.setText('✔ COPIED TO CLIPBOARD!');
          this.time.delayedCall(1200, () => copyBtn.setText('📋 COPY DIAGNOSTICS'));
        });
      }
    });
    this.logsModal.add(copyBtn);

    // Close Button
    const closeBtn = this.add
      .text(cx + 240, btnY, '✖ CLOSE [ ESC / L ]', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#ff2a55',
        fontStyle: 'bold',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();
    closeBtn.on('pointerdown', () => this.toggleLogsModal());
    this.logsModal.add(closeBtn);
  }

  private togglePause(): void {
    if (this.logsModal) {
      this.toggleLogsModal();
      return;
    }
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
