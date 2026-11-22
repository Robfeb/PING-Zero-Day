import Phaser from 'phaser';
import { getHighScore } from '../utils/storage';
import { WORLDS } from '../config/themes';
import type { WorldId, GameMode } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  private world: WorldId = 'cybersec';
  private mode: GameMode = 'campaign';

  constructor() { super('Menu'); }

  create(): void {
    const cx = 480;
    this.cameras.main.setBackgroundColor('#0a0e17');
    this.add.text(cx, 42, 'PING!', { fontFamily: 'monospace', fontSize: '54px', color: '#00f0ff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 92, 'ZERO-DAY', { fontFamily: 'monospace', fontSize: '24px', color: '#ff2a55' }).setOrigin(0.5);

    this.add.text(480, 150, 'SELECT WORLD', { fontFamily: 'monospace', fontSize: '18px', color: '#9aa8b8' }).setOrigin(0.5);
    let x = 190;
    (Object.keys(WORLDS) as WorldId[]).forEach((id) => {
      const theme = WORLDS[id];
      const button = this.add.text(x, 190, theme.name, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', backgroundColor: '#17202e', padding: { x: 10, y: 8 } }).setInteractive();
      button.on('pointerdown', () => { this.world = id; this.showSelection(); });
      x += 290;
    });

    this.add.text(480, 275, 'SELECT MODE', { fontFamily: 'monospace', fontSize: '18px', color: '#9aa8b8' }).setOrigin(0.5);
    const campaign = this.add.text(350, 315, 'CAMPAIGN', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', backgroundColor: '#17202e', padding: { x: 12, y: 8 } }).setInteractive();
    const endless = this.add.text(610, 315, 'ENDLESS', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', backgroundColor: '#17202e', padding: { x: 12, y: 8 } }).setInteractive();
    campaign.on('pointerdown', () => { this.mode = 'campaign'; this.showSelection(); });
    endless.on('pointerdown', () => { this.mode = 'endless'; this.showSelection(); });

    const launch = this.add.text(cx, 420, '▶ DEPLOY', { fontFamily: 'monospace', fontSize: '28px', color: '#0a0e17', backgroundColor: '#00f0ff', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
    launch.on('pointerdown', () => this.startGame());
    this.showSelection();
  }

  private showSelection(): void {
    const high = getHighScore(this.world, this.mode);
    this.children.list.filter((object) => object.getData?.('selection')).forEach((object) => object.destroy());
    this.add.text(480, 370, `${WORLDS[this.world].name} // ${this.mode.toUpperCase()} // HI ${String(high).padStart(6, '0')}`, { fontFamily: 'monospace', fontSize: '14px', color: WORLDS[this.world].accentHex }).setOrigin(0.5).setData('selection', true);
  }

  private startGame(): void { this.scene.start('Game', { world: this.world, mode: this.mode }); }
}
