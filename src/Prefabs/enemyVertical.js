import { criarSprite } from '../Materials/sprite.js/sprite.js';
import { EnemyVertical } from '../Scripts/EnemyVertical.js';

import {
  addBoxCollider,
  addKinematicRigidbody,
} from '../Scripts/Physics.js';

export async function createEnemyVertical(physics, x, y) {
  const enemy = await criarSprite(
    'assets/Sprites/Objects/Spike.png'
  );

  enemy.name = 'EnemyVertical';
  enemy.userData.tag = 'enemy';
  enemy.position.set(x, y, 1.5);

  addKinematicRigidbody(physics, enemy);
  addBoxCollider(physics, enemy);

  new EnemyVertical(enemy);

  return enemy;
}