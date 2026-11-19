import { criarSprite } from '../Materials/sprite.js/sprite.js';
import { Enemy } from '../Scripts/Enemy.js';

import {
  addBoxCollider,
  addKinematicRigidbody,
} from '../Scripts/Physics.js';

export async function createEnemy(physics, x, y) {
  const enemy = await criarSprite(
    'assets/Sprites/Objects/Skeleton.png'
  );

  enemy.name = 'Enemy';
  enemy.userData.tag = 'enemy';
  enemy.position.set(x, y, 1.5);

  addKinematicRigidbody(physics, enemy);
  addBoxCollider(physics, enemy);

  new Enemy(enemy);

  return enemy;
}