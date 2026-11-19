import { destroyObject } from './Physics.js';
import { Player } from './Player.js';
import { ScoreManager } from './ScoreManager.js';

export class CoinPickup {
  pointToAdd = 10;

  #coinPickupEffect;

  constructor(object) {
    this.object = object;
    this.object.userData.script = this;

    this.#coinPickupEffect = new Audio(
      'assets/Sounds/TreasurePickup.mp3'
    );
  }

  onTriggerEnter(other) {
    if (!(other.userData.script instanceof Player)) {
      return;
    }

    ScoreManager.addPoints(this.pointToAdd);

    // Recuperar uma vida ao apanhar a moeda.
    other.userData.script.ganharVida();

    this.#coinPickupEffect.play();

    destroyObject(this.object);
  }
}