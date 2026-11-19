import * as THREE from 'three';

// Desenha os colliders e os raios a verde.
export class DebugFisica {
  static #raios = [];

  static drawRay(origem, direcao) {
    DebugFisica.#raios.push(
      origem.x,
      origem.y,
      origem.x + direcao.x,
      origem.y + direcao.y
    );
  }

  constructor(scene, fisica) {
    this.fisica = fisica;

    this.linhas = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: 0x00ff00,
      })
    );

    this.linhas.position.z = 5;
    this.linhas.frustumCulled = false;

    scene.add(this.linhas);
  }

  fixedUpdate() {
    DebugFisica.#raios = [];
  }

  update() {
    if (!this.linhas.visible) return;

    const vertices = [
      ...this.fisica.debugRender().vertices,
      ...DebugFisica.#raios,
    ];

    const posicoes = new Float32Array(
      (vertices.length / 2) * 3
    );

    for (
      let i = 0, j = 0;
      i < vertices.length;
      i += 2, j += 3
    ) {
      posicoes[j] = vertices[i];
      posicoes[j + 1] = vertices[i + 1];
    }

    this.linhas.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posicoes, 3)
    );
  }
}