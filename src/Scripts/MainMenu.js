import { SceneManager } from './SceneManager.js';

export class MainMenu {
  levelToLoad = 'nivel1';

  newGame() {
    localStorage.setItem('score', '0');
    SceneManager.loadScene(this.levelToLoad);
  }

  quitGame() {
    document.querySelector('#gui').innerHTML =
      '<h1>Obrigado por jogar!</h1>';
  }
}