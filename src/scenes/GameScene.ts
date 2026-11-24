import Phaser from 'phaser';
import { FLOOR_Y, GAME_HEIGHT, GAME_WIDTH, TIER } from '../config/constants';
import type { WorldId, GameMode, Tier } from '../config/constants';
import { WORLDS } from '../config/themes';
import { getLevel } from '../config/levels';
import type { LevelPlatform, LevelOrb, BossObjective, LevelLayout } from '../config/levels';
import { Player, type ActiveLadderBounds } from '../entities/Player';
import { Orb } from '../entities/Orb';
import { PowerUp } from '../entities/PowerUp';
import type { PowerKind } from '../entities/PowerUp';
import { SynthAudio } from '../audio/SynthAudio';
import { Harpoon } from '../entities/Harpoon';
import { ServerRack } from '../entities/ServerRack';
import { PatchBullet } from '../entities/PatchBullet';
import { setHighScore } from '../utils/storage';
import { Logger } from '../utils/logger';

export class GameScene extends Phaser.Scene {
  private world: WorldId = 'cybersec';
  private mode: GameMode = 'campaign';
  private stage = 1;
  private score = 0;
  private lives = 5;
  private remaining = 75;
  private player!: Player;
  private orbs: Orb[] = [];
  private pickups: PowerUp[] = [];
  private platforms: LevelPlatform[] = [];
  private platformObjects: Phaser.GameObjects.TileSprite[] = [];
  private ladders: Phaser.GameObjects.TileSprite[] = [];
  private servers: ServerRack[] = [];
  private serverLedges: Phaser.GameObjects.Rectangle[] = [];
  private weapon: 'standard' | 'double' | 'triple' | 'sticky' | 'patch' = 'standard';
  private savedHarpoonWeapon: 'standard' | 'double' | 'triple' | 'sticky' = 'standard';
  private patchBullets: PatchBullet[] = [];
  private freezeUntil = 0;
  private freezeStart = 0;
  private clearing = false;
  private gameOverActive = false;
  private lastPopTime = 0;
  private comboCount = 0;
  private aimReticle?: Phaser.GameObjects.Image;
  private lastPointerPos = { x: 480, y: 200 };
  private mouseAimActive = false;
  private aimMode: 'vertical' | 'angled' = 'vertical';
  private currentFloorY = FLOOR_Y;
  private bossSprite?: Phaser.GameObjects.Image;
  private bossData?: BossObjective;
  private bossHp = 0;
  private bossMaxHp = 0;
  private bossText?: Phaser.GameObjects.Text;
  private bossBarGfx?: Phaser.GameObjects.Graphics;
  private arenaFloorGfx?: Phaser.GameObjects.Graphics;
  private arenaBg?: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image;
  private keys!: Record<
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'leftArrow'
    | 'rightArrow'
    | 'upArrow'
    | 'downArrow'
    | 'shoot'
    | 'aimToggle',
    Phaser.Input.Keyboard.Key
  >;
  private audio = new SynthAudio();
  private harpoon = new Harpoon(this);
  private freezeOverlay?: Phaser.GameObjects.Rectangle;
  private freezeBar?: Phaser.GameObjects.Rectangle;
  private freezeText?: Phaser.GameObjects.Text;
  private shieldAura?: Phaser.GameObjects.Graphics;
  private antagonistText?: Phaser.GameObjects.Text;
  private antagonistBox?: Phaser.GameObjects.Graphics;

  constructor() {
    super('Game');
  }

  init(data: { world: WorldId; mode: GameMode }): void {
    this.world = data.world ?? 'cybersec';
    this.mode = data.mode ?? 'campaign';
    this.lives = 5;
    this.score = 0;
    this.stage = 1;
    this.gameOverActive = false;
    this.comboCount = 0;
    Logger.info(`Game initialized: Sector ${this.world}, Protocol ${this.mode}`);
  }

  create(): void {
    this.lives = 5;
    this.score = 0;
    this.stage = 1;
    this.weapon = 'standard';
    this.remaining = 75;
    this.freezeUntil = 0;
    this.freezeStart = 0;
    this.clearing = false;
    this.gameOverActive = false;
    this.comboCount = 0;
    this.aimMode = 'vertical';

    this.cameras.main.setBackgroundColor(`#${WORLDS[this.world].background}`);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.player = new Player(this, GAME_WIDTH / 2, FLOOR_Y - 26);

    // Aim reticle dot
    this.aimReticle = this.add
      .image(GAME_WIDTH / 2, FLOOR_Y - 70, 'laser_dot')
      .setDepth(25)
      .setAlpha(0.65);

    // Multi-directional Mouse / Touch Click Aiming
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.lastPointerPos.x = pointer.x;
      this.lastPointerPos.y = pointer.y;
      this.mouseAimActive = true;
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Fire if clicked inside playing arena (below top HUD banner)
      if (pointer.y > 38 && !this.gameOverActive) {
        if (this.aimMode === 'angled') {
          const dx = pointer.x - this.player.x;
          const dy = pointer.y - (this.player.y - 12);
          let angleRad = Math.atan2(dx, -dy);
          angleRad = Phaser.Math.Clamp(
            angleRad,
            -Phaser.Math.DegToRad(72),
            Phaser.Math.DegToRad(72),
          );
          this.fire(angleRad);
        } else {
          // Default vertical straight up!
          this.fire(0);
        }
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.fire());
    this.input.keyboard?.on('keydown-M', () => this.toggleMusic());
    this.input.keyboard?.on('keydown-R', () => this.resetCurrentStage());
    this.input.keyboard?.on('keydown-V', () => this.toggleAimMode());
    this.input.keyboard?.on('keydown-T', () => this.toggleAimMode());
    this.input.keyboard?.on('keydown-Q', () => this.toggleWeapon());
    this.input.keyboard?.on('keydown-E', () => this.toggleWeapon());
    this.input.keyboard?.on('keydown-X', () => this.toggleWeapon());
    this.input.keyboard?.on('keydown-L', () => (this.scene.get('UI') as any)?.toggleLogsModal());
    this.input.keyboard?.on('keydown-BACKTICK', () => (this.scene.get('UI') as any)?.toggleLogsModal());

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
      aimToggle: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T),
    };

    this.loadStage();
    this.audio.startMusic(this.world, true);
    this.scene.launch('UI');
    this.scene.launch('Touch');
    Logger.info(`Stage 1 loaded. Operative ready with 5 nodes.`);
  }

  private drawArena(worldW: number, worldH: number, floorY: number): void {
    const backgroundKey =
      this.world === 'cybersec'
        ? 'cybersec-background'
        : this.world === 'ai'
        ? 'ai-background'
        : 'devops-background';

    if (this.arenaBg) {
      this.arenaBg.destroy();
    }
    this.arenaBg = this.add
      .tileSprite(0, 0, worldW, worldH, backgroundKey)
      .setOrigin(0, 0)
      .setDepth(-10);

    // Interactive Antagonist Top HUD Monitor
    if (!this.antagonistBox) {
      this.antagonistBox = this.add.graphics().setDepth(2).setScrollFactor(0);
    }
    this.drawAntagonistBox(WORLDS[this.world].accent);

    const defaultTitle =
      this.world === 'cybersec'
        ? '[ ◉ ACTIVE ] AI HACKER // ONLINE'
        : this.world === 'ai'
        ? '[ ◉ ACTIVE ] ROGUE LLM // TRACKING'
        : '[ ◉ ACTIVE ] CI/CD PIPELINE // MONITORING';

    if (!this.antagonistText) {
      this.antagonistText = this.add
        .text(GAME_WIDTH / 2, 48, defaultTitle, {
          fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
          fontSize: '11px',
          color: WORLDS[this.world].accentHex,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(3)
        .setScrollFactor(0);
    }

    // High-Tech Industrial Cyber Floor (from floorY to worldH)
    if (!this.arenaFloorGfx) {
      this.arenaFloorGfx = this.add.graphics().setDepth(-1);
    }
    this.arenaFloorGfx.clear();
    this.arenaFloorGfx.fillStyle(0x060c16, 1);
    this.arenaFloorGfx.fillRect(0, floorY, worldW, worldH - floorY);

    // Glowing Neon Floor Border Runner
    this.arenaFloorGfx.lineStyle(2.5, WORLDS[this.world].accent, 0.95);
    this.arenaFloorGfx.lineBetween(0, floorY, worldW, floorY);
    this.arenaFloorGfx.lineStyle(1, WORLDS[this.world].accent, 0.35);
    this.arenaFloorGfx.lineBetween(0, floorY + 3, worldW, floorY + 3);

    // Hazard caution ticks along the floor rim
    this.arenaFloorGfx.lineStyle(1.5, WORLDS[this.world].accent, 0.55);
    for (let x = 10; x < worldW; x += 24) {
      this.arenaFloorGfx.lineBetween(x, floorY + 3, x + 8, floorY + 11);
    }

    // Floor seam bolts
    this.arenaFloorGfx.fillStyle(0x182c44, 0.8);
    for (let x = 30; x < worldW; x += 80) {
      this.arenaFloorGfx.fillCircle(x, floorY + 22, 2.5);
    }
  }

  private drawAntagonistBox(color: number): void {
    if (!this.antagonistBox) return;
    this.antagonistBox.clear();
    const bx = GAME_WIDTH / 2 - 160;
    const by = 35;
    const bw = 320;
    const bh = 26;

    this.antagonistBox.fillStyle(0x060c16, 0.92);
    this.antagonistBox.fillRect(bx, by, bw, bh);

    this.antagonistBox.lineStyle(1.8, color, 0.85);
    this.antagonistBox.strokeRect(bx, by, bw, bh);

    this.antagonistBox.lineStyle(2.5, color, 1);
    this.antagonistBox.lineBetween(bx, by, bx + 10, by);
    this.antagonistBox.lineBetween(bx, by, bx, by + 8);
    this.antagonistBox.lineBetween(bx + bw - 10, by, bx + bw, by);
    this.antagonistBox.lineBetween(bx + bw, by, bx + bw, by + 8);
    this.antagonistBox.lineBetween(bx, by + bh, bx + 10, by + bh);
    this.antagonistBox.lineBetween(bx, by + bh - 8, bx, by + bh);
    this.antagonistBox.lineBetween(bx + bw - 10, by + bh, bx + bw, by + bh);
    this.antagonistBox.lineBetween(bx + bw, by + bh - 8, bx + bw, by + bh);
  }

  private loadStage(): void {
    this.clearing = false;
    this.physics.world.resume();

    this.orbs.forEach((orb) => orb.destroy());
    this.orbs = [];
    this.pickups.forEach((pickup) => pickup.destroy());
    this.pickups = [];
    this.platformObjects.forEach((platform) => platform.destroy());
    this.platformObjects = [];
    this.ladders.forEach((ladder) => ladder.destroy());
    this.ladders = [];
    this.servers.forEach((server) => server.destroy());
    this.servers = [];
    this.serverLedges.forEach((ledge) => ledge.destroy());
    this.serverLedges = [];
    this.patchBullets.forEach((bullet) => bullet.destroy());
    this.patchBullets = [];
    this.harpoon.clear();

    if (this.bossSprite) {
      this.bossSprite.destroy();
      this.bossSprite = undefined;
    }
    if (this.bossBarGfx) {
      this.bossBarGfx.destroy();
      this.bossBarGfx = undefined;
    }
    if (this.bossText) {
      this.bossText.destroy();
      this.bossText = undefined;
    }

    const layout: LevelLayout =
      this.mode === 'campaign'
        ? getLevel(this.world, this.stage)
        : {
            name: `ENDLESS // WAVE ${this.stage}`,
            seconds: 75,
            worldWidth: GAME_WIDTH,
            worldHeight: GAME_HEIGHT,
            floorY: FLOOR_Y,
            platforms: [
              { x: 250, y: 350, width: 160 },
              { x: 710, y: 280, width: 180 },
            ],
            ladders: [
              { x: 250, top: 350, bottom: FLOOR_Y },
              { x: 710, top: 280, bottom: FLOOR_Y },
            ],
            orbs: [
              { x: 300, y: 100, tier: 3 as Tier, vx: 100 },
              { x: 700, y: 150, tier: 2 as Tier, vx: -120 },
            ],
            servers:
              this.stage % 2 === 0
                ? [{ x: 480, hp: 4, label: `DEFEND-SRV ${this.stage}` }]
                : [],
          };

    const worldW = layout.worldWidth ?? GAME_WIDTH;
    const worldH = layout.worldHeight ?? GAME_HEIGHT;
    const floorY = layout.floorY ?? FLOOR_Y;
    this.currentFloorY = floorY;

    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    this.drawArena(worldW, worldH, floorY);

    // Initial player placement
    if (this.world === 'ai') {
      this.player.reset(GAME_WIDTH / 2, floorY - 26);
    } else if (this.world === 'devops') {
      this.player.reset(120, floorY - 26);
    } else {
      this.player.reset(GAME_WIDTH / 2, floorY - 26);
    }

    if (worldW > GAME_WIDTH || worldH > GAME_HEIGHT) {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    } else {
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
    }

    this.remaining = layout.seconds;
    this.platforms = layout.platforms;

    // Build procedural cyber platforms
    for (const platform of this.platforms) {
      const textureKey = platform.breakable ? 'platform-breakable' : 'platform-solid';
      const obj = this.add
        .tileSprite(platform.x, platform.y, platform.width, 14, textureKey)
        .setOrigin(0.5, 0)
        .setDepth(8);

      this.physics.add.existing(obj, true);
      (obj.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
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

    // Build procedural cyber ladders
    layout.ladders.forEach((ladder) => {
      const height = ladder.bottom - ladder.top;
      const obj = this.add
        .tileSprite(ladder.x, ladder.top + height / 2, 28, height, 'ladder-rung')
        .setOrigin(0.5)
        .setDepth(7);
      this.ladders.push(obj);
    });

    // Spawn server defense infrastructure if defined in stage
    if (layout.servers && layout.servers.length > 0) {
      for (const s of layout.servers) {
        const rack = new ServerRack(this, s.x, s.hp ?? 4, s.label ?? 'SRV-01', floorY);
        this.servers.push(rack);

        // Solid walkable top ledge so hero can jump up and walk on top of servers
        const ledge = this.add.rectangle(s.x, rack.y - 26, 60, 8, 0x000000, 0);
        this.physics.add.existing(ledge, true);
        const ledgeBody = ledge.body as Phaser.Physics.Arcade.StaticBody;
        ledgeBody.checkCollision.down = false;
        ledgeBody.checkCollision.left = false;
        ledgeBody.checkCollision.right = false;
        ledgeBody.checkCollision.up = true;
        this.physics.add.collider(
          this.player,
          ledge,
          undefined,
          () => this.player.state !== 'CLIMBING',
          this,
        );
        this.serverLedges.push(ledge);
      }
    }

    // Spawn boss objective if defined in stage
    if (layout.boss) {
      this.bossData = layout.boss;
      this.bossHp = layout.boss.hp;
      this.bossMaxHp = layout.boss.hp;
      const bossTex =
        layout.boss.type === 'tokens_core' ? 'tokens-core-boss' : 'deploy-terminal-boss';
      this.bossSprite = this.add.image(layout.boss.x, layout.boss.y, bossTex).setDepth(15);

      this.tweens.add({
        targets: this.bossSprite,
        y: layout.boss.y + 6,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.bossText = this.add
        .text(layout.boss.x, layout.boss.y - 48, layout.boss.name, {
          fontFamily: "'Orbitron', monospace",
          fontSize: '11px',
          color: layout.boss.type === 'tokens_core' ? '#c77dff' : '#7cff6b',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(16);

      this.bossBarGfx = this.add.graphics().setDepth(16);
      this.drawBossHealthBar();
    } else {
      this.bossData = undefined;
      this.bossHp = 0;
      this.bossMaxHp = 0;
    }

    layout.orbs.forEach((orb) => this.spawnOrb(orb));
  }

  private drawBossHealthBar(): void {
    if (!this.bossBarGfx || !this.bossSprite || this.bossMaxHp <= 0) return;
    this.bossBarGfx.clear();
    const bx = this.bossSprite.x - 65;
    const by = this.bossSprite.y - 34;
    const bw = 130;
    const bh = 7;
    const ratio = Math.max(0, this.bossHp / this.bossMaxHp);

    this.bossBarGfx.fillStyle(0x060c16, 0.9);
    this.bossBarGfx.fillRect(bx, by, bw, bh);

    const barColor = this.bossData?.type === 'tokens_core' ? 0xc77dff : 0x7cff6b;
    this.bossBarGfx.fillStyle(barColor, 0.95);
    this.bossBarGfx.fillRect(bx, by, bw * ratio, bh);

    this.bossBarGfx.lineStyle(1.4, 0xffffff, 0.7);
    this.bossBarGfx.strokeRect(bx, by, bw, bh);
  }

  private damageBoss(amount = 1): void {
    if (this.bossHp <= 0 || !this.bossSprite) return;
    this.bossHp = Math.max(0, this.bossHp - amount);
    this.audio.playBossHit();
    this.cameras.main.shake(0.009, 90);
    this.score += 200;

    this.bossSprite.setTint(0xff2a55);
    this.time.delayedCall(120, () => this.bossSprite?.clearTint());

    const dmgText = this.add
      .text(
        this.bossSprite.x + (Math.random() * 40 - 20),
        this.bossSprite.y - 50,
        '-1 CRITICAL!',
        {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#ff2a55',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setDepth(35);
    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 30,
      alpha: 0,
      duration: 650,
      onComplete: () => dmgText.destroy(),
    });

    this.drawBossHealthBar();

    if (this.bossHp <= 0) {
      this.audio.playBossDefeated();
      this.cameras.main.shake(0.018, 250);
      this.score += 5000;
      this.reactAntagonist(
        this.bossData?.type === 'tokens_core'
          ? '[ ☠ CORE DESTROYED ] MODEL WEIGHTS PURGED!'
          : '[ ☠ DEPLOY GATE PASSED ] HOTFIX SHIPPED TO PROD!',
        0x39ff14,
      );

      // Explosive shockwave & particle blast
      const shock = this.add
        .image(this.bossSprite.x, this.bossSprite.y, 'shockwave_ring')
        .setTint(this.bossData?.type === 'tokens_core' ? 0xc77dff : 0x7cff6b)
        .setScale(0.5)
        .setDepth(30);
      this.tweens.add({
        targets: shock,
        scale: 4,
        alpha: 0,
        duration: 400,
        onComplete: () => shock.destroy(),
      });

      const burst = this.add
        .particles(this.bossSprite.x, this.bossSprite.y, 'particle', {
          speed: { min: 80, max: 320 },
          lifespan: 600,
          quantity: 40,
          tint: this.bossData?.type === 'tokens_core' ? 0xc77dff : 0x7cff6b,
          blendMode: Phaser.BlendModes.ADD,
        })
        .setDepth(31);
      this.time.delayedCall(700, () => burst.destroy());

      this.bossSprite.destroy();
      this.bossSprite = undefined;
      this.bossBarGfx?.destroy();
      this.bossBarGfx = undefined;
      this.bossText?.destroy();
      this.bossText = undefined;

      this.time.delayedCall(500, () => this.levelClear());
    } else {
      this.reactAntagonist(
        `[ ⚠ BOSS DAMAGED ] ${this.bossData?.name} ${this.bossHp}/${this.bossMaxHp} HP`,
        0xffd700,
      );
    }
  }

  private spawnOrb(data: LevelOrb): void {
    this.orbs.push(
      new Orb(
        this,
        data.x,
        data.y,
        data.tier,
        data.vx,
        this.platforms,
        this.world,
        this.currentFloorY,
      ),
    );
  }

  public toggleAimMode(): 'vertical' | 'angled' {
    this.aimMode = this.aimMode === 'vertical' ? 'angled' : 'vertical';
    const isVertical = this.aimMode === 'vertical';

    const toastMsg = isVertical ? '⇡ AIM: VERTICAL (DEFAULT)' : '⤢ AIM: ANGLED / FREE';
    const toast = this.add
      .text(this.player.x, this.player.y - 45, toastMsg, {
        fontFamily: "'Orbitron', monospace",
        fontSize: '11px',
        color: isVertical ? '#00f0ff' : '#ffd700',
        backgroundColor: '#060f1c',
        padding: { x: 8, y: 4 },
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(50);
    this.tweens.add({
      targets: toast,
      y: toast.y - 25,
      alpha: 0,
      duration: 750,
      onComplete: () => toast.destroy(),
    });

    this.scene.get('UI').events.emit('aim-mode', this.aimMode);
    return this.aimMode;
  }

  public getAimMode(): 'vertical' | 'angled' {
    return this.aimMode;
  }

  public jumpPlayer(): void {
    if (this.gameOverActive || !this.player.active) return;
    const movingLeft = this.keys.left.isDown || this.keys.leftArrow.isDown;
    const movingRight = this.keys.right.isDown || this.keys.rightArrow.isDown;
    const dir = movingLeft ? -1 : movingRight ? 1 : 0;
    if (this.player.jump(dir)) {
      this.audio.playJump();
    }
  }

  public inputDirection(direction: number): void {
    this.player.move(direction);
  }

  public climbDirection(direction: number): void {
    this.player.climb(direction);
  }

  // Multi-directional Harpoon Shooting
  public fire(explicitAngleRad?: number): void {
    if (this.gameOverActive || !this.player.active) return;
    const mode = this.weapon === 'sticky' ? 'sticky' : this.weapon;
    const tipTexture =
      this.world === 'cybersec'
        ? 'harpoon-rj45'
        : this.world === 'ai'
        ? 'harpoon-ai'
        : 'harpoon-devops';

    let angleRad = 0; // Default straight up!

    if (this.aimMode === 'angled') {
      if (explicitAngleRad !== undefined) {
        angleRad = explicitAngleRad;
      } else {
        const left = this.keys.left.isDown || this.keys.leftArrow.isDown;
        const right = this.keys.right.isDown || this.keys.rightArrow.isDown;

        if (left && !right) {
          angleRad = -0.58; // ~ -33 degrees left
        } else if (right && !left) {
          angleRad = 0.58; // ~ +33 degrees right
        } else if (this.mouseAimActive) {
          const dx = this.lastPointerPos.x - this.player.x;
          const dy = this.lastPointerPos.y - (this.player.y - 12);
          angleRad = Phaser.Math.Clamp(
            Math.atan2(dx, -dy),
            -Phaser.Math.DegToRad(70),
            Phaser.Math.DegToRad(70),
          );
        }
      }
    } else {
      // Aim mode is 'vertical' (default):
      // Only use explicit angle if triggered from angled touch controls
      if (explicitAngleRad !== undefined && Math.abs(explicitAngleRad) > 0.1) {
        angleRad = explicitAngleRad;
      } else {
        angleRad = 0;
      }
    }

    if (angleRad < -0.15) {
      this.player.setFlipX(true);
    } else if (angleRad > 0.15) {
      this.player.setFlipX(false);
    }

    // 1. If PATCH weapon is active: shoot high-velocity vertical "PATCH" bullet!
    if (this.weapon === 'patch') {
      const activeBullets = this.patchBullets.filter((b) => b.active);
      if (activeBullets.length >= 4) return;

      const bullet = new PatchBullet(this, this.player.x, this.player.y - 18, angleRad);
      this.patchBullets.push(bullet);
      this.player.firePose(this.time.now);
      this.audio.unlock();
      this.audio.playPatchShoot();
      return;
    }

    // 2. Otherwise shoot Harpoon (unlimited fixed on roof!):
    this.harpoon.fire(
      this.player.x,
      this.player.getBounds().bottom,
      mode === 'patch' ? 'standard' : mode,
      tipTexture,
      WORLDS[this.world].accent,
      angleRad,
    );
    this.player.firePose(this.time.now);
    this.audio.unlock();
    this.audio.playShoot();
  }

  // Toggle between Harpoon and PATCH Blaster weapons
  public toggleWeapon(): 'harpoon' | 'patch' {
    if (this.weapon === 'patch') {
      this.weapon = this.savedHarpoonWeapon;
    } else {
      this.savedHarpoonWeapon = this.weapon;
      this.weapon = 'patch';
    }
    this.audio.playWeaponSwitch();
    this.scene.get('UI').events.emit('hud', {
      score: this.score,
      lives: this.lives,
      time: Math.ceil(this.remaining),
      weapon: this.weapon.toUpperCase(),
      aimMode: this.aimMode,
    });
    const label =
      this.weapon === 'patch'
        ? 'WEAPON: [ 💊 PATCH BLASTER ]'
        : `WEAPON: [ ⚡ HARPOON (${this.weapon.toUpperCase()}) ]`;
    const toast = this.add
      .text(this.player.x, this.player.y - 45, label, {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        color: this.weapon === 'patch' ? '#39ff14' : '#00f0ff',
        backgroundColor: '#0a1424cc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(45);
    this.tweens.add({
      targets: toast,
      y: toast.y - 25,
      alpha: 0,
      duration: 650,
      onComplete: () => toast.destroy(),
    });
    return this.weapon === 'patch' ? 'patch' : 'harpoon';
  }

  // Reset Current Level Option
  public resetCurrentStage(): void {
    if (this.gameOverActive) return;
    this.physics.world.resume();
    this.cameras.main.flash(140, 255, 140, 0);

    const resetMsg = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '↺ LEVEL REINITIALIZED', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '18px',
        color: '#ff8c00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(90);

    this.tweens.add({
      targets: resetMsg,
      y: resetMsg.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => resetMsg.destroy(),
    });

    this.player.reset();
    this.loadStage();
  }

  update(time: number, delta: number): void {
    if (this.gameOverActive) return;
    try {
      this.harpoon.update(delta, this.weapon === 'sticky', time);

    const movingLeft = this.keys.left.isDown || this.keys.leftArrow.isDown;
    const movingRight = this.keys.right.isDown || this.keys.rightArrow.isDown;
    if (movingLeft) this.player.move(-1);
    else if (movingRight) this.player.move(1);
    else this.player.stop();

    this.player.animate(time, movingLeft || movingRight);

    const climbingUp = this.keys.up.isDown || this.keys.upArrow.isDown;
    const climbingDown = this.keys.down.isDown || this.keys.downArrow.isDown;
    if (climbingUp && this.player.state === 'CLIMBING') this.player.climb(-1);
    else if (climbingDown && this.player.state === 'CLIMBING') this.player.climb(1);

    // Ladder proximity & alignment with strict height boundaries
    let activeLadder: ActiveLadderBounds | undefined;
    const playerBounds = this.player.getBounds();
    for (const ladder of this.ladders) {
      const bounds = ladder.getBounds();
      const closeToLadder = Math.abs(this.player.x - bounds.centerX) <= 24;
      const overlapsLadderHeight =
        playerBounds.bottom >= bounds.top - 10 && playerBounds.top <= bounds.bottom + 10;
      if (closeToLadder && overlapsLadderHeight) {
        activeLadder = {
          x: bounds.centerX,
          top: bounds.top,
          bottom: bounds.bottom,
        };
        break;
      }
    }
    this.player.updateLadder(activeLadder, climbingUp, climbingDown, movingLeft, movingRight);

    // Hero Jump Mechanics (W / Up Arrow or mobile touch jump)
    const justPressedJump =
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.upArrow);
    if (justPressedJump && this.player.state !== 'CLIMBING') {
      const nearLadder = activeLadder !== undefined && Math.abs(this.player.x - activeLadder.x) <= 18;
      if (!nearLadder || movingLeft || movingRight) {
        const dir = movingLeft ? -1 : movingRight ? 1 : 0;
        if (this.player.jump(dir)) {
          this.audio.playJump();
        }
      }
    }

    // Update Aim Reticle Sight
    if (this.aimReticle) {
      let aimAngle = 0;
      if (this.aimMode === 'angled') {
        if (movingLeft) aimAngle = -0.58;
        else if (movingRight) aimAngle = 0.58;
        else if (this.mouseAimActive) {
          const dx = this.lastPointerPos.x - this.player.x;
          const dy = this.lastPointerPos.y - (this.player.y - 12);
          aimAngle = Phaser.Math.Clamp(
            Math.atan2(dx, -dy),
            -Phaser.Math.DegToRad(70),
            Phaser.Math.DegToRad(70),
          );
        }
      } else {
        // Vertical Straight Up by default!
        aimAngle = 0;
      }
      this.aimReticle.setPosition(
        this.player.x + Math.sin(aimAngle) * 44,
        this.player.y - 12 - Math.cos(aimAngle) * 44,
      );
    }

    // Freeze Countdown Timer Logic
    if (time >= this.freezeUntil) {
      this.remaining -= delta / 1000;
      if (this.freezeOverlay) {
        this.freezeOverlay.destroy();
        this.freezeOverlay = undefined;
      }
      if (this.freezeBar) {
        this.freezeBar.destroy();
        this.freezeBar = undefined;
      }
      if (this.freezeText) {
        this.freezeText.destroy();
        this.freezeText = undefined;
      }
      this.orbs.forEach((orb) => {
        if (orb.frozen) orb.setFrozen(false);
      });
    } else if (this.freezeBar) {
      const remainingRatio = Math.max(
        0,
        (this.freezeUntil - time) / (this.freezeUntil - this.freezeStart),
      );
      this.freezeBar.setScale(remainingRatio, 1);
      this.freezeOverlay?.setAlpha(0.08 + Math.sin(time / 160) * 0.03);
      const remainingSeconds = Math.ceil((this.freezeUntil - time) / 1000);
      this.freezeText?.setText(`❄ TIME FREEZE ACTIVE // ${remainingSeconds}s`);
    }

    // Update active PATCH bullets & Collisions
    const worldWidth = this.physics.world.bounds.width || this.scale.width;
    for (let bIdx = this.patchBullets.length - 1; bIdx >= 0; bIdx--) {
      const bullet = this.patchBullets[bIdx];
      if (!bullet.active) continue;
      bullet.updateTrail();

      // Check boundary
      if (bullet.y <= 0 || bullet.x <= 0 || bullet.x >= worldWidth) {
        bullet.destroy();
        this.patchBullets.splice(bIdx, 1);
        continue;
      }

      // 1. Hit Boss
      if (this.bossSprite?.active && this.bossHp > 0) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), this.bossSprite.getBounds())) {
          bullet.destroy();
          this.patchBullets.splice(bIdx, 1);
          this.damageBoss(3);
          const hitText = this.add
            .text(bullet.x, bullet.y - 15, 'HOTFIX! -3 HP', {
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '11px',
              color: '#39ff14',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setDepth(40);
          this.tweens.add({
            targets: hitText,
            y: hitText.y - 25,
            alpha: 0,
            duration: 500,
            onComplete: () => hitText.destroy(),
          });
          continue;
        }
      }

      // 2. Hit Server Rack: REPAIR or FORTIFY!
      let serverHit = false;
      for (const server of this.servers) {
        if (server.isDestroyed) continue;
        if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), server.getBoundsRect())) {
          bullet.destroy();
          this.patchBullets.splice(bIdx, 1);
          serverHit = true;
          if (server.hp < server.maxHp) {
            server.repair(1);
            this.audio.playServerHeal();
            const text = this.add
              .text(server.x, server.y - 45, '+1 HP HOTFIX PATCHED!', {
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '11px',
                color: '#39ff14',
                fontStyle: 'bold',
              })
              .setOrigin(0.5)
              .setDepth(35);
            this.tweens.add({
              targets: text,
              y: text.y - 25,
              alpha: 0,
              duration: 600,
              onComplete: () => text.destroy(),
            });
          } else {
            server.grantShield(1);
            this.audio.playServerShield();
            const text = this.add
              .text(server.x, server.y - 45, 'FIREWALL SHIELD +1!', {
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '11px',
                color: '#c77dff',
                fontStyle: 'bold',
              })
              .setOrigin(0.5)
              .setDepth(35);
            this.tweens.add({
              targets: text,
              y: text.y - 25,
              alpha: 0,
              duration: 600,
              onComplete: () => text.destroy(),
            });
          }
          break;
        }
      }
      if (serverHit) continue;

      // 3. Hit Platforms
      let platformHit = false;
      for (let pIdx = this.platformObjects.length - 1; pIdx >= 0; pIdx--) {
        const pObj = this.platformObjects[pIdx];
        if (!pObj.active) continue;
        const pData = pObj.getData('platform') as LevelPlatform | undefined;
        if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), pObj.getBounds())) {
          bullet.destroy();
          this.patchBullets.splice(bIdx, 1);
          platformHit = true;
          if (pData?.breakable) {
            this.audio.playBlockBreak();
            this.score += 250;
            pObj.destroy();
            this.platformObjects.splice(pIdx, 1);
            this.platforms = this.platforms.filter((p) => p !== pData);
          }
          break;
        }
      }
      if (platformHit) continue;

      // 4. Hit Threat Orbs!
      let orbHit = false;
      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const orb = this.orbs[i];
        if (!orb.active) continue;
        const radius = TIER[orb.tier].radius;
        const dist = Math.hypot(bullet.x - orb.x, bullet.y - orb.y);
        if (dist <= radius + 10) {
          bullet.destroy();
          this.patchBullets.splice(bIdx, 1);
          this.popOrb(orb, i);
          orbHit = true;
          const patchText = this.add
            .text(orb.x, orb.y - 20, 'PATCHED!', {
              fontFamily: "'Orbitron', monospace",
              fontSize: '12px',
              color: '#39ff14',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setDepth(35);
          this.tweens.add({
            targets: patchText,
            y: patchText.y - 25,
            alpha: 0,
            duration: 500,
            onComplete: () => patchText.destroy(),
          });
          break;
        }
      }
      if (orbHit) continue;
    }

    // Check Harpoon Collisions with Boss Objective
    if (this.bossSprite && this.bossSprite.active && this.bossHp > 0) {
      const bBounds = this.bossSprite.getBounds();
      for (const active of this.harpoon.activeWires) {
        if (this.harpoon.intersectsRect(active, bBounds)) {
          this.harpoon.hitActive(active);
          this.damageBoss(1);
          break;
        }
      }
    }

    // Orb updates & Collisions
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      if (!orb.active || !orb.body) continue;
      orb.updateBounce();
      const radius = TIER[orb.tier].radius;

      // Check Harpoon Collisions with Orbs (using multi-directional beam test)
      let orbPopped = false;
      for (const active of this.harpoon.activeWires) {
        if (this.harpoon.intersectsOrb(active, orb.x, orb.y, radius)) {
          this.harpoon.hitActive(active);
          this.popOrb(orb, i);
          orbPopped = true;
          break;
        }
      }
      if (orbPopped || !orb.active || !orb.body) continue;

      // Check Server Rack Impacts from Orbs
      for (const server of this.servers) {
        if (server.isDestroyed) continue;

        // Servers are 100% safe when off-screen!
        const inCameraView = this.cameras.main.worldView.contains(server.x, server.y);
        if (!inCameraView) continue;

        const sBounds = server.getBoundsRect();

        // Check if orb hits server surface
        if (
          orb.x + radius >= sBounds.left &&
          orb.x - radius <= sBounds.right &&
          orb.y + radius >= sBounds.top &&
          orb.y - radius <= sBounds.bottom
        ) {
          // Bounce orb upward safely
          if (orb.active && orb.body) {
            orb.y = sBounds.top - radius;
            orb.bounceUp();
          }

          if (server.takeDamage(1)) {
            this.audio.playServerHit();
            this.cameras.main.shake(0.007, 80);

            const damageText = this.add
              .text(server.x, server.y - 45, '-1 HP!', {
                fontFamily: "'Orbitron', monospace",
                fontSize: '11px',
                color: '#ff2a55',
                fontStyle: 'bold',
              })
              .setOrigin(0.5)
              .setDepth(35);
            this.tweens.add({
              targets: damageText,
              y: damageText.y - 25,
              alpha: 0,
              duration: 600,
              onComplete: () => damageText.destroy(),
            });

            if (server.isDestroyed) {
              this.audio.playServerDestroyed();
              this.cameras.main.shake(0.014, 140);
              this.reactAntagonist('[ ☠ CRITICAL LOSS ] SERVER OFFLINE!', 0xff2a55);
            } else {
              this.reactAntagonist(
                '[ ⚠ INFRASTRUCTURE ATTACK ] SERVER IMPACT!',
                0xffd700,
              );
            }
          }
        }
      }

      // Check Player Collisions with Orbs
      if (
        orb.active &&
        orb.body &&
        this.player.active &&
        this.player.body &&
        Phaser.Geom.Intersects.RectangleToRectangle(orb.getBounds(), this.player.getBounds()) &&
        !this.player.isInvulnerable(time)
      ) {
        if (this.player.hit(time)) {
          this.loseLife();
        } else {
          // Shield absorbed hit!
          this.audio.playShieldBreak();
          this.cameras.main.shake(0.012, 110);

          const shatter = this.add
            .circle(this.player.x, this.player.y, 14, 0x00f0ff, 0)
            .setStrokeStyle(5, 0x00f0ff, 1)
            .setDepth(35);
          this.tweens.add({
            targets: shatter,
            scale: 3.2,
            alpha: 0,
            duration: 220,
            onComplete: () => shatter.destroy(),
          });

          const text = this.add
            .text(this.player.x, this.player.y - 48, 'WAF SHIELD BROKEN!', {
              fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
              fontSize: '13px',
              color: '#00f0ff',
              fontStyle: 'bold',
              stroke: '#000000',
              strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(36);
          this.tweens.add({
            targets: text,
            y: text.y - 36,
            alpha: 0,
            duration: 700,
            onComplete: () => text.destroy(),
          });
        }
      }
    }

    // Server Cluster Failure Condition: ONLY in Cybersec defense arena!
    // In AI and DevOps modes, the objective is escaping & destroying the boss.
    if (
      this.world === 'cybersec' &&
      this.servers.length > 0 &&
      this.servers.every((s) => s.isDestroyed)
    ) {
      if (!this.gameOverActive) {
        Logger.warn('All cybersec server clusters offline! Mission failure triggered.');
        this.lives = 0;
        this.gameOver();
      }
      return;
    }

    // Check Harpoon Collisions with Platforms (Breakable & Solid)
    for (let pIdx = this.platformObjects.length - 1; pIdx >= 0; pIdx--) {
      const pObj = this.platformObjects[pIdx];
      if (!pObj.active) continue;
      const pData = pObj.getData('platform') as LevelPlatform | undefined;
      const pBounds = pObj.getBounds();

      for (const active of this.harpoon.activeWires) {
        if (this.harpoon.intersectsRect(active, pBounds)) {
          if (pData?.breakable) {
            this.harpoon.hitActive(active);
            this.audio.playBlockBreak();
            this.score += 250;

            // Shatter debris burst
            const burst = this.add
              .particles(pBounds.centerX, pBounds.centerY, 'particle', {
                speed: { min: 40, max: 180 },
                lifespan: 400,
                quantity: 20,
                tint: 0xff2a55,
                blendMode: Phaser.BlendModes.ADD,
              })
              .setDepth(30);
            this.time.delayedCall(450, () => burst.destroy());

            const text = this.add
              .text(pBounds.centerX, pBounds.centerY - 10, '+250 BYPASS!', {
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                fontSize: '12px',
                color: '#ff8c00',
                stroke: '#000000',
                strokeThickness: 3,
              })
              .setOrigin(0.5)
              .setDepth(31);
            this.tweens.add({
              targets: text,
              y: text.y - 30,
              alpha: 0,
              duration: 600,
              onComplete: () => text.destroy(),
            });

            pObj.destroy();
            this.platformObjects.splice(pIdx, 1);
            this.platforms = this.platforms.filter((p) => p !== pData);
          } else {
            // Solid platform: anchors firmly as an unlimited fixed harpoon!
            if (!active.isFixed) {
              active.isFixed = true;
              active.fixedAt = time;
            }
          }
          break;
        }
      }
    }

    // Power-up updates & collections
    for (const pickup of this.pickups) {
      if (!pickup.active) continue;
      if (pickup.y >= this.currentFloorY - 18) {
        pickup.y = this.currentFloorY - 18;
        pickup.onLanded();
      }

      const expiresAt = pickup.getData('expiresAt') as number;
      const remaining = expiresAt - time;
      if (remaining <= 0) {
        pickup.destroy();
        continue;
      }
      if (remaining < 1400) {
        pickup.setVisible(Math.floor(remaining / 130) % 2 === 0);
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(pickup.getBounds(), this.player.getBounds())) {
        this.collectPowerUp(pickup);
      }
    }

    // Time expiry check
    if (this.remaining <= 0) {
      if (!this.gameOverActive) {
        Logger.warn('Mission timer expired! Mission failure triggered.');
        this.lives = 0;
        this.gameOver();
      }
      return;
    }

    // Stage clear check (boss destroyed or all orbs popped)
    if (!this.clearing) {
      if (this.bossData) {
        if (this.bossHp <= 0) {
          this.levelClear();
        }
      } else if (this.orbs.every((orb) => !orb.active)) {
        this.levelClear();
      }
    }

    // Emit HUD telemetry with server defense and boss statistics
    this.scene.get('UI').events.emit('hud', {
      score: this.score,
      lives: this.lives,
      time: this.remaining,
      weapon: this.weapon,
      aimMode: this.aimMode,
      serversTotal: this.servers.length,
      serversAlive: this.servers.filter((s) => !s.isDestroyed).length,
      bossName: this.bossData?.name,
      bossHp: this.bossHp,
      bossMaxHp: this.bossMaxHp,
    });

    // Animate Rotating Hexagonal WAF Shield Aura
    if (this.shieldAura) {
      this.shieldAura.clear();
      if (this.player.shield) {
        const hexRadius = 32;
        this.shieldAura.lineStyle(2.5, 0x00f0ff, 0.95);

        this.shieldAura.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + time * 0.002;
          const hx = this.player.x + Math.cos(angle) * hexRadius;
          const hy = this.player.y + Math.sin(angle) * hexRadius;
          if (i === 0) this.shieldAura.moveTo(hx, hy);
          else this.shieldAura.lineTo(hx, hy);
        }
        this.shieldAura.closePath();
        this.shieldAura.strokePath();

        this.shieldAura.fillStyle(0x00f0ff, 0.9);
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + time * 0.002;
          const hx = this.player.x + Math.cos(angle) * hexRadius;
          const hy = this.player.y + Math.sin(angle) * hexRadius;
          this.shieldAura.fillCircle(hx, hy, 2.5);
        }
      } else {
        this.shieldAura.destroy();
        this.shieldAura = undefined;
      }
    }
  } catch (err) {
    Logger.error(`Error in GameScene.update(): ${err}`, { stack: (err as any)?.stack });
  }
}

private popOrb(orb: Orb, index: number): void {
    const tier = orb.tier;
    const now = this.time.now;

    if (now - this.lastPopTime < 1300) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastPopTime = now;

    const basePoints = (5 - tier) * 100;
    const comboMultiplier = Math.min(4, this.comboCount);
    const points = basePoints * comboMultiplier;
    this.score += points;
    this.audio.playPop(tier);

    if (this.comboCount > 1) {
      this.reactAntagonist(
        this.world === 'cybersec'
          ? `[ ⚡ COMBO x${this.comboCount} ] AI HACKER // GLITCHING!`
          : this.world === 'ai'
          ? `[ ⚡ COMBO x${this.comboCount} ] ROGUE LLM // SYSTEM BREACH!`
          : `[ ⚡ COMBO x${this.comboCount} ] CI/CD // ROLLBACK OVERDRIVE!`,
        0xffd700,
      );
    } else {
      this.reactAntagonist(
        this.world === 'cybersec'
          ? '[ ⚠ BREACH ] AI HACKER // PACKET DESTROYED'
          : this.world === 'ai'
          ? '[ ⚠ JAILBREAK ] ROGUE LLM // INJECTION PURGED'
          : '[ ⚠ RESOLVED ] CI/CD // HOTFIX APPLIED',
        WORLDS[this.world].accent,
      );
    }

    const shockwave = this.add
      .image(orb.x, orb.y, 'shockwave_ring')
      .setTint(TIER[tier].color)
      .setScale(0.4)
      .setAlpha(1)
      .setDepth(29);
    this.tweens.add({
      targets: shockwave,
      scale: 2.3,
      alpha: 0,
      duration: 230,
      ease: 'Cubic.Out',
      onComplete: () => shockwave.destroy(),
    });

    const burst = this.add
      .particles(orb.x, orb.y, 'particle', {
        speed: { min: 60, max: 210 },
        lifespan: 450,
        quantity: tier === 4 ? 26 : 14,
        tint: TIER[tier].color,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(30);
    this.time.delayedCall(500, () => burst.destroy());

    const text = this.add
      .text(orb.x, orb.y - 20, `+${points}`, {
        fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#040813',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(31);
    this.tweens.add({
      targets: text,
      y: text.y - 44,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.Out',
      onComplete: () => text.destroy(),
    });

    if (this.comboCount > 1) {
      const comboText = this.add
        .text(orb.x, orb.y - 38, `${this.comboCount}x COMBO!`, {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(32);
      this.tweens.add({
        targets: comboText,
        y: comboText.y - 28,
        alpha: 0,
        duration: 750,
        onComplete: () => comboText.destroy(),
      });
    }

    if (tier >= 3) {
      this.cameras.main.shake(tier === 4 ? 0.005 : 0.003, 90);
    }

    orb.destroyIcon();
    orb.destroy();
    this.orbs.splice(index, 1);

    if (tier > 1) {
      this.spawnOrb({
        x: orb.x - 8,
        y: orb.y,
        tier: (tier - 1) as Tier,
        vx: -Math.abs(orb.vx),
      });
      this.spawnOrb({
        x: orb.x + 8,
        y: orb.y,
        tier: (tier - 1) as Tier,
        vx: Math.abs(orb.vx),
      });
    }

    if (Math.random() < 0.18) this.spawnPickup(orb.x, orb.y);
  }

  private spawnPickup(x: number, y: number): void {
    const kinds: PowerKind[] = ['freeze', 'shield', 'double', 'triple', 'sticky', 'patch', 'firewall'];
    const pickup = new PowerUp(this, x, y, kinds[Math.floor(Math.random() * kinds.length)]);
    this.pickups.push(pickup);
  }

  private collectPowerUp(pickup: PowerUp): void {
    const labels: Record<PowerKind, string> = {
      freeze: '+500 TIME FREEZE 10s',
      shield: '+500 WAF SHIELD ACTIVE',
      double: '+500 DUAL HARPOON',
      triple: '+500 TRIPLE HARPOON',
      sticky: '+500 STICKY ROOF HARPOON',
      patch: '+500 💊 PATCH BLASTER EQUIPPED',
      firewall: '+500 🛡 SERVER FIREWALL ARMED',
    };

    if (pickup.kind === 'freeze') {
      this.freezeStart = this.time.now;
      this.freezeUntil = this.time.now + 10000;
      this.cameras.main.flash(140, 0, 240, 255);

      this.freezeOverlay = this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x00f0ff, 0.1)
        .setScrollFactor(0)
        .setDepth(40);

      this.freezeBar = this.add
        .rectangle(GAME_WIDTH / 2, 38, 280, 7, 0x00f0ff, 0.95)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(41);

      this.freezeText = this.add
        .text(GAME_WIDTH / 2, 24, '❄ TIME FREEZE ACTIVE // 10s', {
          fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#bdfcff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(42);

      this.orbs.forEach((orb) => orb.setFrozen(true));
      this.audio.playTimeFreeze();
    }

    if (pickup.kind === 'shield') {
      this.player.grantShield();
      this.servers.forEach((s) => s.grantShield(1));
      this.shieldAura?.destroy();
      this.shieldAura = this.add.graphics().setDepth(19);
    }

    if (pickup.kind === 'firewall') {
      this.servers.forEach((s) => s.grantShield(2));
      this.audio.playServerShield();
    }

    if (pickup.kind === 'patch') {
      this.savedHarpoonWeapon = this.weapon === 'patch' ? this.savedHarpoonWeapon : this.weapon;
      this.weapon = 'patch';
      this.audio.playWeaponSwitch();
    }

    if (pickup.kind === 'double') this.weapon = 'double';
    if (pickup.kind === 'triple') this.weapon = 'triple';
    if (pickup.kind === 'sticky') this.weapon = 'sticky';

    this.scene.get('UI').events.emit('hud', {
      score: this.score,
      lives: this.lives,
      time: Math.ceil(this.remaining),
      weapon: this.weapon.toUpperCase(),
      aimMode: this.aimMode,
    });

    const text = this.add
      .text(pickup.x, pickup.y - 20, labels[pickup.kind], {
        fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
        fontSize: '12px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(35);
    this.tweens.add({
      targets: text,
      y: text.y - 35,
      alpha: 0,
      duration: 750,
      onComplete: () => text.destroy(),
    });

    this.score += 500;
    this.audio.playPowerUp();
    pickup.destroy();
  }

  private loseLife(): void {
    if (this.gameOverActive || this.lives <= 0) return;
    this.lives -= 1;
    this.comboCount = 0;

    this.cameras.main.shake(0.016, 180);
    this.audio.playPlayerHit();

    // Update HUD telemetry immediately
    this.scene.get('UI').events.emit('hud', {
      score: this.score,
      lives: this.lives,
      time: Math.ceil(this.remaining),
      weapon: this.weapon.toUpperCase(),
      aimMode: this.aimMode,
    });

    if (this.lives === 0) {
      Logger.error('All 5 operative nodes depleted! System shutdown.');
      this.reactAntagonist(
        this.world === 'cybersec'
          ? '[ ☠ FATAL BREACH ] SYSTEM SHUTDOWN // ALL 5 NODES LOST!'
          : this.world === 'ai'
          ? '[ ☠ FATAL COLLAPSE ] NEURAL WEIGHTS CORRUPTED!'
          : '[ ☠ FATAL OUTAGE ] CI/CD TERMINATED // SERVICE DOWN!',
        0xff2a55,
      );
      this.gameOver();
    } else {
      Logger.warn(`Operative node damaged! Nodes remaining: ${this.lives}/5`);
      // GAME CONTINUES EXACTLY IN CURRENT STATUS!
      // No stage reload! All orbs, servers, timer, and score continue seamless!
      this.player.iframeUntil = this.time.now + 3500;
      const nodesLeft = this.lives === 1 ? '1 NODE REMAINING!' : `${this.lives} NODES REMAINING!`;
      this.reactAntagonist(`[ ⚠ NODE CRASHED ] ${nodesLeft}`, 0xffd700);

      const toast = this.add
        .text(this.player.x, this.player.y - 48, `NODE LOST! // ${nodesLeft}`, {
          fontFamily: "'Orbitron', monospace",
          fontSize: '12px',
          color: '#ff2a55',
          fontStyle: 'bold',
          backgroundColor: '#040b16dd',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(50);

      this.tweens.add({
        targets: toast,
        y: toast.y - 28,
        alpha: 0,
        duration: 1100,
        onComplete: () => toast.destroy(),
      });

      if (this.player.isGrounded()) {
        this.player.setVelocityY(-140);
      }
    }
  }

  private levelClear(): void {
    this.clearing = true;
    const timeBonus = Math.ceil(this.remaining) * 10;
    this.score += timeBonus;

    // Server defense survival bonus
    let serverBonus = 0;
    if (this.servers.length > 0) {
      const surviving = this.servers.filter((s) => !s.isDestroyed).length;
      serverBonus = surviving * 1000;
      this.score += serverBonus;
    }

    this.audio.playLevelClear();
    setHighScore(this.world, this.mode, this.score);
    Logger.info(`Stage cleared! Sector: ${this.world}, Stage: ${this.stage}, Score: ${this.score}`);

    const banner = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 450, 95, 0x060e1a, 0.95)
      .setScrollFactor(0)
      .setStrokeStyle(2, WORLDS[this.world].accent)
      .setDepth(80);

    const clearText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'STAGE DEPLOYED // ACCESS SECURED', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(81);

    const bonusMsg =
      serverBonus > 0
        ? `TIME BONUS +${timeBonus}  |  SERVER DEFENSE +${serverBonus}`
        : `TIME BONUS +${timeBonus}`;

    const bonusText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, bonusMsg, {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '13px',
        color: WORLDS[this.world].accentHex,
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(81);

    this.time.delayedCall(1600, () => {
      banner.destroy();
      clearText.destroy();
      bonusText.destroy();
      if (this.mode === 'endless') {
        this.stage++;
        this.loadStage();
      } else if (this.stage < 5) {
        this.stage++;
        this.loadStage();
      } else {
        this.scene.start('Menu');
      }
    });
  }

  private gameOver(): void {
    if (this.gameOverActive) return;
    this.gameOverActive = true;
    this.lives = 0;
    this.physics.world.pause();
    this.harpoon.clear();
    this.orbs.forEach((orb) => {
      if (orb.active && orb.body) orb.setVelocity(0, 0);
    });
    if (this.player.active && this.player.body) this.player.setVelocity(0, 0);

    this.audio.playGameOver();
    Logger.error(`Game Over: Mission terminated. Final score: ${this.score}`);
    this.scene
      .get('UI')
      .events.emit('hud', { score: this.score, lives: 0, time: 0, weapon: 'STANDARD' });

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x03060c, 0.94)
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 480, 260, 0x08101e, 0.98)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xff2a55)
      .setDepth(101);

    this.add
      .text(GAME_WIDTH / 2, 195, 'SYSTEM OVERRIDE', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '32px',
        color: '#ff2a55',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(102);

    this.add
      .text(GAME_WIDTH / 2, 235, 'CRITICAL ZERO-DAY BREACH // ALL 5 NODES DOWN', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '13px',
        color: '#ff8c00',
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(102);

    this.add
      .text(GAME_WIDTH / 2, 285, `FINAL SCORE: ${String(this.score).padStart(6, '0')}`, {
        fontFamily: "'Orbitron', monospace",
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(102);

    const menuButton = this.add
      .text(GAME_WIDTH / 2, 345, '▶ RETURN TO TERMINAL', {
        fontFamily: "'Orbitron', monospace",
        fontSize: '15px',
        color: '#050a14',
        backgroundColor: '#00f0ff',
        padding: { x: 20, y: 10 },
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(102)
      .setInteractive();

    menuButton.on('pointerover', () => menuButton.setBackgroundColor('#ffffff'));
    menuButton.on('pointerout', () => menuButton.setBackgroundColor('#00f0ff'));
    menuButton.on('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Menu'));

    menuButton.on('pointerover', () => menuButton.setBackgroundColor('#ffffff'));
    menuButton.on('pointerout', () => menuButton.setBackgroundColor('#00f0ff'));
    menuButton.on('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Menu'));
  }

  public toggleMusic(): boolean {
    return this.audio.toggleMusic(this.world);
  }

  public getMusicTrackName(): string {
    return this.audio.getCurrentTrackName();
  }

  public stopPlayer(): void {
    this.player.stop();
  }

  private reactAntagonist(label: string, color = 0x00f0ff): void {
    if (!this.antagonistText) return;
    this.antagonistText.setText(label);
    this.antagonistText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
    this.drawAntagonistBox(color);

    this.time.delayedCall(1200, () => {
      if (!this.antagonistText) return;
      const defaultTitle =
        this.world === 'cybersec'
          ? '[ ◉ ACTIVE ] AI HACKER // ONLINE'
          : this.world === 'ai'
          ? '[ ◉ ACTIVE ] ROGUE LLM // TRACKING'
          : '[ ◉ ACTIVE ] CI/CD PIPELINE // MONITORING';
      this.antagonistText.setText(defaultTitle);
      this.antagonistText.setColor(WORLDS[this.world].accentHex);
      this.drawAntagonistBox(WORLDS[this.world].accent);
    });
  }
}
