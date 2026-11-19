import * as THREE from 'three';
import { criarSprite } from '../Materials/sprite.js/sprite.js';

// Plataforma composta por três imagens.
export async function criarPlataforma(nome, x, y) {
  const plataforma = new THREE.Group();
  plataforma.userData.tag = 'platform';

  plataforma.name = nome;

  const esquerda = await criarSprite(
    'assets/Sprites/Parts/1.png'
  );

  const centro = await criarSprite(
    'assets/Sprites/Parts/2.png'
  );

  const direita = await criarSprite(
    'assets/Sprites/Parts/3.png'
  );

  esquerda.position.set(-1.28, 0, 0);
  centro.position.set(0, 0, 0);
  direita.position.set(1.28, 0, 0);

  plataforma.add(esquerda, centro, direita);

  // À frente do fundo.
  plataforma.position.set(x, y, 1);

  return plataforma;
}