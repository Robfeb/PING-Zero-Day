import Phaser from 'phaser';

function canvas(scene: Phaser.Scene, key: string, width: number, height: number): CanvasRenderingContext2D {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) throw new Error(`Unable to create texture ${key}`);
  const context = texture.getContext();
  context.clearRect(0, 0, width, height);
  return context;
}

function refresh(scene: Phaser.Scene, key: string): void {
  const texture = scene.textures.get(key);
  if (texture) {
    (texture as unknown as { refresh: () => void }).refresh();
  }
}

// Helper: draw rounded rectangle
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// 1. HERO CHARACTER GENERATION (VIBRANT ARCADE COMIC-BOOK SPRITE)
// ---------------------------------------------------------------------------
function bakeHeroTextures(scene: Phaser.Scene): void {
  const width = 46;
  const height = 60;

  // Comic Color Palette
  const INK = '#060913';          // Bold comic inking lines
  const SKIN = '#ffe2cc';         // Warm anime peach skin
  const SKIN_SHADOW = '#df9b70';  // Warm skin cel-shadow
  const HAIR_CYAN = '#00f0ff';    // Vivid electric cyan comic hair
  const HAIR_SHADOW = '#007b99';  // Deep cyan hair shadow
  const HAIR_SHINE = '#ffffff';   // Pure white specular spike gleams
  const SCARF = '#ff2244';        // Dynamic crimson hero scarf
  const SCARF_SHADOW = '#8f001c'; // Crimson fabric fold shadow
  const SCARF_HILIGHT = '#ff758d';// Crimson edge highlight
  const JACKET = '#152238';       // Tactical midnight navy jacket
  const JACKET_LIGHT = '#243a5e'; // Highlight armor chestplate
  const JACKET_SHADOW = '#080d17';// Deep shadow folds
  const NEON_CYAN = '#00f0ff';    // Glowing cyber trim & soles
  const GOLD = '#ffd700';         // Hazard badge / belt buckle / muzzle sparks
  const VISOR_PINK = '#ff007f';   // Cyber magenta visor lenses
  const PANTS = '#182335';        // Tactical cargo pants
  const SNEAKER_UPPER = '#1e293b';// Hi-top sneaker leather
  const WHITE = '#ffffff';        // Toe caps & glints
  const LIME = '#39ff14';         // Comms LED
  const GUN_METAL = '#334155';    // Harpoon buster casing

  // Helper for drawing stylized comic hero sprite
  const drawHero = (
    ctx: CanvasRenderingContext2D,
    mode: 'walk' | 'fire' | 'climb' | 'jump',
    frame = 0,
  ) => {
    ctx.clearRect(0, 0, width, height);

    const isClimb = mode === 'climb';
    const isFire = mode === 'fire';
    const isJump = mode === 'jump';
    const isWalk = mode === 'walk';

    // Walk cycle bobbing
    const bob = isWalk && (frame === 1 || frame === 3) ? 2 : 0;
    const headBob = bob;

    // -------------------------------------------------------------------------
    // 1. REAR BILLOWING COMIC SCARF (WIND & MOTION STREAMERS)
    // -------------------------------------------------------------------------
    if (!isClimb) {
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (isJump) {
        // High billowing upward/backward scarf in the rushing air
        ctx.fillStyle = SCARF_SHADOW;
        ctx.beginPath();
        ctx.moveTo(21, 23);
        ctx.quadraticCurveTo(12, 18, 4, 15);
        ctx.lineTo(8, 22);
        ctx.quadraticCurveTo(14, 23, 21, 26);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = SCARF;
        ctx.beginPath();
        ctx.moveTo(21, 22);
        ctx.quadraticCurveTo(10, 16, 2, 12);
        ctx.lineTo(6, 18);
        ctx.quadraticCurveTo(13, 20, 21, 25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Edge highlight
        ctx.strokeStyle = SCARF_HILIGHT;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(21, 22);
        ctx.quadraticCurveTo(10, 16, 2, 12);
        ctx.stroke();
      } else if (isFire) {
        // Recoil whip backward
        ctx.fillStyle = SCARF_SHADOW;
        ctx.beginPath();
        ctx.moveTo(21, 24);
        ctx.quadraticCurveTo(11, 27, 3, 31);
        ctx.lineTo(7, 35);
        ctx.quadraticCurveTo(15, 30, 21, 27);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = SCARF;
        ctx.beginPath();
        ctx.moveTo(21, 23);
        ctx.quadraticCurveTo(10, 23, 2, 26);
        ctx.lineTo(7, 30);
        ctx.quadraticCurveTo(14, 27, 21, 26);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Dynamic horizontal flutter with 2 ribbon tails
        const wave = frame === 0 ? 0 : frame === 1 ? -2 : frame === 2 ? 1 : -1;

        // Lower streamer (shadow)
        ctx.fillStyle = SCARF_SHADOW;
        ctx.beginPath();
        ctx.moveTo(20, 24 + bob);
        ctx.quadraticCurveTo(11, 28 + wave + bob, 4, 32 + wave + bob);
        ctx.lineTo(9, 36 + wave + bob);
        ctx.quadraticCurveTo(15, 30 + bob, 20, 27 + bob);
        ctx.closePath();
        ctx.fill();

        // Upper main streamer
        ctx.fillStyle = SCARF;
        ctx.beginPath();
        ctx.moveTo(20, 22 + bob);
        ctx.quadraticCurveTo(10, 24 + wave + bob, 3, 26 + wave + bob);
        ctx.lineTo(7, 31 + wave + bob);
        ctx.quadraticCurveTo(14, 27 + wave + bob, 20, 26 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Edge gleam
        ctx.strokeStyle = SCARF_HILIGHT;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(20, 22 + bob);
        ctx.quadraticCurveTo(10, 24 + wave + bob, 3, 26 + wave + bob);
        ctx.stroke();
      }
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 2. REAR ARM (WALK / JUMP)
    // -------------------------------------------------------------------------
    if (!isClimb && !isFire) {
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      let armHandX = 12;
      let armHandY = 35 + bob;
      if (isWalk) {
        if (frame === 0) { armHandX = 9; armHandY = 37 + bob; }
        else if (frame === 1) { armHandX = 14; armHandY = 33 + bob; }
        else if (frame === 2) { armHandX = 17; armHandY = 31 + bob; }
        else { armHandX = 13; armHandY = 34 + bob; }
      } else if (isJump) {
        armHandX = 8;
        armHandY = 28;
      }

      // Black ink contour
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(16, 26 + bob);
      ctx.lineTo(armHandX, armHandY);
      ctx.stroke();

      // Sleeve fill
      ctx.strokeStyle = JACKET_SHADOW;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(16, 26 + bob);
      ctx.lineTo(armHandX, armHandY);
      ctx.stroke();

      // Comic fingerless glove
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(armHandX, armHandY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 3. LEGS & CHUNKY HI-TOP RETRO SNEAKERS
    // -------------------------------------------------------------------------
    let leftFootX = 14;
    let leftFootY = 55;
    let rightFootX = 32;
    let rightFootY = 53;

    if (isWalk) {
      if (frame === 0) {
        leftFootX = 13; leftFootY = 56;
        rightFootX = 33; rightFootY = 53;
      } else if (frame === 1) {
        leftFootX = 19; leftFootY = 55;
        rightFootX = 27; rightFootY = 54;
      } else if (frame === 2) {
        leftFootX = 33; leftFootY = 53;
        rightFootX = 13; rightFootY = 56;
      } else if (frame === 3) {
        leftFootX = 27; leftFootY = 54;
        rightFootX = 19; rightFootY = 55;
      }
    } else if (isFire) {
      // Wide planted recoil combat stance
      leftFootX = 10; leftFootY = 56;
      rightFootX = 36; rightFootY = 56;
    } else if (isJump) {
      // Athletic tucked airborne kick
      leftFootX = 16; leftFootY = 48;
      rightFootX = 30; rightFootY = 47;
    } else if (isClimb) {
      if (frame === 0) {
        leftFootX = 16; leftFootY = 55;
        rightFootX = 30; rightFootY = 49;
      } else {
        leftFootX = 16; leftFootY = 49;
        rightFootX = 30; rightFootY = 55;
      }
    }

    // Draw Pants Leg
    const drawPantsLeg = (hipX: number, footX: number, footY: number) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const kneeX = (hipX + footX) / 2 + (isJump ? -2 : 0);
      const kneeY = (41 + bob + footY) / 2;

      // Heavy comic ink stroke
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(hipX, 40 + bob);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(footX, footY - 4);
      ctx.stroke();

      // Cargo pants fabric fill
      ctx.strokeStyle = PANTS;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(hipX, 40 + bob);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(footX, footY - 4);
      ctx.stroke();

      // Stylized reinforced knee pad
      ctx.fillStyle = JACKET_LIGHT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing knee rivet
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(kneeX - 0.75, kneeY - 0.75, 1.5, 1.5);
      ctx.restore();
    };

    // Draw Hi-Top Sneaker
    const drawSneaker = (bx: number, by: number) => {
      ctx.save();
      ctx.lineJoin = 'round';

      const ox = bx - 6;
      const oy = by - 6;

      // Hi-top sneaker body with bold ink outline
      ctx.fillStyle = SNEAKER_UPPER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, ox, oy, 13, 7, 2);
      ctx.fill();
      ctx.stroke();

      // Crimson lightning/side stripe
      ctx.fillStyle = SCARF;
      ctx.beginPath();
      ctx.moveTo(ox + 3, oy + 2);
      ctx.lineTo(ox + 8, oy + 2);
      ctx.lineTo(ox + 6, oy + 5);
      ctx.lineTo(ox + 2, oy + 5);
      ctx.closePath();
      ctx.fill();

      // White comic rubber toe cap
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ox + 10.5, oy + 3.8, 2.5, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.stroke();

      // Black rubber bottom tread
      ctx.fillStyle = INK;
      ctx.fillRect(ox, oy + 6, 13, 2);

      // Glowing neon cyan sole trim
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(ox + 1, oy + 6.5, 11, 1.5);

      // Thruster flame jets if jumping!
      if (isJump) {
        // Outer fiery orange comic cone
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.moveTo(ox + 1, oy + 8);
        ctx.lineTo(ox + 6.5, oy + 15);
        ctx.lineTo(ox + 12, oy + 8);
        ctx.closePath();
        ctx.fill();

        // Mid cyan plasma jet
        ctx.fillStyle = NEON_CYAN;
        ctx.beginPath();
        ctx.moveTo(ox + 2.5, oy + 8);
        ctx.lineTo(ox + 6.5, oy + 12);
        ctx.lineTo(ox + 10.5, oy + 8);
        ctx.closePath();
        ctx.fill();

        // Inner pure white blazing core
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.moveTo(ox + 4, oy + 8);
        ctx.lineTo(ox + 6.5, oy + 10);
        ctx.lineTo(ox + 9, oy + 8);
        ctx.closePath();
        ctx.fill();

        // Golden spark particles
        ctx.fillStyle = GOLD;
        ctx.fillRect(ox + 1, oy + 13, 1.5, 1.5);
        ctx.fillRect(ox + 11, oy + 14, 1.5, 1.5);
      }
      ctx.restore();
    };

    // Draw left and right legs
    drawPantsLeg(19, leftFootX, leftFootY);
    drawPantsLeg(27, rightFootX, rightFootY);
    drawSneaker(leftFootX, leftFootY);
    drawSneaker(rightFootX, rightFootY);

    // -------------------------------------------------------------------------
    // 4. TORSO, CYBER JACKET & TACTICAL COMBAT BELT
    // -------------------------------------------------------------------------
    const torsoY = 22 + bob;
    ctx.save();
    ctx.lineJoin = 'round';

    // Main jacket midnight navy armor
    ctx.fillStyle = JACKET;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    roundRect(ctx, 14, torsoY, 18, 17, 3);
    ctx.fill();
    ctx.stroke();

    // Inner highlight chest plate
    ctx.fillStyle = JACKET_LIGHT;
    roundRect(ctx, 17, torsoY + 2, 12, 12, 2);
    ctx.fill();

    // Cyber neon piping (zipper & seams)
    ctx.strokeStyle = NEON_CYAN;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(23, torsoY + 2);
    ctx.lineTo(23, torsoY + 14);
    ctx.stroke();

    // Chest hazard chevron / badge
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(23, torsoY + 4);
    ctx.lineTo(26, torsoY + 7);
    ctx.lineTo(23, torsoY + 10);
    ctx.lineTo(20, torsoY + 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.fillRect(22, torsoY + 6, 2, 2);

    // Shoulder Pauldrons
    ctx.fillStyle = JACKET;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    roundRect(ctx, 11, torsoY, 5, 8, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = NEON_CYAN;
    ctx.fillRect(12, torsoY + 2, 3, 1.5);

    roundRect(ctx, 30, torsoY, 5, 8, 2);
    ctx.fillStyle = JACKET;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = NEON_CYAN;
    ctx.fillRect(31, torsoY + 2, 3, 1.5);

    // Tactical Combat Belt
    ctx.fillStyle = '#0a101b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    roundRect(ctx, 13, torsoY + 15, 20, 4, 1);
    ctx.fill();
    ctx.stroke();

    // Gold cyber buckle
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    roundRect(ctx, 21, torsoY + 14.5, 5, 5, 1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.fillRect(22.5, torsoY + 16, 2, 2);

    // Utility hip pouches
    ctx.fillStyle = '#1f2f45';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    roundRect(ctx, 11, torsoY + 14, 4, 5, 1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.fillRect(12.5, torsoY + 15.5, 1.5, 1.5);

    roundRect(ctx, 31, torsoY + 14, 4, 5, 1);
    ctx.fillStyle = '#1f2f45';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.fillRect(32.5, torsoY + 15.5, 1.5, 1.5);

    // -------------------------------------------------------------------------
    // 5. CLIMBING VIEW: TACTICAL BACKPACK CYBERDECK (IF CLIMBING)
    // -------------------------------------------------------------------------
    if (isClimb) {
      // Rear Cyberdeck Chassis
      ctx.fillStyle = '#0c1524';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, 16, torsoY + 2, 14, 13, 2);
      ctx.fill();
      ctx.stroke();

      // Cyberdeck heat exhaust vents
      ctx.strokeStyle = NEON_CYAN;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(19, torsoY + 5); ctx.lineTo(27, torsoY + 5);
      ctx.moveTo(19, torsoY + 8); ctx.lineTo(27, torsoY + 8);
      ctx.stroke();

      // Status LED Bar Graph
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(18, torsoY + 11, 2.5, 2);
      ctx.fillStyle = LIME;
      ctx.fillRect(22, torsoY + 11, 2.5, 2);
      ctx.fillStyle = SCARF;
      ctx.fillRect(26, torsoY + 11, 2.5, 2);

      // Scarf knot & short trailing tails on back
      ctx.fillStyle = SCARF;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(23, torsoY + 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, 19, torsoY + 2, 3, 5, 1);
      ctx.fill();
      roundRect(ctx, 24, torsoY + 2, 3, 5, 1);
      ctx.fill();
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 6. FRONT HIGH SCARF COLLAR & HERO NECK
    // -------------------------------------------------------------------------
    if (!isClimb) {
      ctx.save();
      ctx.lineJoin = 'round';

      // Popped crimson collar ring
      ctx.fillStyle = SCARF;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, 17, torsoY - 2, 12, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Fold shadow
      ctx.fillStyle = SCARF_SHADOW;
      ctx.fillRect(19, torsoY + 2, 8, 2);

      // Gold scarf clasp pin
      ctx.fillStyle = GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      roundRect(ctx, 21.5, torsoY - 1, 3, 4, 1);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 7. WEAPON & FRONT ARMS
    // -------------------------------------------------------------------------
    if (isFire) {
      // UPWARD FIRING COMBAT STANCE
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Arms gripping upward launcher
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(15, torsoY + 5); ctx.lineTo(20, torsoY - 8);
      ctx.moveTo(31, torsoY + 5); ctx.lineTo(26, torsoY - 8);
      ctx.stroke();

      ctx.strokeStyle = JACKET;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(15, torsoY + 5); ctx.lineTo(20, torsoY - 8);
      ctx.moveTo(31, torsoY + 5); ctx.lineTo(26, torsoY - 8);
      ctx.stroke();

      // Combat gloves gripping weapon
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      roundRect(ctx, 18, torsoY - 10, 5, 4, 1);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, 24, torsoY - 10, 5, 4, 1);
      ctx.fill();
      ctx.stroke();

      // Upward Heavy Plasma Cannon Barrel
      ctx.fillStyle = GUN_METAL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, 20.5, 7, 6, 17, 2);
      ctx.fill();
      ctx.stroke();

      // Glowing cyan plasma core
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(22, 11, 3, 8);
      ctx.fillStyle = WHITE;
      ctx.fillRect(23, 12, 1, 6);

      // Copper heatsink coils
      ctx.fillStyle = GOLD;
      ctx.fillRect(20.5, 9, 6, 1.5);
      ctx.fillRect(20.5, 17, 6, 1.5);

      // DRAMATIC 8-POINT COMIC STARBURST MUZZLE FLASH!
      const flashX = 23.5;
      const flashY = 4.5;

      // Outer gold starburst
      ctx.fillStyle = GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const points = 8;
      const outerR = 9;
      const innerR = 4.5;
      for (let p = 0; p < points * 2; p++) {
        const rad = (p * Math.PI) / points - Math.PI / 2;
        const r = p % 2 === 0 ? outerR : innerR;
        const px = flashX + Math.cos(rad) * r;
        const py = flashY + Math.sin(rad) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner white star core
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      for (let p = 0; p < points * 2; p++) {
        const rad = (p * Math.PI) / points - Math.PI / 2;
        const r = p % 2 === 0 ? 5 : 2.5;
        const px = flashX + Math.cos(rad) * r;
        const py = flashY + Math.sin(rad) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Comic action spark particles
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(flashX - 9, flashY - 2, 2, 2);
      ctx.fillRect(flashX + 8, flashY - 2, 2, 2);
      ctx.fillStyle = GOLD;
      ctx.fillRect(flashX - 5, flashY - 6, 1.5, 1.5);
      ctx.fillRect(flashX + 5, flashY - 6, 1.5, 1.5);
      ctx.restore();
    } else if (isClimb) {
      // CLIMBING ARMS (ALTERNATING LADDER RUNGS)
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      let leftArmY = frame === 0 ? 12 : 24;
      let rightArmY = frame === 0 ? 24 : 12;

      // Left Arm
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(13, torsoY + 4); ctx.lineTo(10, leftArmY);
      ctx.stroke();
      ctx.strokeStyle = JACKET;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(13, torsoY + 4); ctx.lineTo(10, leftArmY);
      ctx.stroke();

      // Right Arm
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(33, torsoY + 4); ctx.lineTo(36, rightArmY);
      ctx.stroke();
      ctx.strokeStyle = JACKET;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(33, torsoY + 4); ctx.lineTo(36, rightArmY);
      ctx.stroke();

      // Gloved hands gripping rungs
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      roundRect(ctx, 8, leftArmY - 2, 5, 4, 1);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, 33, rightArmY - 2, 5, 4, 1);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // READY-TO-SHOOT FORWARD PLASMA HARPOON BUSTER
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Front Arm
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(29, torsoY + 4);
      ctx.lineTo(34, torsoY + 9);
      ctx.stroke();

      ctx.strokeStyle = JACKET;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(29, torsoY + 4);
      ctx.lineTo(34, torsoY + 9);
      ctx.stroke();

      // Plasma Buster Body
      ctx.fillStyle = GUN_METAL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, 30, torsoY + 5, 12, 8, 2);
      ctx.fill();
      ctx.stroke();

      // Glowing cyan power chamber
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(33, torsoY + 7, 5, 4);
      ctx.fillStyle = WHITE;
      ctx.fillRect(34, torsoY + 8, 2, 2);

      // Gold heatsink rings
      ctx.fillStyle = GOLD;
      ctx.fillRect(35, torsoY + 5, 1.5, 8);
      ctx.fillRect(38, torsoY + 5, 1.5, 8);

      // Muzzle nozzle with ready spark
      ctx.fillStyle = INK;
      ctx.fillRect(42, torsoY + 6.5, 2.5, 5);
      ctx.fillStyle = NEON_CYAN;
      ctx.fillRect(43, torsoY + 7.5, 2, 3);
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 8. HEAD, SPIKY COMIC HAIR, CYBER VISOR & COMMS
    // -------------------------------------------------------------------------
    const headY = 12 + headBob;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (isClimb) {
      // REAR HEAD VIEW (SPIKY CYAN HAIR FANNING OUTWARD)
      // Base head volume
      ctx.fillStyle = HAIR_SHADOW;
      ctx.beginPath();
      ctx.arc(23, headY + 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Spikes fanning from back of head
      ctx.fillStyle = HAIR_CYAN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, headY + 7);
      ctx.lineTo(11, headY + 1); // left low flare
      ctx.lineTo(15, headY - 1);
      ctx.lineTo(14, headY - 6); // left high spike
      ctx.lineTo(19, headY - 4);
      ctx.lineTo(23, headY - 9); // center crown spike
      ctx.lineTo(27, headY - 4);
      ctx.lineTo(32, headY - 6); // right high spike
      ctx.lineTo(31, headY - 1);
      ctx.lineTo(35, headY + 1); // right low flare
      ctx.lineTo(31, headY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White comic gleams on back spikes
      ctx.strokeStyle = HAIR_SHINE;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, headY - 4); ctx.lineTo(18, headY - 3);
      ctx.moveTo(23, headY - 7); ctx.lineTo(23, headY - 4);
      ctx.moveTo(30, headY - 4); ctx.lineTo(28, headY - 3);
      ctx.stroke();
    } else {
      // 3/4 HERO COMIC PORTRAIT
      // Manga Skin & Jawline
      ctx.fillStyle = SKIN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, headY - 1);
      ctx.lineTo(18, headY + 5); // ear
      ctx.lineTo(22, headY + 8); // jawline
      ctx.lineTo(26, headY + 8); // chin
      ctx.lineTo(28, headY + 3); // cheek
      ctx.lineTo(28, headY - 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warm cel-shadow under jaw
      ctx.fillStyle = SKIN_SHADOW;
      ctx.beginPath();
      ctx.moveTo(18, headY + 4);
      ctx.lineTo(22, headY + 8);
      ctx.lineTo(26, headY + 8);
      ctx.lineTo(25, headY + 5);
      ctx.closePath();
      ctx.fill();

      // Headset Earpiece & Comms Antenna
      ctx.fillStyle = '#0a101b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      roundRect(ctx, 16, headY + 1, 3.5, 6, 1);
      ctx.fill();
      ctx.stroke();

      // Antenna rising to green LED
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(17.5, headY + 1);
      ctx.lineTo(16, headY - 5);
      ctx.stroke();
      ctx.fillStyle = LIME;
      ctx.beginPath();
      ctx.arc(16, headY - 6, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor / Goggles (Glowing Hot Pink with // reflection)
      ctx.fillStyle = VISOR_PINK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      roundRect(ctx, 20, headY - 2, 12, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Double white specular reflection slashes //
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(23, headY + 2.5); ctx.lineTo(26, headY - 1);
      ctx.moveTo(27, headY + 2.5); ctx.lineTo(30, headY - 1);
      ctx.stroke();

      // DYNAMIC SPIKY COMIC HAIR
      ctx.fillStyle = HAIR_CYAN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(17, headY + 1);
      ctx.lineTo(11, headY - 1); // low rear flare
      ctx.lineTo(14, headY - 4);
      ctx.lineTo(11, headY - 7); // mid rear spike
      ctx.lineTo(16, headY - 6);
      ctx.lineTo(15, headY - 11); // high crest spike
      ctx.lineTo(21, headY - 7);
      ctx.lineTo(23, headY - 12); // main apex spike
      ctx.lineTo(26, headY - 7);
      ctx.lineTo(29, headY - 10); // front top spike
      ctx.lineTo(30, headY - 5);
      ctx.lineTo(34, headY - 3); // front brow swoop
      ctx.lineTo(30, headY - 1);
      ctx.lineTo(29, headY + 2); // sideburn lock
      ctx.lineTo(27, headY - 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Underside hair shadow
      ctx.fillStyle = HAIR_SHADOW;
      ctx.beginPath();
      ctx.moveTo(14, headY - 4);
      ctx.lineTo(11, headY - 7);
      ctx.lineTo(16, headY - 6);
      ctx.closePath();
      ctx.fill();

      // Specular white comic gleam streaks along crests
      ctx.strokeStyle = HAIR_SHINE;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, headY - 9); ctx.lineTo(18, headY - 7);
      ctx.moveTo(23, headY - 10); ctx.lineTo(24, headY - 7);
      ctx.moveTo(28, headY - 8); ctx.lineTo(29, headY - 6);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Bake walk frames (0 to 3)
  for (let i = 0; i < 4; i++) {
    const ctx = canvas(scene, `hero_walk_${i}`, width, height);
    drawHero(ctx, 'walk', i);
    refresh(scene, `hero_walk_${i}`);
  }

  // Bake jump frame (athletic airborne kick pose + dual thruster jets)
  const jumpCtx = canvas(scene, 'hero_jump', width, height);
  drawHero(jumpCtx, 'jump', 0);
  refresh(scene, 'hero_jump');

  // Bake fire frame (recoil power stance + upward launcher + starburst flash)
  const fireCtx = canvas(scene, 'hero_fire', width, height);
  drawHero(fireCtx, 'fire', 0);
  refresh(scene, 'hero_fire');

  // Bake climb frames (0 and 1)
  for (let i = 0; i < 2; i++) {
    const ctx = canvas(scene, `hero_climb_${i}`, width, height);
    drawHero(ctx, 'climb', i);
    refresh(scene, `hero_climb_${i}`);
  }

  // Hero default alias
  const heroCtx = canvas(scene, 'hero', width, height);
  drawHero(heroCtx, 'walk', 0);
  refresh(scene, 'hero');

  // ---------------------------------------------------------------------------
  // POLISHED COMIC CHARACTER BUST STICKER BADGE FOR HUD (24x26)
  // ---------------------------------------------------------------------------
  const lifeCtx = canvas(scene, 'hero_life', 24, 26);

  // Badge background with 2px solid comic border
  lifeCtx.fillStyle = '#0a1424';
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 2;
  roundRect(lifeCtx, 1, 1, 22, 24, 4);
  lifeCtx.fill();
  lifeCtx.stroke();

  // Cyan badge border inner rim
  lifeCtx.strokeStyle = NEON_CYAN;
  lifeCtx.lineWidth = 1;
  roundRect(lifeCtx, 2.5, 2.5, 19, 21, 3);
  lifeCtx.stroke();

  // Skin & jaw
  lifeCtx.fillStyle = SKIN;
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 1.4;
  lifeCtx.beginPath();
  lifeCtx.moveTo(8, 10);
  lifeCtx.lineTo(8, 14);
  lifeCtx.lineTo(12, 17);
  lifeCtx.lineTo(16, 17);
  lifeCtx.lineTo(18, 13);
  lifeCtx.lineTo(18, 10);
  lifeCtx.closePath();
  lifeCtx.fill();
  lifeCtx.stroke();

  // Cyber Visor (Hot Pink with // gleam)
  lifeCtx.fillStyle = VISOR_PINK;
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 1.4;
  roundRect(lifeCtx, 9, 10, 9, 5, 1.5);
  lifeCtx.fill();
  lifeCtx.stroke();
  lifeCtx.strokeStyle = WHITE;
  lifeCtx.lineWidth = 1;
  lifeCtx.beginPath();
  lifeCtx.moveTo(12, 13.5); lifeCtx.lineTo(14, 11);
  lifeCtx.moveTo(15, 13.5); lifeCtx.lineTo(17, 11);
  lifeCtx.stroke();

  // Spiky Cyan Hair
  lifeCtx.fillStyle = HAIR_CYAN;
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 1.6;
  lifeCtx.beginPath();
  lifeCtx.moveTo(6, 11);
  lifeCtx.lineTo(4, 7);
  lifeCtx.lineTo(8, 6);
  lifeCtx.lineTo(8, 2);
  lifeCtx.lineTo(13, 5);
  lifeCtx.lineTo(16, 2);
  lifeCtx.lineTo(18, 5);
  lifeCtx.lineTo(21, 6);
  lifeCtx.lineTo(19, 10);
  lifeCtx.closePath();
  lifeCtx.fill();
  lifeCtx.stroke();

  // White hair shine
  lifeCtx.strokeStyle = WHITE;
  lifeCtx.lineWidth = 1;
  lifeCtx.beginPath();
  lifeCtx.moveTo(9, 3.5); lifeCtx.lineTo(11, 4.5);
  lifeCtx.moveTo(15, 3.5); lifeCtx.lineTo(16, 4.5);
  lifeCtx.stroke();

  // Popped Crimson Scarf Collar
  lifeCtx.fillStyle = SCARF;
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 1.4;
  roundRect(lifeCtx, 7, 16.5, 10, 4.5, 1.5);
  lifeCtx.fill();
  lifeCtx.stroke();

  // Gold clasp pin
  lifeCtx.fillStyle = GOLD;
  lifeCtx.fillRect(11, 17.5, 2, 2.5);

  // Midnight navy jacket base with cyan rim
  lifeCtx.fillStyle = JACKET;
  lifeCtx.strokeStyle = INK;
  lifeCtx.lineWidth = 1.4;
  roundRect(lifeCtx, 5, 20.5, 14, 4, 1);
  lifeCtx.fill();
  lifeCtx.stroke();
  lifeCtx.fillStyle = NEON_CYAN;
  lifeCtx.fillRect(10, 20.5, 4, 1.2);

  refresh(scene, 'hero_life');
}

// ---------------------------------------------------------------------------
// 2. MULTI-LAYERED NEON ORBS GENERATION (WITH PACKAGES & REAL CVE TAGS)
// ---------------------------------------------------------------------------
interface OrbTierConfig {
  tier: 1 | 2 | 3 | 4;
  radius: number;
  size: number;
  color: string;
  glow: string;
}

const TIER_SPECS: OrbTierConfig[] = [
  { tier: 1, radius: 16, size: 52, color: '#00f0ff', glow: '#00f0ffaa' },
  { tier: 2, radius: 26, size: 80, color: '#ffd700', glow: '#ffd700aa' },
  { tier: 3, radius: 38, size: 110, color: '#ff8c00', glow: '#ff8c00aa' },
  { tier: 4, radius: 52, size: 146, color: '#ff2a55', glow: '#ff2a55cc' },
];

function bakeOrbTextures(scene: Phaser.Scene): void {
  const worlds: Array<'cybersec' | 'ai' | 'devops'> = ['cybersec', 'ai', 'devops'];

  for (const world of worlds) {
    for (const spec of TIER_SPECS) {
      const key = `orb_${world}_${spec.tier}`;
      const ctx = canvas(scene, key, spec.size, spec.size);
      const cx = spec.size / 2;
      const cy = spec.size / 2;
      const r = spec.radius;

      // 1. Ambient Outer Corona / Bloom
      const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, cx);
      haloGrad.addColorStop(0, spec.color);
      haloGrad.addColorStop(0.4, spec.glow);
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Rotating Reticle / Cyber Brackets
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = spec.tier === 4 ? 16 : 10;
      ctx.shadowColor = spec.color;

      const arcDist = r + (spec.tier === 4 ? 7 : 5);
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        ctx.beginPath();
        ctx.arc(cx, cy, arcDist, angle + 0.2, angle + Math.PI / 2 - 0.2);
        ctx.stroke();
      }

      // Telemetry hazard tick marks
      if (spec.tier >= 3) {
        ctx.lineWidth = 2.4;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const x1 = cx + Math.cos(a) * (arcDist - 4);
          const y1 = cy + Math.sin(a) * (arcDist - 4);
          const x2 = cx + Math.cos(a) * (arcDist + 4);
          const y2 = cy + Math.sin(a) * (arcDist + 4);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // 3. Dark Obsidian Metallic Sphere Core
      const sphereGrad = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.35,
        r * 0.1,
        cx,
        cy,
        r,
      );
      if (world === 'cybersec') {
        sphereGrad.addColorStop(0, '#1a2a44');
        sphereGrad.addColorStop(0.65, '#0c1626');
        sphereGrad.addColorStop(1, '#050a12');
      } else if (world === 'ai') {
        sphereGrad.addColorStop(0, '#2e1644');
        sphereGrad.addColorStop(0.65, '#160a24');
        sphereGrad.addColorStop(1, '#08040f');
      } else {
        sphereGrad.addColorStop(0, '#18341e');
        sphereGrad.addColorStop(0.65, '#0c1a10');
        sphereGrad.addColorStop(1, '#050c07');
      }

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Neon rim stroke
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = spec.tier >= 3 ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Inner subtle circuit ring
      ctx.strokeStyle = `${spec.color}55`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Glass Specular Highlight (top-left crescent)
      const specGrad = ctx.createRadialGradient(
        cx - r * 0.32,
        cy - r * 0.32,
        1,
        cx - r * 0.28,
        cy - r * 0.28,
        r * 0.45,
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
      specGrad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
      specGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // 5. Embedded Cyber Security Package (Crate Graphic)
      const crateW = r * 1.35;
      const crateH = r * 0.95;
      const crateX = cx - crateW / 2;
      const crateY = cy - crateH / 2 - (spec.tier >= 3 ? 4 : 2);

      // Crate body outline
      ctx.fillStyle = '#07101ccc';
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = 1.6;
      roundRect(ctx, crateX, crateY, crateW, crateH, 3);
      ctx.fill();
      ctx.stroke();

      // Crate cross-straps / corner brackets
      ctx.strokeStyle = `${spec.color}88`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crateX, crateY + crateH * 0.35); ctx.lineTo(crateX + crateW, crateY + crateH * 0.35);
      ctx.moveTo(crateX + crateW * 0.3, crateY); ctx.lineTo(crateX + crateW * 0.3, crateY + crateH);
      ctx.stroke();

      // 6. Prominent Real CVE & Cybersec Threat Labels
      let topLabel = '';
      let subLabel = '';

      if (world === 'cybersec') {
        if (spec.tier === 4) { topLabel = 'CVE-0DAY'; subLabel = 'CRITICAL RCE'; }
        else if (spec.tier === 3) { topLabel = 'CVE-1337'; subLabel = 'BOTNET'; }
        else if (spec.tier === 2) { topLabel = 'CVE-4096'; subLabel = 'MALWARE'; }
        else { topLabel = 'EXFIL'; subLabel = 'CVE-88'; }
      } else if (world === 'ai') {
        if (spec.tier === 4) { topLabel = 'JAILBREAK'; subLabel = 'PROMPT INJECT'; }
        else if (spec.tier === 3) { topLabel = 'HIJACK'; subLabel = 'MODEL POISON'; }
        else if (spec.tier === 2) { topLabel = 'DRAIN'; subLabel = 'ATTN LEAK'; }
        else { topLabel = 'SPARK'; subLabel = 'ADVERSARY'; }
      } else {
        if (spec.tier === 4) { topLabel = 'P0_ALERT'; subLabel = 'BUFFER OVERFLOW'; }
        else if (spec.tier === 3) { topLabel = 'DEP_PANIC'; subLabel = 'MEM LEAK'; }
        else if (spec.tier === 2) { topLabel = 'KERNEL'; subLabel = 'BUILD FAIL'; }
        else { topLabel = 'RACE'; subLabel = '500 ERROR'; }
      }

      // Draw Main CVE Badge
      ctx.textAlign = 'center';
      if (spec.tier === 4) {
        // Red critical badge
        ctx.fillStyle = '#ff2a55';
        roundRect(ctx, cx - crateW * 0.45, cy - 8, crateW * 0.9, 14, 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px monospace';
        ctx.fillText(topLabel, cx, cy + 3);

        ctx.fillStyle = '#ffb8c6';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(subLabel, cx, cy + 18);
      } else if (spec.tier === 3) {
        ctx.fillStyle = '#ff8c00';
        roundRect(ctx, cx - crateW * 0.45, cy - 6, crateW * 0.9, 12, 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 9px monospace';
        ctx.fillText(topLabel, cx, cy + 3);

        ctx.fillStyle = '#ffe2b8';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText(subLabel, cx, cy + 14);
      } else if (spec.tier === 2) {
        ctx.fillStyle = '#ffd700';
        roundRect(ctx, cx - crateW * 0.45, cy - 5, crateW * 0.9, 10, 2);
        ctx.fill();
        ctx.fillStyle = '#060c16';
        ctx.font = '900 7.5px monospace';
        ctx.fillText(topLabel, cx, cy + 3);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px monospace';
        ctx.fillText(subLabel, cx, cy + 11);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(topLabel, cx, cy + 2);
      }

      refresh(scene, key);

      // Fallback aliases for backward compatibility
      if (world === 'cybersec') {
        const aliasKey = `orb${spec.tier}`;
        const aliasCtx = canvas(scene, aliasKey, spec.size, spec.size);
        aliasCtx.drawImage(ctx.canvas, 0, 0);
        refresh(scene, aliasKey);

        if (spec.tier === 4) {
          const t4Ctx = canvas(scene, 'orb_tier_4', spec.size, spec.size);
          t4Ctx.drawImage(ctx.canvas, 0, 0);
          refresh(scene, 'orb_tier_4');
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. WEAPONS, WIRE & EMITTER TIPS
// ---------------------------------------------------------------------------
function bakeWeaponTextures(scene: Phaser.Scene): void {
  // 1. RJ45 Ethernet Harpoon (Cybersec) - 28x38
  const rj = canvas(scene, 'harpoon-rj45', 28, 38);
  // Connector polycarbonate body
  rj.fillStyle = '#0f243c';
  rj.strokeStyle = '#00f0ff';
  rj.lineWidth = 1.8;
  roundRect(rj, 4, 10, 20, 26, 3);
  rj.fill();
  rj.stroke();

  // 8 Gold terminal pins
  rj.fillStyle = '#ffd700';
  for (let x = 6; x <= 20; x += 2) {
    rj.fillRect(x, 11, 1.2, 5);
  }

  // Snagless latch clip
  rj.fillStyle = '#1c3d64';
  rj.strokeStyle = '#00f0ff';
  rj.lineWidth = 1.2;
  roundRect(rj, 9, 18, 10, 16, 2);
  rj.fill();
  rj.stroke();

  // Projecting laser needle emitter
  rj.fillStyle = '#00f0ff';
  rj.shadowBlur = 8;
  rj.shadowColor = '#00f0ff';
  rj.beginPath();
  rj.moveTo(14, 0);
  rj.lineTo(18, 10);
  rj.lineTo(10, 10);
  rj.closePath();
  rj.fill();
  // White core
  rj.fillStyle = '#ffffff';
  rj.beginPath();
  rj.moveTo(14, 2);
  rj.lineTo(16, 10);
  rj.lineTo(12, 10);
  rj.closePath();
  rj.fill();
  rj.shadowBlur = 0;
  refresh(scene, 'harpoon-rj45');

  // 2. AI Guardrail Laser Emitter (AI Sec) - 28x38
  const ai = canvas(scene, 'harpoon-ai', 28, 38);
  // Magnetic containment fork
  ai.strokeStyle = '#c77dff';
  ai.lineWidth = 2.5;
  ai.shadowBlur = 6;
  ai.shadowColor = '#c77dff';
  ai.beginPath();
  ai.arc(14, 16, 10, Math.PI * 0.8, Math.PI * 2.2);
  ai.stroke();

  // Central hovering plasma sphere
  ai.fillStyle = '#00f0ff';
  ai.beginPath();
  ai.arc(14, 16, 5, 0, Math.PI * 2);
  ai.fill();
  ai.fillStyle = '#ffffff';
  ai.beginPath();
  ai.arc(14, 16, 2.5, 0, Math.PI * 2);
  ai.fill();

  // Laser beam needle
  ai.fillStyle = '#c77dff';
  ai.beginPath();
  ai.moveTo(14, 0);
  ai.lineTo(17, 10);
  ai.lineTo(11, 10);
  ai.closePath();
  ai.fill();
  ai.shadowBlur = 0;
  refresh(scene, 'harpoon-ai');

  // 3. DevOps Hotfix Git Revert Spear (DevOps SRE) - 28x38
  const dev = canvas(scene, 'harpoon-devops', 28, 38);
  // Angular titanium spearhead
  dev.fillStyle = '#102d18';
  dev.strokeStyle = '#7cff6b';
  dev.lineWidth = 2;
  dev.shadowBlur = 6;
  dev.shadowColor = '#7cff6b';
  dev.beginPath();
  dev.moveTo(14, 0);
  dev.lineTo(24, 18);
  dev.lineTo(18, 36);
  dev.lineTo(10, 36);
  dev.lineTo(4, 18);
  dev.closePath();
  dev.fill();
  dev.stroke();

  // Git commit node in center
  dev.fillStyle = '#7cff6b';
  dev.beginPath();
  dev.arc(14, 18, 4, 0, Math.PI * 2);
  dev.fill();
  dev.fillStyle = '#ffffff';
  dev.beginPath();
  dev.arc(14, 18, 2, 0, Math.PI * 2);
  dev.fill();
  dev.shadowBlur = 0;
  refresh(scene, 'harpoon-devops');

  // 4. Wire Beam Texture (16x32, tileable laser tether)
  const beam = canvas(scene, 'wire_beam', 16, 32);
  // Outer neon glow
  const beamGrad = beam.createLinearGradient(0, 0, 16, 0);
  beamGrad.addColorStop(0, 'rgba(0,240,255,0)');
  beamGrad.addColorStop(0.3, 'rgba(0,240,255,0.4)');
  beamGrad.addColorStop(0.5, '#00f0ff');
  beamGrad.addColorStop(0.7, 'rgba(0,240,255,0.4)');
  beamGrad.addColorStop(1, 'rgba(0,240,255,0)');
  beam.fillStyle = beamGrad;
  beam.fillRect(0, 0, 16, 32);

  // Intense white core
  beam.fillStyle = '#ffffff';
  beam.fillRect(7, 0, 2, 32);

  // Data pulses along the beam
  beam.fillStyle = '#ffffff';
  beam.fillRect(5, 4, 6, 3);
  beam.fillRect(5, 20, 6, 3);
  refresh(scene, 'wire_beam');

  // 5. Vertical "PATCH" Bullet (22x54) - Word read in vertical
  const patch = canvas(scene, 'bullet_patch', 22, 54);
  // Dark capsule container with neon lime cyber border
  patch.fillStyle = '#06121fee';
  patch.strokeStyle = '#39ff14';
  patch.lineWidth = 2;
  roundRect(patch, 2, 2, 18, 48, 4);
  patch.fill();
  patch.stroke();

  // Inner glow rim
  patch.strokeStyle = 'rgba(57, 255, 20, 0.4)';
  patch.lineWidth = 1;
  roundRect(patch, 4, 4, 14, 44, 2);
  patch.stroke();

  // Vertical "PATCH" typography - P, A, T, C, H
  const letters = ['P', 'A', 'T', 'C', 'H'];
  patch.font = 'bold 9px "Share Tech Mono", monospace';
  patch.textAlign = 'center';
  patch.textBaseline = 'middle';
  patch.fillStyle = '#ffffff';
  patch.shadowColor = '#39ff14';
  patch.shadowBlur = 6;

  letters.forEach((char, idx) => {
    const ly = 9 + idx * 8.5;
    patch.fillText(char, 11, ly);
  });
  patch.shadowBlur = 0;

  // Bottom thruster exhaust nozzle & flame
  patch.fillStyle = '#39ff14';
  patch.fillRect(6, 47, 10, 3);
  patch.fillStyle = '#ffffff';
  patch.fillRect(8, 48, 6, 2);

  patch.fillStyle = '#00f0ff';
  patch.beginPath();
  patch.moveTo(7, 50);
  patch.lineTo(11, 54);
  patch.lineTo(15, 50);
  patch.closePath();
  patch.fill();
  refresh(scene, 'bullet_patch');
}

// ---------------------------------------------------------------------------
// 4. POWER-UP CAPSULES
// ---------------------------------------------------------------------------
function bakePowerUpTextures(scene: Phaser.Scene): void {
  const size = 42;
  const cx = size / 2;
  const cy = size / 2;

  const pickups = [
    { key: 'pickup_freeze', color: '#00f0ff', type: 'freeze' },
    { key: 'pickup_shield', color: '#38bdf8', type: 'shield' },
    { key: 'pickup_double', color: '#ffd700', type: 'double' },
    { key: 'pickup_triple', color: '#ff922b', type: 'triple' },
    { key: 'pickup_sticky', color: '#f72585', type: 'sticky' },
    { key: 'pickup_patch', color: '#39ff14', type: 'patch' },
    { key: 'pickup_firewall', color: '#c77dff', type: 'firewall' },
  ] as const;

  for (const item of pickups) {
    const ctx = canvas(scene, item.key, size, size);

    // Glowing aura
    ctx.shadowBlur = 12;
    ctx.shadowColor = item.color;

    // Hexagonal capsule container
    ctx.fillStyle = '#0a1424ee';
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + Math.cos(angle) * 17;
      const y = cy + Math.sin(angle) * 17;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner rim
    ctx.strokeStyle = `${item.color}55`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + Math.cos(angle) * 13;
      const y = cy + Math.sin(angle) * 13;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Icon in center
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (item.type === 'freeze') {
      // Snowflake / Digital Clock
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9);
        ctx.lineTo(cx - Math.cos(a) * 9, cy - Math.sin(a) * 9);
      }
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'shield') {
      // WAF Shield
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 8, cy - 4);
      ctx.lineTo(cx + 6, cy + 5);
      ctx.lineTo(cx, cy + 9);
      ctx.lineTo(cx - 6, cy + 5);
      ctx.lineTo(cx - 8, cy - 4);
      ctx.closePath();
      ctx.fillStyle = `${item.color}55`;
      ctx.fill();
      ctx.stroke();
      // Core checkmark / node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'double') {
      // Twin vertical laser bolts
      ctx.fillStyle = item.color;
      ctx.fillRect(cx - 6, cy - 8, 3, 16);
      ctx.fillRect(cx + 3, cy - 8, 3, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5, cy - 6, 1.5, 12);
      ctx.fillRect(cx + 4, cy - 6, 1.5, 12);
    } else if (item.type === 'triple') {
      // Trident triple laser
      ctx.fillStyle = item.color;
      ctx.fillRect(cx - 8, cy - 8, 2.5, 16);
      ctx.fillRect(cx - 1.25, cy - 10, 2.5, 20);
      ctx.fillRect(cx + 5.5, cy - 8, 2.5, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 0.5, cy - 8, 1, 16);
    } else if (item.type === 'sticky') {
      // Grapple hook / anchor
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 2);
      ctx.lineTo(cx, cy + 8);
      ctx.moveTo(cx - 7, cy + 4);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx + 7, cy + 4);
      ctx.stroke();
    } else if (item.type === 'patch') {
      // Microchip / Patch pill with vertical text P
      ctx.fillStyle = item.color;
      roundRect(ctx, cx - 8, cy - 10, 16, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PTCH', cx, cy);
    } else if (item.type === 'firewall') {
      // Server Firewall shield dome
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, Math.PI, 0);
      ctx.lineTo(cx + 7, cy + 8);
      ctx.lineTo(cx - 7, cy + 8);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 2, cy + 1, 4, 5);
    }

    refresh(scene, item.key);
  }
}

// ---------------------------------------------------------------------------
// 5. PLATFORMS & LADDERS
// ---------------------------------------------------------------------------
function bakeEnvironmentTextures(scene: Phaser.Scene): void {
  // 1. Solid High-Tech Platform Girder (160x16)
  const solid = canvas(scene, 'platform-solid', 160, 16);
  // Base metal
  solid.fillStyle = '#0b1626';
  solid.fillRect(0, 0, 160, 16);

  // Glowing neon cyan runner on top
  solid.fillStyle = '#00f0ff';
  solid.fillRect(0, 0, 160, 3);
  solid.fillStyle = 'rgba(0,240,255,0.3)';
  solid.fillRect(0, 3, 160, 3);

  // Tech rivets along bottom
  solid.fillStyle = '#1e385c';
  for (let x = 10; x < 160; x += 20) {
    solid.beginPath();
    solid.arc(x, 10, 2, 0, Math.PI * 2);
    solid.fill();
  }
  // Bottom border
  solid.fillStyle = '#050c16';
  solid.fillRect(0, 14, 160, 2);
  refresh(scene, 'platform-solid');

  // 2. Breakable Unstable Plasma Block (160x16)
  const breakable = canvas(scene, 'platform-breakable', 160, 16);
  breakable.fillStyle = '#260a14';
  breakable.fillRect(0, 0, 160, 16);

  // Glowing neon red/amber top runner
  breakable.fillStyle = '#ff2a55';
  breakable.fillRect(0, 0, 160, 3);

  // Fracture lines & hazard stripes
  breakable.strokeStyle = '#ff8c00';
  breakable.lineWidth = 1.5;
  for (let x = 8; x < 160; x += 24) {
    breakable.beginPath();
    breakable.moveTo(x, 4);
    breakable.lineTo(x + 10, 14);
    breakable.stroke();
  }
  // Warning glow nodes
  breakable.fillStyle = '#ff2a55';
  breakable.fillRect(38, 6, 8, 4);
  breakable.fillRect(114, 6, 8, 4);
  refresh(scene, 'platform-breakable');

  // 3. Cyber Ladder Rung (32x24, tileable)
  const ladder = canvas(scene, 'ladder-rung', 32, 24);
  // Vertical dark titanium rails
  ladder.fillStyle = '#0a1728';
  ladder.fillRect(2, 0, 5, 24);
  ladder.fillRect(25, 0, 5, 24);

  // Glowing rail neon edges
  ladder.fillStyle = '#00f0ff';
  ladder.fillRect(4, 0, 1.5, 24);
  ladder.fillRect(27, 0, 1.5, 24);

  // Central glowing cyber rung
  ladder.fillStyle = '#142a45';
  roundRect(ladder, 6, 9, 20, 6, 2);
  ladder.fill();
  ladder.fillStyle = '#00f0ff';
  ladder.fillRect(8, 11, 16, 2);
  refresh(scene, 'ladder-rung');
}

// ---------------------------------------------------------------------------
// 6. RICH CYBERPUNK BACKGROUNDS
// ---------------------------------------------------------------------------
function bakeBackgrounds(scene: Phaser.Scene): void {
  // 1. CYBERSEC BACKGROUND (960x540)
  const cyber = canvas(scene, 'cybersec-background', 960, 540);
  // Deep dark sky gradient
  const skyGrad = cyber.createLinearGradient(0, 0, 0, 540);
  skyGrad.addColorStop(0, '#040813');
  skyGrad.addColorStop(0.65, '#071222');
  skyGrad.addColorStop(1, '#0c1a2e');
  cyber.fillStyle = skyGrad;
  cyber.fillRect(0, 0, 960, 540);

  // Synthwave 3D Perspective Grid on the floor (y: 340 to 500)
  cyber.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  cyber.lineWidth = 1;
  const horizonY = 340;
  for (let y = horizonY; y <= 500; y += Math.max(8, (y - horizonY) * 0.4)) {
    cyber.beginPath();
    cyber.moveTo(0, y);
    cyber.lineTo(960, y);
    cyber.stroke();
  }
  for (let x = -200; x <= 1160; x += 60) {
    cyber.beginPath();
    cyber.moveTo(480 + (x - 480) * 0.1, horizonY);
    cyber.lineTo(x, 500);
    cyber.stroke();
  }

  // Server Mainframe Monoliths in Background
  const racks = [
    { x: 30, w: 100, h: 260 },
    { x: 160, w: 90, h: 230 },
    { x: 710, w: 90, h: 230 },
    { x: 830, w: 100, h: 260 },
  ];
  for (const rack of racks) {
    cyber.fillStyle = '#0a1628';
    cyber.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    cyber.lineWidth = 1.5;
    roundRect(cyber, rack.x, 80, rack.w, rack.h, 4);
    cyber.fill();
    cyber.stroke();

    // Server blade slots
    for (let by = 95; by < 80 + rack.h - 15; by += 22) {
      cyber.fillStyle = '#060e1a';
      cyber.fillRect(rack.x + 8, by, rack.w - 16, 16);

      // Blinking LEDs
      cyber.fillStyle = (by + rack.x) % 44 === 0 ? '#ff2a55' : (by + rack.x) % 3 === 0 ? '#ffd700' : '#39ff14';
      cyber.fillRect(rack.x + 14, by + 5, 4, 4);
      cyber.fillStyle = '#00f0ff';
      cyber.fillRect(rack.x + 22, by + 5, 4, 4);
      cyber.fillStyle = '#39ff14';
      cyber.fillRect(rack.x + 30, by + 5, 4, 4);

      // Mini vent lines
      cyber.fillStyle = '#14263c';
      cyber.fillRect(rack.x + 44, by + 6, rack.w - 56, 3);
    }
  }

  // Digital matrix data rain columns
  cyber.fillStyle = 'rgba(0, 240, 255, 0.15)';
  cyber.font = '9px monospace';
  for (let cx = 290; cx <= 670; cx += 50) {
    let dy = 60 + ((cx * 37) % 80);
    for (let j = 0; j < 8; j++) {
      const hex = ((cx + j * 17) % 256).toString(16).toUpperCase().padStart(2, '0');
      cyber.fillText(hex, cx, dy);
      dy += 16;
    }
  }
  refresh(scene, 'cybersec-background');

  // 2. AI / LLM SEC BACKGROUND (960x540)
  const aiBg = canvas(scene, 'ai-background', 960, 540);
  const aiGrad = aiBg.createLinearGradient(0, 0, 0, 540);
  aiGrad.addColorStop(0, '#090416');
  aiGrad.addColorStop(0.65, '#15092a');
  aiGrad.addColorStop(1, '#230b42');
  aiBg.fillStyle = aiGrad;
  aiBg.fillRect(0, 0, 960, 540);

  // Vast neural network synaptic web
  aiBg.strokeStyle = 'rgba(199, 125, 255, 0.18)';
  aiBg.lineWidth = 1.2;
  const nodes = [
    { x: 120, y: 140 }, { x: 240, y: 100 }, { x: 360, y: 160 },
    { x: 180, y: 260 }, { x: 320, y: 280 }, { x: 480, y: 190 },
    { x: 640, y: 280 }, { x: 780, y: 260 }, { x: 600, y: 160 },
    { x: 720, y: 100 }, { x: 840, y: 140 }, { x: 480, y: 100 },
  ];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < 180) {
        aiBg.beginPath();
        aiBg.moveTo(nodes[i].x, nodes[i].y);
        aiBg.lineTo(nodes[j].x, nodes[j].y);
        aiBg.stroke();
      }
    }
  }

  // Draw glowing neural nodes
  for (const n of nodes) {
    aiBg.fillStyle = 'rgba(0, 240, 255, 0.4)';
    aiBg.beginPath();
    aiBg.arc(n.x, n.y, 6, 0, Math.PI * 2);
    aiBg.fill();
    aiBg.fillStyle = '#c77dff';
    aiBg.beginPath();
    aiBg.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
    aiBg.fill();
    aiBg.fillStyle = '#ffffff';
    aiBg.beginPath();
    aiBg.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
    aiBg.fill();
  }

  // Massive deep background Sentient AI Singularity Eye
  const eyeX = 480;
  const eyeY = 220;
  aiBg.strokeStyle = 'rgba(199, 125, 255, 0.16)';
  aiBg.lineWidth = 2;
  aiBg.beginPath();
  aiBg.arc(eyeX, eyeY, 70, 0, Math.PI * 2);
  aiBg.stroke();
  aiBg.beginPath();
  aiBg.arc(eyeX, eyeY, 45, 0, Math.PI * 2);
  aiBg.stroke();
  aiBg.fillStyle = 'rgba(0, 240, 255, 0.08)';
  aiBg.beginPath();
  aiBg.arc(eyeX, eyeY, 25, 0, Math.PI * 2);
  aiBg.fill();

  // Floating tensor symbols
  aiBg.fillStyle = 'rgba(199, 125, 255, 0.22)';
  aiBg.font = '14px monospace';
  aiBg.fillText('{tokens}', 260, 220);
  aiBg.fillText('∇ W·x + b', 620, 220);
  aiBg.fillText('Softmax()', 440, 310);
  refresh(scene, 'ai-background');

  // 3. DEVOPS / SRE BACKGROUND (960x540)
  const devBg = canvas(scene, 'devops-background', 960, 540);
  const devGrad = devBg.createLinearGradient(0, 0, 0, 540);
  devGrad.addColorStop(0, '#041008');
  devGrad.addColorStop(0.65, '#0b2012');
  devGrad.addColorStop(1, '#112c1b');
  devBg.fillStyle = devGrad;
  devBg.fillRect(0, 0, 960, 540);

  // Large overhead coolant pipeline conduits
  devBg.fillStyle = '#06170d';
  devBg.strokeStyle = 'rgba(124, 255, 107, 0.25)';
  devBg.lineWidth = 2;
  devBg.fillRect(0, 70, 960, 18);
  devBg.strokeRect(0, 70, 960, 18);
  devBg.fillRect(0, 96, 960, 14);
  devBg.strokeRect(0, 96, 960, 14);

  // CI/CD Pipeline stages
  const stages = [
    { name: '01 GIT CLONE', status: 'PASS', color: '#7cff6b', x: 130 },
    { name: '02 BUILD TEST', status: 'PASS', color: '#7cff6b', x: 360 },
    { name: '03 DEPLOY STG', status: 'WARN', color: '#ffd700', x: 590 },
    { name: '04 PROD ALERT', status: 'P0 500', color: '#ff2a55', x: 820 },
  ];
  for (const st of stages) {
    devBg.fillStyle = '#081a0f';
    devBg.strokeStyle = st.color;
    devBg.lineWidth = 1.8;
    roundRect(devBg, st.x - 85, 160, 170, 64, 4);
    devBg.fill();
    devBg.stroke();

    devBg.fillStyle = '#ffffff';
    devBg.font = 'bold 11px monospace';
    devBg.textAlign = 'center';
    devBg.fillText(st.name, st.x, 182);

    devBg.fillStyle = st.color;
    devBg.font = 'bold 13px monospace';
    devBg.fillText(`[ ${st.status} ]`, st.x, 206);
  }

  // Connecting data bus pipes between stages
  devBg.strokeStyle = 'rgba(124, 255, 107, 0.4)';
  devBg.lineWidth = 3;
  devBg.beginPath();
  devBg.moveTo(215, 192); devBg.lineTo(275, 192);
  devBg.moveTo(445, 192); devBg.lineTo(505, 192);
  devBg.moveTo(675, 192); devBg.lineTo(735, 192);
  devBg.stroke();
  refresh(scene, 'devops-background');
}

// ---------------------------------------------------------------------------
// 7. PARTICLES & COMBAT VFX
// ---------------------------------------------------------------------------
function bakeVFXTextures(scene: Phaser.Scene): void {
  // Glowing spark particle
  const spark = canvas(scene, 'particle', 16, 16);
  const sparkGrad = spark.createRadialGradient(8, 8, 1, 8, 8, 8);
  sparkGrad.addColorStop(0, '#ffffff');
  sparkGrad.addColorStop(0.4, '#00f0ff');
  sparkGrad.addColorStop(1, 'rgba(0,240,255,0)');
  spark.fillStyle = sparkGrad;
  spark.beginPath();
  spark.arc(8, 8, 8, 0, Math.PI * 2);
  spark.fill();
  refresh(scene, 'particle');

  // Shockwave ring for pops
  const ring = canvas(scene, 'shockwave_ring', 64, 64);
  ring.strokeStyle = '#00f0ff';
  ring.lineWidth = 3;
  ring.beginPath();
  ring.arc(32, 32, 28, 0, Math.PI * 2);
  ring.stroke();
  refresh(scene, 'shockwave_ring');
}

// ---------------------------------------------------------------------------
// 8. SERVER DEFENSE INFRASTRUCTURE
// ---------------------------------------------------------------------------
function bakeServerTextures(scene: Phaser.Scene): void {
  const width = 64;
  const height = 52;

  // 1. Pristine Online Server Rack (100% - 75% HP)
  const ok = canvas(scene, 'server-rack', width, height);
  // Chassis
  ok.fillStyle = '#081220';
  ok.strokeStyle = '#00f0ff';
  ok.lineWidth = 2;
  roundRect(ok, 2, 2, width - 4, height - 4, 4);
  ok.fill();
  ok.stroke();

  // Top header status bar
  ok.fillStyle = '#0f243c';
  ok.fillRect(4, 4, width - 8, 9);
  ok.fillStyle = '#00f0ff';
  ok.font = 'bold 7px monospace';
  ok.fillText('SRV-SYS: ONLINE', 8, 11);

  // Server Blades
  for (let y = 16; y <= 40; y += 8) {
    ok.fillStyle = '#0b1828';
    ok.strokeStyle = '#1a3350';
    ok.lineWidth = 1;
    roundRect(ok, 5, y, width - 10, 6, 1);
    ok.fill();
    ok.stroke();

    // LEDs
    ok.fillStyle = '#39ff14';
    ok.fillRect(8, y + 1.5, 3, 3);
    ok.fillStyle = '#00f0ff';
    ok.fillRect(13, y + 1.5, 3, 3);
    ok.fillStyle = y % 16 === 0 ? '#ffd700' : '#39ff14';
    ok.fillRect(18, y + 1.5, 3, 3);

    // Drive bay lines
    ok.fillStyle = '#1c3452';
    ok.fillRect(26, y + 2, 28, 2);
  }
  refresh(scene, 'server-rack');

  // 2. Damaged Server Rack (50% HP)
  const damaged = canvas(scene, 'server-rack-damaged', width, height);
  damaged.fillStyle = '#15140e';
  damaged.strokeStyle = '#ffd700';
  damaged.lineWidth = 2;
  roundRect(damaged, 2, 2, width - 4, height - 4, 4);
  damaged.fill();
  damaged.stroke();

  damaged.fillStyle = '#262210';
  damaged.fillRect(4, 4, width - 8, 9);
  damaged.fillStyle = '#ffd700';
  damaged.font = 'bold 7px monospace';
  damaged.fillText('SRV-SYS: WARN', 8, 11);

  for (let y = 16; y <= 40; y += 8) {
    damaged.fillStyle = '#1a1810';
    damaged.strokeStyle = '#383216';
    damaged.lineWidth = 1;
    roundRect(damaged, 5, y, width - 10, 6, 1);
    damaged.fill();
    damaged.stroke();

    damaged.fillStyle = '#ffd700';
    damaged.fillRect(8, y + 1.5, 3, 3);
    damaged.fillStyle = '#ff8c00';
    damaged.fillRect(13, y + 1.5, 3, 3);
  }
  // Yellow fracture crack
  damaged.strokeStyle = '#ffd700';
  damaged.lineWidth = 1.5;
  damaged.beginPath();
  damaged.moveTo(14, 18); damaged.lineTo(26, 32); damaged.lineTo(38, 24);
  damaged.stroke();
  refresh(scene, 'server-rack-damaged');

  // 3. Critical Server Rack (25% HP)
  const crit = canvas(scene, 'server-rack-critical', width, height);
  crit.fillStyle = '#1c0a12';
  crit.strokeStyle = '#ff2a55';
  crit.lineWidth = 2;
  roundRect(crit, 2, 2, width - 4, height - 4, 4);
  crit.fill();
  crit.stroke();

  crit.fillStyle = '#300f1c';
  crit.fillRect(4, 4, width - 8, 9);
  crit.fillStyle = '#ff2a55';
  crit.font = 'bold 7px monospace';
  crit.fillText('SRV-SYS: CRIT', 8, 11);

  for (let y = 16; y <= 40; y += 8) {
    crit.fillStyle = '#220b15';
    crit.strokeStyle = '#441628';
    crit.lineWidth = 1;
    roundRect(crit, 5, y, width - 10, 6, 1);
    crit.fill();
    crit.stroke();

    crit.fillStyle = '#ff2a55';
    crit.fillRect(8, y + 1.5, 3, 3);
    crit.fillStyle = '#ff0000';
    crit.fillRect(13, y + 1.5, 3, 3);
  }
  // Red jagged fracture
  crit.strokeStyle = '#ff2a55';
  crit.lineWidth = 2;
  crit.beginPath();
  crit.moveTo(8, 12); crit.lineTo(22, 28); crit.lineTo(32, 20); crit.lineTo(54, 46);
  crit.stroke();
  refresh(scene, 'server-rack-critical');

  // 4. Destroyed Offline Server Rack (0% HP)
  const off = canvas(scene, 'server-rack-destroyed', width, height);
  off.fillStyle = '#08090d';
  off.strokeStyle = '#444c58';
  off.lineWidth = 1.8;
  roundRect(off, 2, 2, width - 4, height - 4, 4);
  off.fill();
  off.stroke();

  off.fillStyle = '#12141a';
  off.fillRect(4, 4, width - 8, 9);
  off.fillStyle = '#7a8594';
  off.font = 'bold 7px monospace';
  off.fillText('SRV-SYS: OFFLINE', 8, 11);

  // Scorched blackened slots
  for (let y = 16; y <= 40; y += 8) {
    off.fillStyle = '#050608';
    off.fillRect(5, y, width - 10, 6);
  }
  // Charred burn mark
  off.fillStyle = '#000000aa';
  off.beginPath();
  off.arc(28, 28, 18, 0, Math.PI * 2);
  off.fill();
  refresh(scene, 'server-rack-destroyed');

  // 5. Laser sight dot for aiming
  const dot = canvas(scene, 'laser_dot', 8, 8);
  const dotGrad = dot.createRadialGradient(4, 4, 1, 4, 4, 4);
  dotGrad.addColorStop(0, '#ffffff');
  dotGrad.addColorStop(0.4, '#00f0ff');
  dotGrad.addColorStop(1, 'rgba(0,240,255,0)');
  dot.fillStyle = dotGrad;
  dot.beginPath();
  dot.arc(4, 4, 4, 0, Math.PI * 2);
  dot.fill();
  refresh(scene, 'laser_dot');
}

// ---------------------------------------------------------------------------
// 9. BOSS OBJECTIVES (TOKENS CORE & PROD DEPLOY GATE)
// ---------------------------------------------------------------------------
function bakeBossTextures(scene: Phaser.Scene): void {
  // 1. AI Mode: Giant Tokens Core (180x80)
  const tokens = canvas(scene, 'tokens-core-boss', 180, 80);
  // Outer singularity casing
  tokens.fillStyle = '#0f051c';
  tokens.strokeStyle = '#c77dff';
  tokens.lineWidth = 3;
  roundRect(tokens, 3, 3, 174, 74, 10);
  tokens.fill();
  tokens.stroke();

  // Concentric neural reactor rings
  tokens.strokeStyle = 'rgba(0, 240, 255, 0.6)';
  tokens.lineWidth = 2;
  tokens.beginPath();
  tokens.arc(90, 40, 28, 0, Math.PI * 2);
  tokens.stroke();

  tokens.fillStyle = '#c77dff';
  tokens.beginPath();
  tokens.arc(90, 40, 16, 0, Math.PI * 2);
  tokens.fill();
  tokens.fillStyle = '#ffffff';
  tokens.beginPath();
  tokens.arc(90, 40, 8, 0, Math.PI * 2);
  tokens.fill();

  // Top and bottom banner labels
  tokens.fillStyle = '#ffffff';
  tokens.font = 'bold 11px monospace';
  tokens.textAlign = 'center';
  tokens.fillText('[ ROGUE TOKENS CORE ]', 90, 18);

  tokens.fillStyle = '#c77dff';
  tokens.font = 'bold 9px monospace';
  tokens.fillText('DESTROY TO PURGE MODEL', 90, 70);
  refresh(scene, 'tokens-core-boss');

  // 2. DevOps Mode: Deploy to Prod Terminal Gate (180x80)
  const deploy = canvas(scene, 'deploy-terminal-boss', 180, 80);
  deploy.fillStyle = '#05140b';
  deploy.strokeStyle = '#7cff6b';
  deploy.lineWidth = 3;
  roundRect(deploy, 3, 3, 174, 74, 8);
  deploy.fill();
  deploy.stroke();

  // Data bus conduit
  deploy.fillStyle = '#0b2616';
  deploy.fillRect(8, 22, 164, 36);
  deploy.strokeStyle = '#39ff14';
  deploy.lineWidth = 1.5;
  deploy.strokeRect(8, 22, 164, 36);

  deploy.fillStyle = '#ffffff';
  deploy.font = 'bold 11px monospace';
  deploy.textAlign = 'center';
  deploy.fillText('[ DEPLOY // PROD GATE ]', 90, 16);

  deploy.fillStyle = '#7cff6b';
  deploy.font = 'bold 13px monospace';
  deploy.fillText('▶ MERGE HOTFIX ◀', 90, 44);

  deploy.fillStyle = '#ffd700';
  deploy.font = 'bold 8px monospace';
  deploy.fillText('BLAST TERMINAL TO COMPLETE', 90, 71);
  refresh(scene, 'deploy-terminal-boss');
}

// ---------------------------------------------------------------------------
// MAIN BAKE CALL
// ---------------------------------------------------------------------------
export function bakeTextures(scene: Phaser.Scene): void {
  bakeHeroTextures(scene);
  bakeOrbTextures(scene);
  bakeWeaponTextures(scene);
  bakePowerUpTextures(scene);
  bakeEnvironmentTextures(scene);
  bakeBackgrounds(scene);
  bakeVFXTextures(scene);
  bakeServerTextures(scene);
  bakeBossTextures(scene);

  const required = [
    'hero', 'hero_walk_0', 'hero_walk_1', 'hero_walk_2', 'hero_walk_3', 'hero_jump', 'hero_fire', 'hero_climb_0', 'hero_climb_1', 'hero_life',
    'orb1', 'orb2', 'orb3', 'orb4', 'orb_tier_4',
    'harpoon-rj45', 'harpoon-ai', 'harpoon-devops', 'wire_beam', 'bullet_patch',
    'pickup_freeze', 'pickup_shield', 'pickup_double', 'pickup_triple', 'pickup_sticky', 'pickup_patch', 'pickup_firewall',
    'platform-solid', 'platform-breakable', 'ladder-rung',
    'cybersec-background', 'ai-background', 'devops-background',
    'particle', 'shockwave_ring',
    'server-rack', 'server-rack-damaged', 'server-rack-critical', 'server-rack-destroyed', 'laser_dot',
    'tokens-core-boss', 'deploy-terminal-boss',
  ];

  for (const key of required) {
    if (!scene.textures.exists(key)) {
      throw new Error(`Missing baked texture ${key}`);
    }
  }
}
