import Phaser from 'phaser';
import { FLOOR_Y, GAME_HEIGHT, GAME_WIDTH, TIER } from '../config/constants';
import type { WorldId, GameMode, Tier } from '../config/constants';
import { WORLDS } from '../config/themes';
import { getLevel } from '../config/levels';
import type { LevelPlatform, LevelOrb } from '../config/levels';
import { Player } from '../entities/Player';
import { Orb } from '../entities/Orb';
import { PowerUp } from '../entities/PowerUp';
import type { PowerKind } from '../entities/PowerUp';
import { SynthAudio } from '../audio/SynthAudio';
import { Harpoon } from '../entities/Harpoon';
import { setHighScore } from '../utils/storage';

export class GameScene extends Phaser.Scene {
  private world: WorldId = 'cybersec';
  private mode: GameMode = 'campaign';
  private stage = 1;
  private score = 0;
  private lives = 3;
  private remaining = 75;
  private player!: Player;
  private orbs: Orb[] = [];
  private pickups: PowerUp[] = [];
  private platforms: LevelPlatform[] = [];
  private platformObjects: Phaser.GameObjects.Rectangle[] = [];
  private ladders: Phaser.GameObjects.Rectangle[] = [];
  private ladderObjects: Phaser.GameObjects.Rectangle[] = [];
  private weapon: 'standard' | 'double' | 'triple' | 'sticky' = 'standard';
  private freezeUntil = 0;
  private freezeStart = 0;
  private clearing = false;
  private gameOverActive = false;
  private keys!: Record<'left' | 'right' | 'up' | 'down' | 'leftArrow' | 'rightArrow' | 'upArrow' | 'downArrow' | 'shoot', Phaser.Input.Keyboard.Key>;
  private audio = new SynthAudio();
  private harpoon = new Harpoon(this);
  private freezeOverlay?: Phaser.GameObjects.Rectangle;
  private freezeBar?: Phaser.GameObjects.Rectangle;
  private shieldAura?: Phaser.GameObjects.Graphics;
  private antagonistText?: Phaser.GameObjects.Text;

  constructor() { super('Game'); }

  init(data: { world: WorldId; mode: GameMode }): void {
    this.world = data.world ?? 'cybersec';
    this.mode = data.mode ?? 'campaign';
    this.lives = 3;
    this.score = 0;
    this.stage = 1;
    this.gameOverActive = false;
  }

  create(): void {
    this.lives = 3;
    this.score = 0;
    this.stage = 1;
    this.weapon = 'standard';
    this.remaining = 75;
    this.freezeUntil = 0;
    this.freezeStart = 0;
    this.clearing = false;
    this.gameOverActive = false;

    this.cameras.main.setBackgroundColor(`#${WORLDS[this.world].background}`);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.drawGrid();
    this.player = new Player(this, GAME_WIDTH / 2, FLOOR_Y - 18);
    this.input.keyboard?.on('keydown-SPACE', () => this.fire());
    this.input.keyboard?.on('keydown-M', () => this.toggleMusic());
    this.keys = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      leftArrow: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      rightArrow: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      upArrow: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      downArrow: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      shoot: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
    this.loadStage();
    this.audio.startMusic(this.world);
    this.scene.launch('UI');
    this.scene.launch('Touch');
  }

  private drawGrid(): void {
    const backgroundKey = this.world === 'cybersec' ? 'cybersec-background' : this.world === 'ai' ? 'ai-background' : 'devops-background';
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, backgroundKey).setDepth(-3);

    const antagonist = this.world === 'cybersec' ? 'AI HACKER // ONLINE' : this.world === 'ai' ? 'ROGUE LLM // TRACKING' : 'P0 INCIDENT // FAILING';
    this.add.rectangle(GAME_WIDTH / 2, 52, 260, 30, 0x101827, 0.88).setStrokeStyle(2, WORLDS[this.world].accent).setDepth(1);
    this.antagonistText = this.add.text(GAME_WIDTH / 2, 52, antagonist, { fontFamily: 'monospace', fontSize: '12px', color: WORLDS[this.world].accentHex }).setOrigin(0.5).setDepth(2);

    const grid = this.add.graphics().setDepth(-2);
    grid.lineStyle(1, WORLDS[this.world].accent, 0.12);
    for (let x = 0; x <= GAME_WIDTH; x += 40) grid.lineBetween(x, 0, x, FLOOR_Y);
    for (let y = 0; y <= FLOOR_Y; y += 40) grid.lineBetween(0, y, GAME_WIDTH, y);
    this.add.rectangle(GAME_WIDTH / 2, FLOOR_Y + 20, GAME_WIDTH, 40, 0x111927).setDepth(-1);
  }

  private loadStage(): void {
    this.clearing = false;

    this.orbs.forEach((orb) => { orb.destroyIcon(); orb.destroy(); }); this.orbs = [];
    this.pickups.forEach((pickup) => pickup.destroy()); this.pickups = [];
    this.platformObjects.forEach((platform) => platform.destroy()); this.platformObjects = [];
    this.ladders.forEach((ladder) => ladder.destroy()); this.ladders = [];
    this.harpoon.clear();

    const layout = this.mode === 'campaign' ? getLevel(this.world, this.stage) : { name: `ENDLESS // WAVE ${this.stage}`, seconds: 75, platforms: [{ x: 250, y: 350, width: 160 }, { x: 710, y: 280, width: 180 }], ladders: [{ x: 250, top: 350, bottom: FLOOR_Y }, { x: 710, top: 280, bottom: FLOOR_Y }], orbs: [{ x: 300, y: 100, tier: 3 as Tier, vx: 100 }, { x: 700, y: 150, tier: 2 as Tier, vx: -120 }] };
    this.remaining = layout.seconds;
    this.platforms = layout.platforms;
    for (const platform of this.platforms) {
      const obj = this.add.rectangle(platform.x, platform.y, platform.width, 12, platform.breakable ? 0xff2a55 : WORLDS[this.world].accent).setOrigin(0.5, 0).setDepth(8);
      this.physics.add.existing(obj, true);
      this.physics.add.collider(
        this.player,
        obj,
        undefined,
        () => this.player.state !== 'CLIMBING',
        this,
      );
      this.platformObjects.push(obj);
      obj.setData('platform', platform);
    }
    layout.ladders.forEach((ladder) => {
      const height = ladder.bottom - ladder.top;
      const obj = this.add.rectangle(ladder.x, ladder.top + height / 2, 24, height, WORLDS[this.world].accent, 0.16).setOrigin(0.5).setDepth(7);
      obj.setStrokeStyle(2, WORLDS[this.world].accent, 0.75);
      this.ladders.push(obj);
      this.ladderObjects.push(obj);
    });
    layout.orbs.forEach((orb) => this.spawnOrb(orb));
  }

  private spawnOrb(data: LevelOrb): void {
    this.orbs.push(new Orb(this, data.x, data.y, data.tier, data.vx, this.platforms, this.world));
  }

  public inputDirection(direction: number): void { this.player.move(direction); }
  public climbDirection(direction: number): void { this.player.climb(direction); }

  public fire(): void {
    if (this.gameOverActive || !this.player.active) return;
    const mode = this.weapon === 'sticky' ? 'sticky' : this.weapon;
    const tipTexture = this.world === 'cybersec' ? 'harpoon-rj45' : this.world === 'ai' ? 'harpoon-ai' : 'harpoon-devops';
    this.harpoon.fire(this.player.x, this.player.getBounds().bottom, mode, tipTexture, WORLDS[this.world].accent);
    this.audio.unlock();
    this.audio.playShoot();
  }

  update(time: number, delta: number): void {
    if (this.gameOverActive) return;

    this.harpoon.update(delta, this.weapon === 'sticky', time);

    const movingLeft = this.keys.left.isDown || this.keys.leftArrow.isDown;
    const movingRight = this.keys.right.isDown || this.keys.rightArrow.isDown;
    if (movingLeft) this.player.move(-1);
    else if (movingRight) this.player.move(1);
    else this.player.stop();
    this.player.animate(time, movingLeft || movingRight);

    const climbingUp = this.keys.up.isDown || this.keys.upArrow.isDown;
    const climbingDown = this.keys.down.isDown || this.keys.downArrow.isDown;
    if (climbingUp) this.player.climb(-1);
    else if (climbingDown) this.player.climb(1);

    if (time >= this.freezeUntil) {
      this.remaining -= delta / 1000;
      this.freezeOverlay?.destroy(); this.freezeOverlay = undefined;
      this.freezeBar?.destroy(); this.freezeBar = undefined;
    } else if (this.freezeBar) {
      const remainingRatio = Math.max(0, (this.freezeUntil - time) / (this.freezeUntil - this.freezeStart));
      this.freezeBar.setScale(remainingRatio, 1);
      this.freezeOverlay?.setAlpha(0.07 + Math.sin(time / 180) * 0.025);
    }

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      if (!orb.active) continue;
      orb.updateBounce();
      for (const active of this.harpoon.activeWires) {
        const orbBounds = orb.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(orbBounds, active.wire.getBounds()) || Phaser.Geom.Intersects.RectangleToRectangle(orbBounds, active.tip.getBounds())) {
          this.harpoon.hitActive(active);
          this.popOrb(orb, i);
          break;
        }
      }
      if (orb.active && Phaser.Geom.Intersects.RectangleToRectangle(orb.getBounds(), this.player.getBounds()) && !this.player.isInvulnerable(time)) {
        if (this.player.hit(time)) this.loseLife();
        else {
          this.audio.playShieldBreak();
          this.cameras.main.shake(0.012, 110);
          const shatter = this.add.circle(this.player.x, this.player.y, 12, 0x66d9ff, 0).setStrokeStyle(5, 0x66d9ff, 1).setDepth(35);
          this.tweens.add({ targets: shatter, scale: 3, alpha: 0, duration: 220, onComplete: () => shatter.destroy() });
          const text = this.add.text(this.player.x, this.player.y - 50, 'WAF BROKEN!', { fontFamily: 'monospace', fontSize: '14px', color: '#66d9ff' }).setOrigin(0.5).setDepth(36);
          this.tweens.add({ targets: text, y: text.y - 38, alpha: 0, duration: 700, onComplete: () => text.destroy() });
        }
      }
    }

    for (const pickup of this.pickups) {
      if (!pickup.active) continue;
      if (pickup.y >= FLOOR_Y - 16) {
        pickup.y = FLOOR_Y - 16;
        pickup.setVelocityY(0);
      }
      const expiresAt = pickup.getData('expiresAt') as number;
      const remaining = expiresAt - time;
      if (remaining <= 0) {
        pickup.destroy();
        continue;
      }
      if (remaining < 1200) pickup.setVisible(Math.floor(remaining / 150) % 2 === 0);
      if (Phaser.Geom.Intersects.RectangleToRectangle(pickup.getBounds(), this.player.getBounds())) this.collectPowerUp(pickup);
    }

    if (this.remaining <= 0) this.loseLife();

    if (!this.clearing && this.orbs.every((orb) => !orb.active)) this.levelClear();
    this.scene.get('UI').events.emit('hud', { score: this.score, lives: this.lives, time: this.remaining, weapon: this.weapon });

    if (this.shieldAura) {
      this.shieldAura.clear();
      if (this.player.shield) {
        this.shieldAura.lineStyle(3, 0x66d9ff, 0.9);
        this.shieldAura.strokeCircle(this.player.x, this.player.y, 34);
        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3 + time * 0.001;
          this.shieldAura.lineBetween(this.player.x + Math.cos(angle) * 30, this.player.y + Math.sin(angle) * 30, this.player.x + Math.cos(angle) * 38, this.player.y + Math.sin(angle) * 38);
        }
      } else {
        this.shieldAura.destroy(); this.shieldAura = undefined;
      }
    }

    let ladderX: number | undefined;
    const playerBounds = this.player.getBounds();
    for (const ladder of this.ladders) {
      const bounds = ladder.getBounds();
      const closeToLadder = Math.abs(this.player.x - bounds.centerX) <= 26;
      const overlapsLadderHeight = playerBounds.bottom >= bounds.top - 8 && playerBounds.top <= bounds.bottom + 8;
      if (closeToLadder && overlapsLadderHeight) {
        ladderX = bounds.centerX;
        break;
      }
    }
    this.player.updateLadder(ladderX, climbingUp, climbingDown, movingLeft, movingRight);

    // Harpoon entity wires are processed below.
  }

  private popOrb(orb: Orb, index: number): void {
    const tier = orb.tier;
    this.reactAntagonist(this.world === 'cybersec' ? 'AI HACKER // GLITCH!' : this.world === 'ai' ? 'ROGUE LLM // INJECTED' : 'P0 INCIDENT // COMBO');

    const points = (5 - tier) * 100;
    this.score += points;
    this.audio.playPop(tier);

    const ring = this.add.circle(orb.x, orb.y, 10, TIER[tier].color, 0).setStrokeStyle(4, TIER[tier].color, 1).setDepth(29);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 220, ease: 'Cubic.Out', onComplete: () => ring.destroy() });

    const burst = this.add.particles(orb.x, orb.y, 'particle', { speed: { min: 50, max: 180 }, lifespan: 450, quantity: tier === 4 ? 24 : 12, tint: TIER[tier].color, blendMode: Phaser.BlendModes.ADD }).setDepth(30);
    this.time.delayedCall(500, () => burst.destroy());

    const text = this.add.text(orb.x, orb.y - 20, `+${points}`, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', stroke: '#0a0e17', strokeThickness: 4 }).setOrigin(0.5).setDepth(31);
    this.tweens.add({ targets: text, y: text.y - 46, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => text.destroy() });

    if (tier >= 3) {
      this.cameras.main.shake(tier === 4 ? 0.004 : 0.002, 90);
      this.physics.world.pause();
      this.time.delayedCall(30, () => this.physics.world.resume());
    }

    orb.destroyIcon();
    orb.destroy(); this.orbs.splice(index, 1);
    if (tier > 1) {
      this.spawnOrb({ x: orb.x - 8, y: orb.y, tier: (tier - 1) as Tier, vx: -Math.abs(orb.vx) });
      this.spawnOrb({ x: orb.x + 8, y: orb.y, tier: (tier - 1) as Tier, vx: Math.abs(orb.vx) });
    }
    if (Math.random() < 0.18) this.spawnPickup(orb.x, orb.y);
    this.reactAntagonist('ORBS DETECTED');
  }

  private spawnPickup(x: number, y: number): void {
    const kinds: PowerKind[] = ['freeze', 'shield', 'double', 'triple', 'sticky'];
    const pickup = new PowerUp(this, x, y, kinds[Math.floor(Math.random() * kinds.length)]);
    this.pickups.push(pickup);
  }

  private collectPowerUp(pickup: PowerUp): void {
    if (pickup.kind === 'freeze') {
      this.freezeStart = this.time.now;
      this.freezeUntil = this.time.now + 10000;
      this.cameras.main.flash(120, 0, 240, 255);
      this.freezeOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x66d9ff, 0.10).setScrollFactor(0).setDepth(40);
      this.freezeBar = this.add.rectangle(GAME_WIDTH / 2, 38, 260, 8, 0x66d9ff, 0.9).setOrigin(0.5).setScrollFactor(0).setDepth(41);
      this.add.text(GAME_WIDTH / 2, 24, 'FREEZE 10s', { fontFamily: 'monospace', fontSize: '12px', color: '#bdfcff' }).setOrigin(0.5).setDepth(42);
      this.audio.playTimeFreeze();
    }
    if (pickup.kind === 'shield') {
      this.player.grantShield();
      this.shieldAura?.destroy();
      this.shieldAura = this.add.graphics().setDepth(19);
    }
    if (pickup.kind === 'double') this.weapon = 'double';
    if (pickup.kind === 'triple') this.weapon = 'triple';
    if (pickup.kind === 'sticky') this.weapon = 'sticky';
    this.score += 500; this.audio.playPowerUp(); pickup.destroy();
  }

  private loseLife(): void {
    if (this.gameOverActive || this.lives <= 0) return;
    this.lives -= 1;
    this.weapon = 'standard';
    this.remaining = 75;
    this.reactAntagonist(this.world === 'cybersec' ? 'AI HACKER // LAUGH' : this.world === 'ai' ? 'ROGUE LLM // BREACH' : 'P0 INCIDENT // 500');
    this.cameras.main.shake(0.012, 140);
    this.physics.world.pause();
    this.time.delayedCall(30, () => this.physics.world.resume());
    this.audio.playPlayerHit();
    if (this.lives === 0) this.gameOver();
    else { this.player.reset(); this.loadStage(); }
  }

  private levelClear(): void {
    this.clearing = true;
    this.score += Math.ceil(this.remaining) * 10;
    this.audio.playLevelClear(); setHighScore(this.world, this.mode, this.score);
    if (this.mode === 'endless') { this.stage++; this.loadStage(); }
    else if (this.stage < 5) { this.stage++; this.loadStage(); }
    else this.scene.start('Menu');
  }

  private gameOver(): void {
    if (this.gameOverActive) return;
    this.gameOverActive = true;
    this.lives = 0;
    this.physics.world.pause();
    this.harpoon.clear();
    this.orbs.forEach((orb) => { orb.destroyIcon(); orb.setVelocity(0, 0); });
    this.player.setVelocity(0, 0);

    this.audio.playGameOver();
    this.scene.get('UI').events.emit('hud', { score: this.score, lives: 0, time: 0, weapon: 'STANDARD' });
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050811, 0.92).setDepth(100);
    this.add.text(GAME_WIDTH / 2, 230, 'GAME OVER', { fontFamily: 'monospace', fontSize: '48px', color: '#ff2a55', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5).setDepth(101);
    this.add.text(GAME_WIDTH / 2, 290, `FINAL SCORE ${String(this.score).padStart(6, '0')}`, { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5).setDepth(101);
    const menuButton = this.add.text(GAME_WIDTH / 2, 350, '▶ RETURN TO MENU', { fontFamily: 'monospace', fontSize: '18px', color: '#0a0e17', backgroundColor: '#00f0ff', padding: { x: 16, y: 8 } }).setOrigin(0.5).setDepth(101).setInteractive();
    menuButton.on('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Menu'));
  }

  public toggleMusic(): boolean { return this.audio.toggleMusic(this.world); }
  public stopPlayer(): void { this.player.stop(); }

  private reactAntagonist(label: string): void {
    if (!this.antagonistText) return;
    this.antagonistText.setText(label);
    this.time.delayedCall(900, () => {
      if (!this.antagonistText) return;
      this.antagonistText.setText(this.world === 'cybersec' ? 'AI HACKER // ONLINE' : this.world === 'ai' ? 'ROGUE LLM // TRACKING' : 'P0 INCIDENT // FAILING');
    });
  }
}
