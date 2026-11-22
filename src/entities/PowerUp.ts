import Phaser from 'phaser';

export type PowerKind = 'freeze' | 'shield' | 'double' | 'triple' | 'sticky';

export class PowerUp extends Phaser.Physics.Arcade.Image {
  kind: PowerKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PowerKind) {
    super(scene, x, y, 'particle');
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setTint(kind === 'freeze' ? 0x00f0ff : kind === 'shield' ? 0xffffff : 0xffd700).setScale(1.5);
    this.setGravityY(950).setVelocityY(-150).setData('expiresAt', scene.time.now + 6000);
  }
}
