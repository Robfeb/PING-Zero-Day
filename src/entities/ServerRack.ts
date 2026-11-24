import Phaser from 'phaser';
import { FLOOR_Y } from '../config/constants';

export class ServerRack extends Phaser.GameObjects.Container {
  hp: number;
  maxHp: number;
  shieldHp = 0;
  isDestroyed = false;
  label: string;
  private sprite: Phaser.GameObjects.Image;
  private healthBar: Phaser.GameObjects.Graphics;
  private shieldGfx: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private lastHitTime = 0;

  constructor(scene: Phaser.Scene, x: number, hp = 4, label = 'SRV-01', floorY = FLOOR_Y) {
    // Grounded directly on the arena floor
    super(scene, x, floorY - 26);
    this.hp = hp;
    this.maxHp = hp;
    this.label = label;

    this.sprite = scene.add.image(0, 0, 'server-rack').setDisplaySize(64, 52);
    this.add(this.sprite);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);

    this.shieldGfx = scene.add.graphics();
    this.add(this.shieldGfx);

    this.labelText = scene.add
      .text(0, -38, label, {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '9px',
        color: '#00f0ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add(this.labelText);

    scene.add.existing(this);
    this.setDepth(9);
    this.drawHealthBar();
    this.drawShield();
  }

  getBoundsRect(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 32, this.y - 26, 64, 52);
  }

  grantShield(layers = 2): void {
    this.shieldHp = Math.min(4, this.shieldHp + layers);
    this.drawShield();

    // Pulse energy shield shockwave
    const ring = this.scene.add
      .image(this.x, this.y, 'shockwave_ring')
      .setDisplaySize(72, 60)
      .setTint(0xc77dff)
      .setDepth(31);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
  }

  repair(amount = 1): void {
    if (this.isDestroyed) {
      this.isDestroyed = false;
      this.labelText.setText(this.label);
      this.labelText.setColor('#00f0ff');
    }
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateTextureForHp();
    this.drawHealthBar();

    // Green repair sparks
    const burst = this.scene.add
      .particles(this.x, this.y, 'particle', {
        speed: { min: 30, max: 130 },
        lifespan: 300,
        quantity: 12,
        tint: 0x39ff14,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(30);
    this.scene.time.delayedCall(350, () => burst.destroy());
  }

  takeDamage(amount = 1): boolean {
    if (this.isDestroyed) return false;
    const now = this.scene.time.now;
    if (now - this.lastHitTime < 250) return false;
    this.lastHitTime = now;

    // 1. If shield is active, absorb damage completely!
    if (this.shieldHp > 0) {
      this.shieldHp -= 1;
      this.drawShield();

      const burst = this.scene.add
        .particles(this.x, this.y - 12, 'particle', {
          speed: { min: 40, max: 140 },
          lifespan: 250,
          quantity: 12,
          tint: 0xc77dff,
          blendMode: Phaser.BlendModes.ADD,
        })
        .setDepth(30);
      this.scene.time.delayedCall(300, () => burst.destroy());
      return false; // Real HP is unharmed!
    }

    this.hp = Math.max(0, this.hp - amount);

    // Spark burst effect
    const burst = this.scene.add
      .particles(this.x, this.y, 'particle', {
        speed: { min: 40, max: 150 },
        lifespan: 350,
        quantity: 14,
        tint: this.hp <= 1 ? 0xff2a55 : 0xffd700,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(30);
    this.scene.time.delayedCall(400, () => burst.destroy());

    // Sprite red hit flash
    this.sprite.setTint(0xff5555);
    this.scene.time.delayedCall(120, () => {
      if (!this.isDestroyed) this.sprite.clearTint();
    });

    this.updateTextureForHp();
    return true;
  }

  private updateTextureForHp(): void {
    if (this.hp === 0) {
      this.isDestroyed = true;
      this.sprite.setTexture('server-rack-destroyed');
      this.labelText.setText('[ OFFLINE ]');
      this.labelText.setColor('#ff2a55');
      this.healthBar.clear();
      this.shieldHp = 0;
      this.drawShield();
    } else if (this.hp === 1) {
      this.sprite.setTexture('server-rack-critical');
      this.drawHealthBar();
    } else if (this.hp <= Math.floor(this.maxHp / 2)) {
      this.sprite.setTexture('server-rack-damaged');
      this.drawHealthBar();
    } else {
      this.sprite.setTexture('server-rack');
      this.drawHealthBar();
    }
  }

  private drawShield(): void {
    this.shieldGfx.clear();
    if (this.shieldHp <= 0 || this.isDestroyed) return;

    // Glowing hexagonal barrier dome over server rack
    this.shieldGfx.lineStyle(2, 0xc77dff, 0.9);
    this.shieldGfx.fillStyle(0xc77dff, 0.18);
    this.shieldGfx.beginPath();
    this.shieldGfx.arc(0, -5, 34, Math.PI, 0, false);
    this.shieldGfx.lineTo(34, 25);
    this.shieldGfx.lineTo(-34, 25);
    this.shieldGfx.closePath();
    this.shieldGfx.fillPath();
    this.shieldGfx.strokePath();

    // Shield status pips
    const dotSpacing = 8;
    const startX = -((this.shieldHp - 1) * dotSpacing) / 2;
    for (let i = 0; i < this.shieldHp; i++) {
      this.shieldGfx.fillStyle(0x00f0ff, 1);
      this.shieldGfx.fillCircle(startX + i * dotSpacing, -44, 2.5);
    }
  }

  private drawHealthBar(): void {
    this.healthBar.clear();
    if (this.isDestroyed) return;

    const bw = 50;
    const bh = 5;
    const bx = -bw / 2;
    const by = -30;

    // Background bar
    this.healthBar.fillStyle(0x060c18, 0.9);
    this.healthBar.fillRect(bx, by, bw, bh);
    this.healthBar.lineStyle(1, 0x142840, 1);
    this.healthBar.strokeRect(bx, by, bw, bh);

    // Ratio fill
    const ratio = Math.max(0, this.hp / this.maxHp);
    const fillWidth = Math.floor(bw * ratio);

    const color = ratio > 0.5 ? 0x39ff14 : ratio > 0.25 ? 0xffd700 : 0xff2a55;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(bx + 1, by + 1, Math.max(0, fillWidth - 2), bh - 2);
  }
}
