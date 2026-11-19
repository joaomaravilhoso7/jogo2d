export class Level1Manager {
  cloudPrefab1 = null;
  cloudPrefab2 = null;
  goodCloudPrefab = null;

  constructor(object, scene, scripts, camera) {
    this.object = object;
    this.scene = scene;
    this.scripts = scripts;
    this.camera = camera;
  }

  async start() {
    const esquerda = this.camera.position.x + this.camera.left;
    const direita = this.camera.position.x + this.camera.right;
    const altura = this.object.position.y;

    await this.#instantiate(this.cloudPrefab1, esquerda, altura, false);
    await this.#instantiate(this.cloudPrefab2, direita, altura - 1.5, true);

    const goodCloud = await this.#instantiate(
      this.goodCloudPrefab,
      esquerda,
      altura,
      false
    );

    this.scripts.push(goodCloud.userData.spawnBoxes);
  }

  async #instantiate(prefab, x, y, isMovingLeft) {
    const cloud = await prefab(x, y);
    const script = cloud.userData.script;

    script.isMovingLeft = isMovingLeft;
    this.scene.add(cloud);
    this.scripts.push(script);

    return cloud;
  }
}