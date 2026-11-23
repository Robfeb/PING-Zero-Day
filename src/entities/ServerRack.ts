import Phaser from 'phaser';
import { FLOOR_Y } from '../config/constants';

export class ServerRack extends Phaser.GameObjects.Container {
  hp: number;
  maxHp: number;
  isDestroyed = false;
  label: string;
  private sprite: Phaser.GameObjects.Image;
  private healthBar: Phaser.GameObjects.Graphics;
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
  }

  getBoundsRect(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 32, this.y - 26, 64, 52);
  }

  takeDamage(amount = 1): boolean {
    if (this.isDestroyed) return false;
    const now = this.scene.time.now;
    if (now - this.lastHitTime < 250) return false;
    this.lastHitTime = now;

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

    // Update texture damage progression
    if (this.hp === 0) {
      this.isDestroyed = true;
      this.sprite.setTexture('server-rack-destroyed');
      this.labelText.setText('[ OFFLINE ]');
      this.labelText.setColor('#ff2a55');
      this.healthBar.clear();
    } else if (this.hp === 1) {
      this.sprite.setTexture('server-rack-critical');
      this.drawHealthBar();
    } else if (this.hp <= Math.floor(this.maxHp / 2)) {
      this.sprite.setTexture('server-rack-damaged');
      this.drawHealthBar();
    } else {
      this.drawHealthBar();
    }

    return true;
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
