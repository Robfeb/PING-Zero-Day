import Phaser from 'phaser';
import { FLOOR_Y, GAME_WIDTH } from '../config/constants';

export type PlayerState = 'FALLING' | 'STANDING' | 'WALKING' | 'CLIMBING' | 'JUMPING';

export interface ActiveLadderBounds {
  x: number;
  top: number;
  bottom: number;
}

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
    this.setDisplaySize(46, 60)
      .setCollideWorldBounds(true)
      .setDepth(20)
      .setGravityY(950)
      .setVisible(true)
      .setAlpha(1);
    this.body?.setSize(22, 44);
    this.body?.setOffset(12, 14);
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
    ladder: ActiveLadderBounds | undefined,
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  ): void {
    const feetY = this.body ? this.body.bottom : this.y + 28;

    if (this.state === 'CLIMBING') {
      // If player is no longer on a valid ladder, exit climb immediately
      if (!ladder) {
        this.state = 'FALLING';
        this.setGravityY(950);
        this.onLadder = false;
        return;
      }

      // Smooth horizontal snap to ladder center
      this.x = Phaser.Math.Linear(this.x, ladder.x, 0.35);
      this.setVelocityX(0);

      // Check if player dismounts horizontally
      if (left || right) {
        this.state = 'WALKING';
        this.setGravityY(950);
        this.onLadder = false;
        this.climb(0);
        return;
      }

      // Reached the TOP of the ladder! Clamp and step onto the platform
      if (up && feetY <= ladder.top + 6) {
        if (this.body) {
          this.y = ladder.top - this.body.height / 2 - this.body.offset.y + 2;
        } else {
          this.y = ladder.top - 28;
        }
        this.state = 'STANDING';
        this.setGravityY(950);
        this.setVelocityY(0);
        this.onLadder = false;
        return;
      }

      // Reached the BOTTOM of the ladder! Clamp and stand on floor
      if (down && feetY >= ladder.bottom - 2) {
        this.state = 'STANDING';
        this.setGravityY(950);
        this.setVelocityY(0);
        this.onLadder = false;
        return;
      }

      // Actively climbing within ladder bounds
      this.setGravityY(0);
      if (up) {
        this.climb(-1);
      } else if (down) {
        this.climb(1);
      } else {
        this.climb(0);
      }
      return;
    }

    // Entering ladder from standing or falling
    if (ladder && (up || down) && Math.abs(this.x - ladder.x) <= 22) {
      // Only enter climb if player is within vertical ladder bounds
      const canClimbUp = up && feetY > ladder.top + 8 && feetY <= ladder.bottom + 12;
      const canClimbDown = down && feetY >= ladder.top - 6 && feetY < ladder.bottom - 4;

      if (canClimbUp || canClimbDown) {
        this.state = 'CLIMBING';
        this.onLadder = true;
        this.x = ladder.x;
        this.setGravityY(0);
        this.setVelocity(0, up ? -160 : 160);
        return;
      }
    }

    this.onLadder = false;
  }

  move(direction: number, speed = 230): void {
    if (!this.body) return;
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
    if (!this.body) return;
    this.setVelocityY(direction * 160);
  }

  stop(): void {
    if (!this.body) return;
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
    if (this.body) {
      this.setVelocity(0, 0);
    }
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
