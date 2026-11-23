import Phaser from 'phaser';
import { FLOOR_Y, GAME_WIDTH } from '../config/constants';

export type PlayerState = 'FALLING' | 'STANDING' | 'WALKING' | 'CLIMBING' | 'JUMPING';

export class Player extends Phaser.Physics.Arcade.Image {
  shield = false;
  iframeUntil = 0;
  firingUntil = 0;
  onLadder = false;
  state: PlayerState = 'FALLING';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hero_walk_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(38, 56)
      .setCollideWorldBounds(true)
      .setDepth(20)
      .setGravityY(950)
      .setVisible(true)
      .setAlpha(1);
    this.body?.setSize(22, 42);
    this.body?.setOffset(8, 14);
  }

  isGrounded(): boolean {
    return Boolean(this.body?.blocked.down || this.body?.touching.down);
  }

  jump(direction = 0): boolean {
    if (this.state === 'CLIMBING') return false;
    if (this.isGrounded()) {
      this.setVelocityY(-480);
      if (direction !== 0) {
        this.setVelocityX(direction * 250);
        this.setFlipX(direction < 0);
      }
      this.state = 'JUMPING';
      this.setTexture('hero_jump');
      return true;
    }
    return false;
  }

  updateLadder(
    ladderX: number | undefined,
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  ): void {
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

    // Enter climb only if centered and not already jumping
    if (ladderX !== undefined && (up || down) && Math.abs(this.x - ladderX) <= 18) {
      this.state = 'CLIMBING';
      this.onLadder = true;
      this.x = ladderX;
      this.setGravityY(0);
      this.setVelocity(0, up ? -160 : down ? 160 : 0);
      return;
    }

    this.onLadder = false;
  }

  move(direction: number, speed = 230): void {
    if (this.state !== 'CLIMBING') {
      if (this.isGrounded()) {
        this.state = direction === 0 ? 'STANDING' : 'WALKING';
      }
    }
    if (direction < 0) {
      this.setFlipX(true);
    } else if (direction > 0) {
      this.setFlipX(false);
    }
    this.setVelocityX(direction * speed);
  }

  climb(direction: number): void {
    this.setVelocityY(direction * 160);
  }

  stop(): void {
    this.setVelocityX(0);
    if (this.state !== 'CLIMBING') {
      if (this.isGrounded()) this.setVelocityY(0);
    }
  }

  firePose(time: number): void {
    this.firingUntil = time + 200;
  }

  isInvulnerable(time: number): boolean {
    return time < this.iframeUntil;
  }

  grantShield(): void {
    this.shield = true;
  }

  hit(time: number): boolean {
    if (this.isInvulnerable(time)) return false;
    if (this.shield) {
      this.shield = false;
      this.iframeUntil = time + 1500;
      return false;
    }
    this.iframeUntil = time + 1800;
    return true;
  }

  reset(x = GAME_WIDTH / 2, y = FLOOR_Y - 26): void {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.state = 'FALLING';
    this.setAlpha(1);
    this.clearTint();
  }

  animate(time: number, moving: boolean): void {
    // I-frame blinking effect
    if (time < this.iframeUntil) {
      this.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.35 : 0.95);
    } else {
      this.setAlpha(1);
    }

    // Climbing state
    if (this.state === 'CLIMBING') {
      const climbingActive = Math.abs(this.body?.velocity.y ?? 0) > 10;
      if (climbingActive) {
        const climbFrame = Math.floor(time / 140) % 2;
        this.setTexture(`hero_climb_${climbFrame}`);
      } else {
        this.setTexture('hero_climb_0');
      }
      return;
    }

    // Mid-air Jump Pose
    if (!this.isGrounded()) {
      this.setTexture('hero_jump');
      return;
    }

    if (time < this.firingUntil) {
      this.setTexture('hero_fire');
      return;
    }

    if (!moving) {
      this.setTexture('hero_walk_0');
      return;
    }

    const frame = Math.floor(time / 110) % 4;
    this.setTexture(`hero_walk_${frame}`);
  }
}
