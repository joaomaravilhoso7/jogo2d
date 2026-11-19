export class EnemyVertical {
  minY = -1;
  maxY = 2;
  speed = 1;
  isMovingUp = true;

  constructor(object) {
    this.object = object;
    this.object.userData.script = this;
  }

  fixedUpdate(dt) {
    if (this.isMovingUp) {
      if (this.object.position.y >= this.maxY) {
        this.isMovingUp = false;
      }
    } else {
      if (this.object.position.y <= this.minY) {
        this.isMovingUp = true;
      }
    }

    const direction = this.isMovingUp ? 1 : -1;
    this.object.position.y += direction * this.speed * dt;

    this.object.userData.rigidBody?.setNextKinematicTranslation({
      x: this.object.position.x,
      y: this.object.position.y,
    });
  }
}