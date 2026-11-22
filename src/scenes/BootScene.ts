import Phaser from 'phaser';
import { bakeTextures } from '../assets/proceduralArt';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    bakeTextures(this);
    const required = ['hero', 'hero_walk_0', 'hero_walk_1', 'orb1', 'orb2', 'orb3', 'orb4', 'orb_tier_4', 'harpoon-rj45', 'harpoon-ai', 'harpoon-devops', 'cybersec-background', 'ai-background', 'devops-background'];
    if (!required.every((key) => this.textures.exists(key))) {
      throw new Error('Texture verification failed');
    }

    for (const key of ['hero', 'orb_tier_4']) {
      const texture = this.textures.get(key);
      const source = texture.getSourceImage() as HTMLCanvasElement;
      console.log(`[Boot] textures.exists('${key}') =`, this.textures.exists(key), `source = ${source?.width ?? 0}x${source?.height ?? 0}`);
      if (!source || source.width <= 0 || source.height <= 0) {
        throw new Error(`Invalid texture source: ${key}`);
      }
    }

    this.scene.start('Menu');
  }
}
