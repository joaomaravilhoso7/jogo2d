import * as THREE from 'three';
import { DebugFisica } from './DebugFisica.js';
import { raycast } from './Physics.js';

export class CloudSpawnBoxes {
  boxPrefab = null;
  #hasTargetedPlayer = false;

  constructor(object, physics) {
    this.object = object;
    this.object.userData.spawnBoxes = this;
    this.physics = physics;
  }

  fixedUpdate() {
    const down = new THREE.Vector3(0, -10, 0);

    DebugFisica.drawRay(this.object.position, down);

    this.#raycastCheckCollision();
  }

  async #raycastCheckCollision() {
    if (this.#hasTargetedPlayer) return;

    const down = new THREE.Vector3(0, -1, 0);

    const hit = raycast(
      this.physics,
      this.object.position,
      down,
      10
    );

    if (hit !== null && hit.userData.tag === 'player') {
      this.#hasTargetedPlayer = true;

      const position = this.object.position;

      const box = await this.boxPrefab(
        this.physics,
        position.x,
        position.y
      );

      this.object.parent.add(box);
    }
  }
}