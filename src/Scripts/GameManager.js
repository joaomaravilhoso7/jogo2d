import { Input } from './Input.js';
import { Time } from './Time.js';
import { SceneManager } from './SceneManager.js';

export class GameManager {
  isPaused = false;
  pauseMenu = null;
  #pausePressed = false;
  #musica = new Audio(
    `${import.meta.env.BASE_URL}assets/Sounds/musica-fundo.mp3`
  );

  start() {
    this.#musica.loop = true;
    this.#musica.volume = 0.35;

    const iniciarMusica = (event) => {
      if (this.isPaused || event.code === 'Escape') return;

      this.#tocarMusica();
      window.removeEventListener('click', iniciarMusica);
      window.removeEventListener('keydown', iniciarMusica);
    };

    window.addEventListener('click', iniciarMusica);
    window.addEventListener('keydown', iniciarMusica);

    this.pauseMenu?.querySelector('#btnResume')?.addEventListener('click', () => {
      this.resumeGame();
    });

    this.pauseMenu?.querySelector('#btnMenu')?.addEventListener('click', () => {
      this.#musica.pause();
      SceneManager.loadScene('index');
    });
  }

  update() {
    const pause = Input.getButton('Pause');

    if (pause && !this.#pausePressed) {
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }

    this.#pausePressed = pause;
  }

  pauseGame() {
    this.isPaused = true;
    Time.timeScale = 0;
    this.#musica.pause();

    if (this.pauseMenu) this.pauseMenu.hidden = false;
  }

  resumeGame() {
    this.isPaused = false;
    Time.timeScale = 1;
    this.#tocarMusica();

    if (this.pauseMenu) this.pauseMenu.hidden = true;
  }

  #tocarMusica() {
    this.#musica.play().catch((erro) => {
      if (erro.name !== 'AbortError') {
        console.warn('Não foi possível tocar a música de fundo:', erro);
      }
    });
  }
}