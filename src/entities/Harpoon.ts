import Phaser from 'phaser';

export type HarpoonMode = 'standard' | 'double' | 'triple' | 'sticky';

export interface ActiveHarpoon {
  wire: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Rectangle;
  tip: Phaser.GameObjects.Image;
  anchorX: number;
  anchorY: number;
  height: number;
  angleRad: number;
  dirX: number;
  dirY: number;
  stickyUntil?: number;
  sparkTimer?: number;
}

export class Harpoon {
  private scene: Phaser.Scene;
  private wires: ActiveHarpoon[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get activeCount(): number {
    return this.wires.filter((item) => item.wire.active).length;
  }

  get activeWires(): ActiveHarpoon[] {
    return this.wires.filter((item) => item.wire.active);
  }

  fire(
    playerX: number,
    playerBottom: number,
    mode: HarpoonMode,
    tipTexture = 'harpoon-rj45',
    _wireColor = 0x00f0ff,
    baseAngleRad = 0,
  ): void {
    const limit = mode === 'triple' ? 3 : mode === 'double' ? 2 : 1;
    if (this.activeCount >= limit) return;
    const count = limit;

    const textureKey = this.scene.textures.exists(tipTexture) ? tipTexture : 'harpoon-rj45';
    const wireTexture = this.scene.textures.exists('wire_beam') ? 'wire_beam' : undefined;

    // Multi-shot angles: spread symmetrically around baseAngleRad
    const angleOffsets: number[] =
      count === 3 ? [-0.22, 0, 0.22] : count === 2 ? [-0.12, 0.12] : [0];

    for (let i = 0; i < count; i++) {
      const angle = baseAngleRad + angleOffsets[i];
      const dirX = Math.sin(angle);
      const dirY = -Math.cos(angle);

      const anchorX =
        playerX + (count === 3 ? (i - 1) * 12 : count === 2 ? (i === 0 ? -8 : 8) : 0);
      const anchorY = playerBottom;

      let wire: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Rectangle;
      if (wireTexture) {
        wire = this.scene.add
          .tileSprite(anchorX, anchorY, 12, 20, wireTexture)
          .setOrigin(0.5, 1)
          .setRotation(angle)
          .setDepth(18)
          .setVisible(true)
          .setAlpha(1);
      } else {
        wire = this.scene.add
          .rectangle(anchorX, anchorY, 6, 20, _wireColor, 0.95)
          .setOrigin(0.5, 1)
          .setRotation(angle)
          .setDepth(18)
          .setVisible(true)
          .setAlpha(1);
      }

      this.scene.physics.add.existing(wire);
      const tipX = anchorX + dirX * 20;
      const tipY = anchorY + dirY * 20;

      const tip = this.scene.add
        .image(tipX, tipY, textureKey)
        .setDisplaySize(24, 34)
        .setRotation(angle)
        .setDepth(19)
        .setVisible(true)
        .setAlpha(1);

      this.wires.push({
        wire,
        tip,
        anchorX,
        anchorY,
        height: 20,
        angleRad: angle,
        dirX,
        dirY,
      });
    }
  }

  update(delta: number, stickyMode: boolean, time: number): void {
    const worldWidth = this.scene.physics.world.bounds.width || this.scene.scale.width;

    for (const item of this.wires) {
      if (!item.wire.active) continue;

      if (!item.stickyUntil) {
        // Grow outward along angle vector
        item.height = Math.min(item.height + (950 * delta) / 1000, 800);
        item.wire.setSize(item.wire.width, item.height);
        item.wire.setDisplaySize(item.wire.width, item.height);

        // Compute current tip position
        item.tip.x = item.anchorX + item.dirX * item.height;
        item.tip.y = item.anchorY + item.dirY * item.height;

        // Animate electric pulses streaming upward along the tether
        if (item.wire instanceof Phaser.GameObjects.TileSprite) {
          item.wire.tilePositionY -= (delta / 1000) * 600;
        }

        const reachedMax = item.height >= 800;
        const reachedBoundary = item.tip.y <= 0 || item.tip.x <= 0 || item.tip.x >= worldWidth;

        if (reachedMax || reachedBoundary) {
          if (stickyMode) {
            item.stickyUntil = time + 3500;
          } else {
            this.destroy(item);
          }
        }
      } else {
        // Sticky latched flashing in final 1.0s
        const flashing = time - item.stickyUntil > -1000;
        const alpha = flashing ? (Math.floor(time / 90) % 2 === 0 ? 0.25 : 1) : 1;
        item.tip.setAlpha(alpha);
        item.wire.setAlpha(alpha);

        // Latch spark shower
        if (!item.sparkTimer || time > item.sparkTimer) {
          item.sparkTimer = time + 200;
          const spark = this.scene.add
            .circle(item.tip.x + (Math.random() * 8 - 4), item.tip.y + 4, 2, 0x00f0ff, 0.8)
            .setDepth(20);
          this.scene.tweens.add({
            targets: spark,
            y: spark.y + 16,
            alpha: 0,
            duration: 200,
            onComplete: () => spark.destroy(),
          });
        }

        if (time >= item.stickyUntil) {
          this.destroy(item);
        }
      }
    }

    // Prune inactive wires to prevent memory and state leaks
    this.wires = this.wires.filter((item) => item.wire.active && item.tip.active);
  }

  // Precise beam-to-orb circle collision detection for any firing angle
  intersectsOrb(item: ActiveHarpoon, orbX: number, orbY: number, orbRadius: number): boolean {
    if (!item.wire.active || !item.tip.active) return false;

    // Check distance from orb center to line segment [anchor -> tip]
    const ax = item.anchorX;
    const ay = item.anchorY;
    const bx = item.tip.x;
    const by = item.tip.y;

    const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
    let dist: number;
    if (l2 === 0) {
      dist = Math.hypot(orbX - ax, orbY - ay);
    } else {
      let t = ((orbX - ax) * (bx - ax) + (orbY - ay) * (by - ay)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = ax + t * (bx - ax);
      const projY = ay + t * (by - ay);
      dist = Math.hypot(orbX - projX, orbY - projY);
    }

    return dist <= orbRadius + 7;
  }

  // Precise beam-to-rectangle collision for breakable and solid platforms
  intersectsRect(item: ActiveHarpoon, rect: Phaser.Geom.Rectangle): boolean {
    if (!item.wire.active || !item.tip.active) return false;
    const line = new Phaser.Geom.Line(item.anchorX, item.anchorY, item.tip.x, item.tip.y);
    return (
      Phaser.Geom.Intersects.LineToRectangle(line, rect) ||
      Phaser.Geom.Intersects.RectangleToRectangle(item.tip.getBounds(), rect)
    );
  }

  hitActive(item: ActiveHarpoon): void {
    this.destroy(item);
  }

  destroy(item: ActiveHarpoon): void {
    item.wire.destroy();
    item.tip.destroy();
  }

  clear(): void {
    for (const item of this.wires) this.destroy(item);
    this.wires = [];
  }
}
