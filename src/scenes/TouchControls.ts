import Phaser from 'phaser';

export class TouchControls extends Phaser.Scene {
  constructor() {
    super('Touch');
  }

  create(): void {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (!coarse && !this.sys.game.device.input.touch) return;

    const game = this.scene.get('Game') as Phaser.Scene & {
      inputDirection: (direction: number) => void;
      fire: (explicitAngleRad?: number) => void;
      climbDirection: (direction: number) => void;
      stopPlayer: () => void;
      jumpPlayer: () => void;
      toggleAimMode: () => 'vertical' | 'angled';
      toggleWeapon: () => 'harpoon' | 'patch';
    };

    const makeBtn = (
      x: number,
      y: number,
      label: string,
      w: number,
      h: number,
      onDown: () => void,
      onUp: () => void = () => {},
    ) => {
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(0x060f1e, 0.7);
      bg.fillRect(-w / 2, -h / 2, w, h);
      bg.lineStyle(2, 0x00f0ff, 0.75);
      bg.strokeRect(-w / 2, -h / 2, w, h);
      container.add(bg);

      const text = this.add
        .text(0, 0, label, {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add(text);

      const hit = this.add.zone(0, 0, w, h).setInteractive();
      container.add(hit);

      hit.on('pointerdown', () => {
        bg.clear();
        bg.fillStyle(0x00f0ff, 0.35);
        bg.fillRect(-w / 2, -h / 2, w, h);
        bg.lineStyle(2.5, 0x00f0ff, 1);
        bg.strokeRect(-w / 2, -h / 2, w, h);
        onDown();
      });

      const release = () => {
        bg.clear();
        bg.fillStyle(0x060f1e, 0.7);
        bg.fillRect(-w / 2, -h / 2, w, h);
        bg.lineStyle(2, 0x00f0ff, 0.75);
        bg.strokeRect(-w / 2, -h / 2, w, h);
        onUp();
      };

      hit.on('pointerup', release);
      hit.on('pointerout', release);
    };

    // Movement D-Pad on bottom-left
    makeBtn(40, 455, '◀', 40, 44, () => game.inputDirection(-1), () => game.stopPlayer());
    makeBtn(130, 455, '▶', 40, 44, () => game.inputDirection(1), () => game.stopPlayer());
    makeBtn(85, 405, '▲', 44, 40, () => game.climbDirection(-1), () => game.stopPlayer());
    makeBtn(85, 505, '▼', 44, 40, () => game.climbDirection(1), () => game.stopPlayer());

    // Dedicated Jump Button next to movement D-Pad
    makeBtn(190, 455, '⤒ JUMP', 64, 44, () => game.jumpPlayer());

    // Weapon Switch, Aim Mode Toggle, Diagnostics Logs & Multi-Directional FIRE cluster on bottom-right
    makeBtn(585, 455, '📋 LOGS', 56, 44, () => (this.scene.get('UI') as any)?.toggleLogsModal());
    makeBtn(650, 455, '⇄ WPN', 56, 44, () => game.toggleWeapon());
    makeBtn(715, 455, '⇡ AIM', 56, 44, () => game.toggleAimMode());
    makeBtn(780, 455, '↖', 40, 44, () => game.fire(-0.6));
    makeBtn(850, 455, '⚡ FIRE', 80, 44, () => game.fire(0));
    makeBtn(920, 455, '↗', 40, 44, () => game.fire(0.6));
  }
}
