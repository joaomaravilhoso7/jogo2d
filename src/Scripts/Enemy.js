import * as THREE from 'three';

export class Enemy {
  checkpoint1 = null;
  checkpoint2 = null;
  speed = 1;
  isMovingLeft = true;

  constructor(object) {
    this.object = object;
    this.object.userData.script = this;
  }

  start() {
    if (this.#positionX(this.checkpoint1) > this.#positionX(this.checkpoint2)) {
      const aux = this.checkpoint2;
      this.checkpoint2 = this.checkpoint1;
      this.checkpoint1 = aux;
    }
  }

  fixedUpdate(dt) {
    if (this.isMovingLeft) {
      if (this.object.position.x < this.#positionX(this.checkpoint1)) {
        this.isMovingLeft = !this.isMovingLeft;
      }
    } else {
      if (this.object.position.x > this.#positionX(this.checkpoint2)) {
        this.isMovingLeft = !this.isMovingLeft;
      }
    }

    const direction = this.isMovingLeft ? -1 : 1;
    this.object.position.x += direction * this.speed * dt;

    this.object.scale.x = this.isMovingLeft ? 1 : -1;

    this.object.userData.rigidBody?.setNextKinematicTranslation({
      x: this.object.position.x,
      y: this.object.position.y,
    });
  }

  #positionX(checkpoint) {
    return checkpoint.getWorldPosition(new THREE.Vector3()).x;
  }
}