import Phaser from 'phaser';

export type PowerKind = 'freeze' | 'shield' | 'double' | 'triple' | 'sticky';

export class PowerUp extends Phaser.Physics.Arcade.Image {
  kind: PowerKind;
  private floatTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PowerKind) {
    const textureKey = scene.textures.exists(`pickup_${kind}`)
      ? `pickup_${kind}`
      : 'particle';
    super(scene, x, y, textureKey);
    this.kind = kind;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(34, 34)
      .setDepth(15)
      .setGravityY(950)
      .setVelocityY(-150)
      .setData('expiresAt', scene.time.now + 6000);

    this.body?.setSize(26, 26);
  }

  onLanded(): void {
    if (this.floatTween) return;
    this.setVelocity(0, 0);
    this.setGravityY(0);
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = undefined;
    }
    super.destroy(fromScene);
  }
}
