import Phaser from 'phaser';
import { FLOOR_Y, GAME_WIDTH } from '../config/constants';

export type PlayerState = 'FALLING' | 'STANDING' | 'WALKING' | 'CLIMBING' | 'HIT';

export class Player extends Phaser.Physics.Arcade.Image {
  shield = false;
  iframeUntil = 0;
  onLadder = false;
  state: PlayerState = 'FALLING';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hero_walk_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(32, 48).setCollideWorldBounds(true).setDepth(20).setTint(0x7de9ff).setGravityY(950).setVisible(true).setAlpha(1);
    this.body?.setSize(22, 28);
  }

  updateLadder(ladderX: number | undefined, up: boolean, down: boolean, left: boolean, right: boolean): void {
    if (this.state === 'CLIMBING') {
      this.x = Phaser.Math.Linear(this.x, ladderX ?? this.x, 0.28);
      this.setVelocityX(0);
      this.setGravityY(0);
      if (left || right) {
        this.state = 'WALKING';
        this.setGravityY(950);
        this.climb(0);
      } else if (up) this.climb(-1);
      else if (down) this.climb(1);
      else this.climb(0);
      return;
    }

    if (ladderX !== undefined && (up || down)) {
      this.state = 'CLIMBING';
      this.onLadder = true;
      this.x = ladderX;
      this.setGravityY(0);
      this.setVelocity(0, up ? -150 : down ? 150 : 0);
      return;
    }

    this.onLadder = false;
  }

  move(direction: number, speed = 230): void {
    if (this.state !== 'CLIMBING') this.state = direction === 0 ? 'STANDING' : 'WALKING';
    this.setVelocityX(direction * speed);
  }

  climb(direction: number): void { this.setVelocityY(direction * 150); }
  stop(): void { this.setVelocityX(0); if (this.state !== 'CLIMBING') this.setVelocityY(0); }

  isInvulnerable(time: number): boolean { return time < this.iframeUntil; }
  grantShield(): void {
    this.shield = true;
    this.setTint(0x00f0ff);
  }
  hit(time: number): boolean {
    if (this.isInvulnerable(time)) return false;
    if (this.shield) {
      this.shield = false;
      this.iframeUntil = time + 1500;
      this.setTint(0x7de9ff);
      return false;
    }
    this.iframeUntil = time + 1800;
    return true;
  }

  reset(): void { this.setPosition(GAME_WIDTH / 2, FLOOR_Y - 18); this.setVelocity(0, 0); this.state = 'FALLING'; }

  animate(time: number, moving: boolean): void {
    if (!moving) { this.setTexture('hero_walk_0'); return; }
    const frame = Math.floor(time / 120) % 4;
    this.setTexture(`hero_walk_${frame}`);
  }
}
