import Phaser from 'phaser';

function canvas(scene: Phaser.Scene, key: string, width: number, height: number): CanvasRenderingContext2D {
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) throw new Error(`Unable to create texture ${key}`);
  const context = texture.getContext();
  context.clearRect(0, 0, width, height);
  return context;
}

export function bakeTextures(scene: Phaser.Scene): void {
  for (let frame = 0; frame < 4; frame++) {
    const context = canvas(scene, `hero_walk_${frame}`, 32, 48);
    context.fillStyle = '#10273a'; context.strokeStyle = '#00f0ff'; context.lineWidth = 3;
    context.beginPath(); context.roundRect(4, 18, 24, 24, 7); context.fill(); context.stroke();
    context.fillStyle = '#dffcff'; context.beginPath(); context.arc(16, 10, 10, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#00f0ff'; context.fillRect(9, 7, 14, 4);
    context.strokeStyle = '#00f0ff'; context.lineWidth = 4;
    context.beginPath();
    context.moveTo(11, 40); context.lineTo(8 + (frame % 2) * 6, 46);
    context.moveTo(21, 40); context.lineTo(24 - (frame % 2) * 6, 46);
    context.stroke();
  }

  const tiers = [
    { tier: 1, radius: 11, color: '#00f0ff', size: 32 },
    { tier: 2, radius: 19, color: '#ffd700', size: 48 },
    { tier: 3, radius: 30, color: '#ff8c00', size: 72 },
    { tier: 4, radius: 44, color: '#ff2a55', size: 104 },
  ] as const;

  for (const item of tiers) {
    const context = canvas(scene, `orb${item.tier}`, item.size, item.size);
    const cx = item.size / 2;
    context.shadowBlur = item.tier === 4 ? 18 : 12;
    context.shadowColor = item.color;
    context.fillStyle = `${item.color}22`; context.beginPath(); context.arc(cx, cx, item.radius + 5, 0, Math.PI * 2); context.fill();
    context.shadowBlur = 0;
    context.fillStyle = '#101827'; context.beginPath(); context.arc(cx, cx, item.radius, 0, Math.PI * 2); context.fill();
    context.strokeStyle = item.color; context.lineWidth = 3; context.beginPath(); context.arc(cx, cx, item.radius - 1.5, 0, Math.PI * 2); context.stroke();
    context.fillStyle = '#ffffffcc'; context.beginPath(); context.arc(cx - item.radius * 0.25, cx - item.radius * 0.25, item.radius * 0.18, 0, Math.PI * 2); context.fill();
    if (item.tier === 4) {
      context.fillStyle = '#ffffff'; context.font = 'bold 9px monospace'; context.textAlign = 'center'; context.fillText('CVE', cx, cx + 3);
    } else {
      context.strokeStyle = '#ffffff'; context.lineWidth = 2;
      context.strokeRect(cx - 7, cx - 7, 14, 14);
      context.beginPath(); context.moveTo(cx - 7, cx); context.lineTo(cx + 7, cx); context.stroke();
    }
  }

  const harpoon = canvas(scene, 'harpoon-rj45', 24, 34);
  harpoon.fillStyle = '#00f0ff'; harpoon.fillRect(8, 2, 8, 32);
  harpoon.strokeStyle = '#dffcff'; harpoon.lineWidth = 2; harpoon.strokeRect(3, 0, 18, 12);

  const aiHarpoon = canvas(scene, 'harpoon-ai', 24, 34);
  aiHarpoon.fillStyle = '#c77dff'; aiHarpoon.fillRect(10, 2, 4, 32);
  aiHarpoon.strokeStyle = '#66f7ff'; aiHarpoon.lineWidth = 3; aiHarpoon.beginPath(); aiHarpoon.arc(12, 8, 8, 0, Math.PI * 2); aiHarpoon.stroke();

  const devopsHarpoon = canvas(scene, 'harpoon-devops', 24, 34);
  devopsHarpoon.fillStyle = '#ffb84d'; devopsHarpoon.fillRect(9, 2, 6, 32);
  devopsHarpoon.strokeStyle = '#7cff6b'; devopsHarpoon.lineWidth = 3; devopsHarpoon.strokeRect(3, 0, 18, 12);

  const background = canvas(scene, 'cybersec-background', 960, 540);
  background.fillStyle = '#08111b'; background.fillRect(0, 0, 960, 540);
  background.fillStyle = '#10202d';
  for (let x = 20; x < 960; x += 180) {
    background.fillRect(x, 70, 120, 250);
    for (let y = 90; y < 300; y += 28) {
      background.fillStyle = (y + x) % 56 === 0 ? '#ffbd59' : '#4cff88';
      background.fillRect(x + 12, y, 5, 5);
    }
  }

  const aiBackground = canvas(scene, 'ai-background', 960, 540);
  aiBackground.fillStyle = '#120c20'; aiBackground.fillRect(0, 0, 960, 540);
  aiBackground.strokeStyle = '#b567e8'; aiBackground.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const x1 = (i * 73) % 960, y1 = (i * 47) % 420 + 60;
    const x2 = ((i * 137) + 90) % 960, y2 = ((i * 83) + 80) % 420 + 60;
    aiBackground.beginPath(); aiBackground.moveTo(x1, y1); aiBackground.lineTo(x2, y2); aiBackground.stroke();
    aiBackground.fillStyle = '#dba8ff'; aiBackground.beginPath(); aiBackground.arc(x1, y1, 5, 0, Math.PI * 2); aiBackground.fill();
  }

  const devopsBackground = canvas(scene, 'devops-background', 960, 540);
  devopsBackground.fillStyle = '#09150f'; devopsBackground.fillRect(0, 0, 960, 540);
  devopsBackground.font = 'bold 14px monospace'; devopsBackground.textAlign = 'center';
  ['BUILD', 'TEST', 'DEPLOY', 'MONITOR'].forEach((stage, i) => {
    const x = 150 + i * 220;
    devopsBackground.strokeStyle = i === 2 ? '#ff5252' : '#7cff6b'; devopsBackground.lineWidth = 3;
    devopsBackground.strokeRect(x - 70, 160, 140, 74);
    devopsBackground.fillStyle = '#caffc0'; devopsBackground.fillText(stage, x, 205);
  });

  const heroAlias = canvas(scene, 'hero', 32, 48);
  const heroSource = scene.textures.get('hero_walk_0').getSourceImage() as HTMLCanvasElement;
  heroAlias.drawImage(heroSource, 0, 0, 32, 48);
  (scene.textures.get('hero') as unknown as { refresh: () => void }).refresh();

  const tier4Alias = canvas(scene, 'orb_tier_4', 104, 104);
  const tier4Source = scene.textures.get('orb4').getSourceImage() as HTMLCanvasElement;
  tier4Alias.drawImage(tier4Source, 0, 0, 104, 104);
  (scene.textures.get('orb_tier_4') as unknown as { refresh: () => void }).refresh();

  for (const key of ['hero', 'hero_walk_0', 'hero_walk_1', 'hero_walk_2', 'hero_walk_3', 'orb1', 'orb2', 'orb3', 'orb4', 'orb_tier_4', 'harpoon-rj45', 'harpoon-ai', 'harpoon-devops', 'cybersec-background', 'ai-background', 'devops-background']) {
    if (!scene.textures.exists(key)) throw new Error(`Missing baked texture ${key}`);
    (scene.textures.get(key) as unknown as { refresh: () => void }).refresh();
  }
}
