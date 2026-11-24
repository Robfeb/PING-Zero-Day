import Phaser from 'phaser';

export class PatchBullet extends Phaser.Physics.Arcade.Image {
  private dirX: number;
  private dirY: number;
  private speed = 920;

  constructor(scene: Phaser.Scene, x: number, y: number, angleRad = 0) {
    super(scene, x, y, 'bullet_patch');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.dirX = Math.sin(angleRad);
    this.dirY = -Math.cos(angleRad);

    this.setDisplaySize(20, 50)
      .setRotation(angleRad)
      .setDepth(19)
      .setAlpha(1);

    this.setVelocity(this.dirX * this.speed, this.dirY * this.speed);
    this.body?.setSize(18, 46);
  }

  updateTrail(): void {
    if (!this.active) return;
    if (Math.random() < 0.45) {
      const spark = this.scene.add
        .circle(
          this.x - this.dirX * 22 + (Math.random() * 6 - 3),
          this.y - this.dirY * 22 + (Math.random() * 6 - 3),
          1.8,
          0x39ff14,
          0.9,
        )
        .setDepth(18);
      this.scene.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.3,
        duration: 180,
        onComplete: () => spark.destroy(),
      });
    }
  }
}
