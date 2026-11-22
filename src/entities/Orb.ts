import Phaser from 'phaser';
import { FLOOR_Y, GRAVITY, TIER } from '../config/constants';
import type { Tier } from '../config/constants';
import type { LevelPlatform } from '../config/levels';

export class Orb extends Phaser.Physics.Arcade.Image {
  tier: Tier;
  vx: number;
  private platforms: LevelPlatform[];
  frozen = false;
  private bounceVy: number;
  private icon?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, tier: Tier, vx: number, platforms: LevelPlatform[], world: 'cybersec' | 'ai' | 'devops' = 'cybersec') {
    super(scene, x, y, `orb${tier}`);
    this.tier = tier;
    this.vx = vx;
    this.platforms = platforms;
    this.bounceVy = TIER[tier].bounceVy;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const radius = TIER[tier].radius;
    this.setDisplaySize(radius * 2, radius * 2).setDepth(12).setVisible(true).setAlpha(1).setCircle(radius, 0, 0).setCollideWorldBounds(true).setBounce(0).setGravityY(GRAVITY);
    this.body?.setCircle(radius);
    this.setVelocity(vx, -220);
    const symbol = world === 'cybersec' ? 'PKG' : world === 'ai' ? 'AI' : 'BUG';
    this.icon = scene.add.text(x, y, symbol, { fontFamily: 'monospace', fontSize: radius >= 30 ? '12px' : '8px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(13);
  }

  updateBounce(): void {
    if (this.frozen) {
      this.setVelocity(0, 0);
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    const radius = TIER[this.tier].radius;
    const worldWidth = this.scene.scale.width;

    if ((body?.blocked.left || this.x <= radius) && this.vx < 0) {
      this.vx = Math.abs(this.vx);
    } else if ((body?.blocked.right || this.x >= worldWidth - radius) && this.vx > 0) {
      this.vx = -Math.abs(this.vx);
    }

    this.setVelocityX(this.vx);
    if (body?.blocked.down || body?.touching.down) {
      this.setVelocityY(this.bounceVy);
    }

    let platformSurface: number | undefined;
    for (const platform of this.platforms) {
      const left = platform.x - platform.width / 2;
      const right = platform.x + platform.width / 2;
      if (this.x >= left && this.x <= right && this.y + radius >= platform.y && this.y + radius <= platform.y + 14 && this.body!.velocity.y > 0) {
        platformSurface = platform.y;
      }
    }

    if (platformSurface !== undefined) {
      this.y = platformSurface - radius;
      this.setVelocityY(this.bounceVy);
    } else if (this.y + radius >= FLOOR_Y && this.body!.velocity.y > 0) {
      this.y = FLOOR_Y - radius;
      this.setVelocityY(this.bounceVy);
    }

    this.icon?.setPosition(this.x, this.y);
  }

  destroyIcon(): void {
    this.icon?.destroy();
    this.icon = undefined;
  }
}
