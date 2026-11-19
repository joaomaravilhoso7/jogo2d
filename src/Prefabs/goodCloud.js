import { criarSprite } from '../Materials/sprite.js/sprite.js';
import { Clouds } from '../Scripts/Clouds.js';
import { CloudSpawnBoxes } from '../Scripts/CloudSpawnBoxes.js';
import { createBox } from './box.js';

export async function createGoodCloud(physics, x, y) {
  const cloud = await criarSprite(
    'assets/Sprites/Objects/Cloud_1.png'
  );

  cloud.name = 'GoodCloud';
  cloud.position.set(x, y, 0.5);
  cloud.scale.set(0.5, 0.5, 1);

  const clouds = new Clouds(cloud);
  clouds.speed = 3;

  const spawnBoxes = new CloudSpawnBoxes(cloud, physics);
  spawnBoxes.boxPrefab = createBox;

  return cloud;
}