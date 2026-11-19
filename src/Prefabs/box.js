import { criarSprite } from '../Materials/sprite.js/sprite.js';

import {
  addBoxCollider,
  addRigidbody,
} from '../Scripts/Physics.js';

export async function createBox(physics, x, y) {
  const box = await criarSprite(
    'assets/Sprites/Objects/Crate.png'
  );

  box.name = 'Box';
  box.userData.tag = 'box';
  box.position.set(x, y, 1.5);

  addRigidbody(physics, box);

  const collider = addBoxCollider(physics, box);
  collider.setSensor(true);

  return box;
}