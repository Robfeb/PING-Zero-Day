import Phaser from 'phaser';

export type HarpoonMode = 'standard' | 'double' | 'triple' | 'sticky';

export interface ActiveHarpoon {
  wire: Phaser.GameObjects.Rectangle;
  tip: Phaser.GameObjects.Image;
  anchorX: number;
  anchorY: number;
  height: number;
  stickyUntil?: number;
}

export class Harpoon {
  private scene: Phaser.Scene;
  private wires: ActiveHarpoon[] = [];

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  get activeCount(): number { return this.wires.filter((wire) => wire.wire.active).length; }
  get activeWires(): ActiveHarpoon[] { return this.wires.filter((item) => item.wire.active); }

  fire(playerX: number, playerBottom: number, mode: HarpoonMode, tipTexture = 'harpoon-rj45', wireColor = 0x00f0ff): void {
    const limit = mode === 'triple' ? 3 : mode === 'double' ? 2 : 1;
    if (this.activeCount >= limit) return;
    const count = limit;

    for (let i = 0; i < count; i++) {
      const anchorX = playerX + (count === 3 ? (i - 1) * 15 : count === 2 ? (i === 0 ? -8 : 8) : 0);
      const wire = this.scene.add.rectangle(anchorX, playerBottom, 6, 20, wireColor, 0.95).setOrigin(0.5, 1).setDepth(18).setVisible(true).setAlpha(1);
      this.scene.physics.add.existing(wire);
      const tip = this.scene.add.image(anchorX, playerBottom - 20, tipTexture).setScale(0.55).setDepth(19).setVisible(true).setAlpha(1);
      this.wires.push({ wire, tip, anchorX, anchorY: playerBottom, height: 20 });
    }
  }

  update(delta: number, stickyMode: boolean, time: number): void {
    for (const item of this.wires) {
      if (!item.wire.active) continue;
      if (!item.stickyUntil) {
        item.height = Math.min(item.height + 820 * delta / 1000, item.anchorY);
        item.wire.setSize(6, item.height).setDisplaySize(6, item.height).setPosition(item.anchorX, item.anchorY).setOrigin(0.5, 1);
        item.tip.setPosition(item.anchorX, item.anchorY - item.height);
      } else {
        item.tip.setAlpha(time - item.stickyUntil > -1000 ? (Math.floor(time / 100) % 2 ? 0.25 : 1) : 1);
      }

      if (item.stickyUntil && time >= item.stickyUntil) this.destroy(item);
      else if (item.wire.y - item.height <= 0) {
        if (stickyMode) item.stickyUntil = time + 3500;
        else this.destroy(item);
      }
    }
  }

  getWireBounds(): Phaser.Geom.Rectangle[] {
    return this.wires.filter((item) => item.wire.active).map((item) => item.wire.getBounds());
  }

  hitWire(index: number): void {
    const item = this.wires[index];
    if (item?.wire.active) this.destroy(item);
  }

  hitActive(item: ActiveHarpoon): void { this.destroy(item); }

  destroy(item: ActiveHarpoon): void {
    item.wire.destroy(); item.tip.destroy();
  }

  clear(): void {
    for (const item of this.wires) this.destroy(item);
    this.wires = [];
  }
}
