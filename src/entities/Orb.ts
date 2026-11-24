import Phaser from 'phaser';
import { FLOOR_Y, GRAVITY, TIER } from '../config/constants';
import type { Tier } from '../config/constants';
import type { LevelPlatform } from '../config/levels';

export class Orb extends Phaser.Physics.Arcade.Image {
  tier: Tier;
  vx: number;
  private platforms: LevelPlatform[];
  frozen = false;
  bounceVy: number;
  private floorY: number;
  private squashTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    tier: Tier,
    vx: number,
    platforms: LevelPlatform[],
    world: 'cybersec' | 'ai' | 'devops' = 'cybersec',
    floorY = FLOOR_Y,
  ) {
    const textureKey = scene.textures.exists(`orb_${world}_${tier}`)
      ? `orb_${world}_${tier}`
      : `orb${tier}`;
    super(scene, x, y, textureKey);

    this.tier = tier;
    this.vx = vx;
    this.platforms = platforms;
    this.bounceVy = TIER[tier].bounceVy;
    this.floorY = floorY;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const radius = TIER[tier].radius;
    // The texture has outer neon brackets and glow padding
    const texture = scene.textures.get(textureKey);
    const src = texture.getSourceImage() as HTMLCanvasElement | undefined;
    const renderSize = src?.width ?? (radius * 2.5);

    this.setDisplaySize(renderSize, renderSize)
      .setDepth(12)
      .setVisible(true)
      .setAlpha(1)
      .setCollideWorldBounds(true)
      .setBounce(0)
      .setGravityY(GRAVITY);

    // Strict circular collision hitbox aligned to center
    const offset = (renderSize / 2) - radius;
    this.body?.setCircle(radius, offset, offset);

    this.setVelocity(vx, -220);
  }

  setFrozen(freeze: boolean): void {
    this.frozen = freeze;
    if (!this.active || !this.body) return;
    if (freeze) {
      this.setVelocity(0, 0);
      this.setTint(0x88eeff);
    } else {
      this.clearTint();
      this.setVelocity(this.vx, this.bounceVy * 0.5);
    }
  }

  bounceUp(): void {
    if (!this.active || !this.body) return;
    this.setVelocityY(this.bounceVy);
    this.triggerBounceJuice();
  }

  private triggerBounceJuice(): void {
    if (!this.active) return;
    if (this.squashTween?.isPlaying()) return;
    const baseScaleX = this.scaleX;
    const baseScaleY = this.scaleY;
    this.squashTween = this.scene.tweens.add({
      targets: this,
      scaleX: baseScaleX * 1.15,
      scaleY: baseScaleY * 0.85,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        if (!this.active) return;
        this.setScale(baseScaleX, baseScaleY);
        this.squashTween = undefined;
      },
    });
  }

  updateBounce(): void {
    if (!this.active || !this.body) return;
    if (this.frozen) {
      this.setVelocity(0, 0);
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    const radius = TIER[this.tier].radius;
    const worldWidth = this.scene.physics.world.bounds.width || this.scene.scale.width;

    // Spin gently as it moves
    this.setRotation(this.rotation + this.vx * 0.0008);

    if ((body.blocked.left || this.x <= radius) && this.vx < 0) {
      this.vx = Math.abs(this.vx);
    } else if ((body.blocked.right || this.x >= worldWidth - radius) && this.vx > 0) {
      this.vx = -Math.abs(this.vx);
    }

    this.setVelocityX(this.vx);

    if (body.blocked.down || body.touching.down) {
      this.setVelocityY(this.bounceVy);
      this.triggerBounceJuice();
    }

    let platformSurface: number | undefined;
    for (const platform of this.platforms) {
      const left = platform.x - platform.width / 2;
      const right = platform.x + platform.width / 2;
      if (
        this.x >= left &&
        this.x <= right &&
        this.y + radius >= platform.y &&
        this.y + radius <= platform.y + 14 &&
        body.velocity.y > 0
      ) {
        platformSurface = platform.y;
      }
    }

    if (platformSurface !== undefined) {
      this.y = platformSurface - radius;
      this.setVelocityY(this.bounceVy);
      this.triggerBounceJuice();
    } else if (this.y + radius >= this.floorY && body.velocity.y > 0) {
      this.y = this.floorY - radius;
      this.setVelocityY(this.bounceVy);
      this.triggerBounceJuice();
    }
  }

  destroyIcon(): void {
    // Retained for API compatibility with existing GameScene calls
  }

  destroy(fromScene?: boolean): void {
    if (this.squashTween) {
      this.squashTween.stop();
      this.squashTween = undefined;
    }
    super.destroy(fromScene);
  }
}
