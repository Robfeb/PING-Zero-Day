import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private scoreText?: Phaser.GameObjects.Text;
  private livesText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private weaponText?: Phaser.GameObjects.Text;

  constructor() { super('UI'); }

  create(): void {
    this.scoreText = this.add.text(18, 14, 'SCORE 000000', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' });
    this.livesText = this.add.text(180, 14, 'LIVES 3', { fontFamily: 'monospace', fontSize: '16px', color: '#00f0ff' });
    this.timerText = this.add.text(480, 14, '01:15', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5, 0);
    this.weaponText = this.add.text(760, 14, 'WIRE: STANDARD', { fontFamily: 'monospace', fontSize: '14px', color: '#ffd700' });
    const music = this.add.text(906, 14, 'M', { fontFamily: 'monospace', fontSize: '16px', color: '#7cff6b', backgroundColor: '#17202e', padding: { x: 8, y: 4 } }).setInteractive();
    music.on('pointerdown', () => {
      const game = this.scene.get('Game') as Phaser.Scene & { toggleMusic: () => boolean };
      game.toggleMusic();
    });

    this.events.on('hud', (data: { score: number; lives: number; time: number; weapon: string }) => {
      this.scoreText?.setText(`SCORE ${String(data.score).padStart(6, '0')}`);
      this.livesText?.setText(`LIVES ${data.lives}`);
      this.weaponText?.setText(`WIRE: ${data.weapon.toUpperCase()}`);
      const seconds = Math.max(0, Math.ceil(data.time));
      this.timerText?.setText(`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
    });

    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
  }

  private togglePause(): void {
    const game = this.scene.get('Game');
    if (game.scene.isPaused()) game.scene.resume(); else game.scene.pause();
  }
}
