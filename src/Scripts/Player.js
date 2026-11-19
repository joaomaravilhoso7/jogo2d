import { destroyObject } from './Physics.js';
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { Time } from './Time.js';
import { dead } from '../Animation/dead.js';

const VIDA_VAZIA =
  `${import.meta.env.BASE_URL}assets/Sprites/Objects/vida-vazia.svg`;

export class Player {
  #playerRb;
  #myAnimation;
  #horizontal = 0;
  #grounded;
  #canDoubleJump;
  #jumpPressed = false;
  #imagensVidas;
  #lastPlatform;
  #checkpoint;
  #aMorrer = false;
  #tempoMorte = 0;

  // Valores guardados antes de a física resolver as colisões.
  #velocidadeVerticalAnterior = 0;
  #baseAnterior = 0;

  movementSpeed = 3;
  jumpPower = 40;
  vidas = 3;

  constructor(object) {
    this.object = object;
    this.object.userData.script = this;
  }

  start() {
    this.#playerRb = this.object.userData.rigidBody;
    this.#myAnimation = this.object.userData.animator;
    this.#grounded = true;
    this.#canDoubleJump = false;

    this.vidas = 3;
    this.#imagensVidas = [...document.querySelectorAll('.vida')];

    for (const imagem of this.#imagensVidas) {
      imagem.dataset.vidaCheia = imagem.src;
      imagem.hidden = false;
    }
  }

  update(dt) {
    this.#horizontal = Input.getAxis('Horizontal');
    const jump = Input.getButton('Jump');

    if (Time.timeScale === 0) {
      this.#jumpPressed = jump;
      return;
    }

    if (this.#aMorrer) {
      this.#jumpPressed = jump;

      if (this.#myAnimation.currentState === 'dead') {
        this.#tempoMorte -= dt;

        if (this.#tempoMorte <= 0) {
          this.#terminarMorte();
        }
      }

      return;
    }

    if (jump && !this.#jumpPressed) {
      if (this.#grounded) {
        this.#playerRb.applyImpulse(
          { x: 0, y: this.jumpPower },
          true
        );

        this.#canDoubleJump = true;
        this.#grounded = false;
      } else if (this.#canDoubleJump) {
        this.#canDoubleJump = false;

        this.#playerRb.setLinvel(
          { x: this.#playerRb.linvel().x, y: 0 },
          true
        );

        this.#playerRb.applyImpulse(
          { x: 0, y: this.jumpPower / 1.75 },
          true
        );
      }
    }

    this.#jumpPressed = jump;
  }

  fixedUpdate() {
    if (this.#aMorrer) return;

    this.#handleMovement();

    this.#velocidadeVerticalAnterior = this.#playerRb.linvel().y;

    const collider = this.object.userData.collider;

    this.#baseAnterior =
      collider.translation().y - collider.halfExtents().y;

    this.#myAnimation.setFloat(
      'verticalSpeed',
      Math.abs(this.#velocidadeVerticalAnterior)
    );
  }

  ganharVida() {
    if (this.vidas <= 0 || this.vidas >= 3) return;

    this.vidas += 1;
    const imagem = this.#imagensVidas[this.vidas - 1];

    if (imagem) {
      imagem.src = imagem.dataset.vidaCheia;
      imagem.alt = `Vida ${this.vidas}`;
    }
  }

  onTriggerEnter(other) {
    if (other.userData.tag === 'checkpoint') {
      this.#checkpoint = other.position.clone();
    }

    if (other.userData.tag === 'box') {
      destroyObject(other);
    }
  }

  onCollisionEnter(other) {
    if (this.#aMorrer || this.vidas <= 0) return;

    if (other.userData.tag === 'platform') {
      this.#grounded = true;
      this.#canDoubleJump = false;
      this.#lastPlatform = other;
      return;
    }

    if (other.userData.tag === 'enemy') {
      const colliderInimigo = other.userData.collider;

      if (!colliderInimigo) return;

      const topoInimigo =
        colliderInimigo.translation().y +
        colliderInimigo.halfExtents().y;

      const estavaACair = this.#velocidadeVerticalAnterior < 0;
      const estavaPorCima = this.#baseAnterior >= topoInimigo - 0.15;

      if (estavaACair && estavaPorCima) {
        // O script continua na lista scripts do nível:
        // desativamos o movimento antes de remover o corpo físico.
        const scriptInimigo = other.userData.script;

        if (scriptInimigo) {
          scriptInimigo.fixedUpdate = () => {};
        }

        destroyObject(other);

        // Pequeno salto depois de derrotar o inimigo.
        this.#playerRb.setLinvel(
          {
            x: this.#playerRb.linvel().x,
            y: 5,
          },
          true
        );

        this.#grounded = false;
        this.#canDoubleJump = true;
        return;
      }
    }

    if (
      other.userData.tag !== 'limit' &&
      other.userData.tag !== 'enemy'
    ) {
      return;
    }

    this.vidas -= 1;
    const imagem = this.#imagensVidas[this.vidas];

    if (imagem) {
      imagem.src = VIDA_VAZIA;
      imagem.alt = 'Vida perdida';
    }

    this.#aMorrer = true;
    this.#tempoMorte = dead.images.length / dead.imagesPerSecond;

    this.#playerRb.setLinvel({ x: 0, y: 0 }, true);
    this.#myAnimation.setFloat('isDead', 1);
  }

  #terminarMorte() {
    if (this.vidas === 0) {
      this.#tempoMorte = Infinity;
      SceneManager.loadScene('derrota');
      return;
    }

    let respawn = { x: 0, y: 0 };

    if (this.#checkpoint) {
      respawn = {
        x: this.#checkpoint.x,
        y: this.#checkpoint.y + 1,
      };
    } else if (this.#lastPlatform) {
      const { x, y } = this.#lastPlatform.position;
      respawn = { x, y: y + 2 };
    }

    this.#playerRb.setTranslation(respawn, true);
    this.#playerRb.setLinvel({ x: 0, y: 0 }, true);

    this.#grounded = false;
    this.#canDoubleJump = false;

    this.#myAnimation.setFloat('speed', 0);
    this.#myAnimation.setFloat('verticalSpeed', 0);
    this.#myAnimation.setFloat('isDead', 0);

    this.#aMorrer = false;
  }

  #handleMovement() {
    const horizontal =
      this.#horizontal * (Input.getButton('Walk') ? 0.5 : 1);

    if (horizontal !== 0) {
      this.object.scale.x = horizontal < 0 ? -0.5 : 0.5;
    }

    this.#playerRb.setLinvel(
      {
        x: horizontal * this.movementSpeed,
        y: this.#playerRb.linvel().y,
      },
      true
    );

    this.#myAnimation.setFloat('speed', Math.abs(horizontal));
  }
}