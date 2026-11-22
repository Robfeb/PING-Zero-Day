import Phaser from 'phaser';

export class TouchControls extends Phaser.Scene {
  constructor() { super('Touch'); }
  create(): void {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (!coarse && !this.sys.game.device.input.touch) return;
    const game = this.scene.get('Game') as Phaser.Scene & { inputDirection: (direction: number) => void; fire: () => void; climbDirection: (direction: number) => void; stopPlayer: () => void };
    const button = (x: number, y: number, label: string, onDown: () => void, onUp: () => void = () => {}) => {
      const control = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', backgroundColor: '#17202ecc', padding: { x: 12, y: 10 } }).setInteractive();
      control.on('pointerdown', onDown); control.on('pointerup', onUp); control.on('pointerout', onUp);
    };
    button(20, 430, '◀', () => game.inputDirection(-1), () => game.stopPlayer());
    button(90, 430, '▶', () => game.inputDirection(1), () => game.stopPlayer());
    button(55, 380, '▲', () => game.climbDirection(-1), () => game.stopPlayer());
    button(55, 480, '▼', () => game.climbDirection(1), () => game.stopPlayer());
    button(830, 430, 'FIRE', () => game.fire());
  }
}
