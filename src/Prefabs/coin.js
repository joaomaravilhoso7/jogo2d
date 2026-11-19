import * as THREE from 'three';
import { criarSprite } from '../Materials/sprite.js/sprite.js';
import { addCircleCollider } from '../Scripts/Physics.js';
import { CoinPickup } from '../Scripts/CoinPickup.js';

export async function createCoin(physics, x, y) {
  const coin = new THREE.Group();

  coin.name = 'Carne';
  coin.position.set(x, y, 0);

  const image = await criarSprite(
    'assets/Sprites/Objects/carne.png'
  );

  image.name = 'CarneImage';
  image.scale.set(0.15, 0.15, 1);
  image.position.set(0, 0, 0.5);

  coin.add(image);

  addCircleCollider(physics, coin, true);

  new CoinPickup(coin);

  return coin;
}