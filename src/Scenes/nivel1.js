import { createEnemy } from '../Prefabs/enemy.js';
import { createGoodCloud } from '../Prefabs/goodCloud.js';
import { createCheckpoint } from '../Prefabs/checkpoint.js';

import { playerController } from '../Animation/playerController.js';
import { Animator } from '../Scripts/Animator.js';

import { createCloud1 } from '../Prefabs/cloud1.js';
import { createCloud2 } from '../Prefabs/cloud2.js';
import { Level1Manager } from '../Scripts/Level1Manager.js';
import { DebugFisica } from '../Scripts/DebugFisica.js';

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier2d-compat';
import GUI from 'lil-gui';

import { criarSprite } from '../Materials/sprite.js/sprite.js';
import { criarBackground } from '../Prefabs/background.js';
import { criarPlataforma } from '../Prefabs/plataforma.js';
import { createCoin } from '../Prefabs/coin.js';

import { Player } from '../Scripts/Player.js';
import { ScoreManager } from '../Scripts/ScoreManager.js';
import { MainCamera } from '../Scripts/MainCamera.js';
import { GameManager } from '../Scripts/GameManager.js';
import { Time } from '../Scripts/Time.js';

import { createEnemyVertical } from '../Prefabs/enemyVertical.js';

import {
  addRigidbody,
  addBoxCollider,
  addCircleCollider,
  handleCollisions,
  syncPhysics,
} from '../Scripts/Physics.js';

import './hud.css';

async function iniciarJogo() {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  renderer.domElement.style.display = 'block';
  document.body.appendChild(renderer.domElement);

  // Câmara
  const TAMANHO_CAMERA = 5;
  const camera = new THREE.OrthographicCamera();
  camera.position.z = 10;

  function ajustarEcra() {
    const aspeto = window.innerWidth / window.innerHeight;

    camera.left = -TAMANHO_CAMERA * aspeto;
    camera.right = TAMANHO_CAMERA * aspeto;
    camera.top = TAMANHO_CAMERA;
    camera.bottom = -TAMANHO_CAMERA;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ajustarEcra();
  window.addEventListener('resize', ajustarEcra);

  // Cena e física
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x314d79);

  await RAPIER.init();

  const physics = new RAPIER.World({
    x: 0,
    y: -9.81,
  });

  const events = new RAPIER.EventQueue(true);

  // Grupo principal
  const world = new THREE.Group();
  world.name = 'World';
  scene.add(world);

  // Fundo
  const bgFundos = await criarBackground(0, 0);
  bgFundos.name = 'Background';
  world.add(bgFundos);

  // Árvore decorativa
  const arvore = await criarSprite('assets/Sprites/Objects/Tree.png');
  arvore.name = 'Arvore';
  arvore.position.set(-1, -1, 0.1);
  world.add(arvore);

  // Plataformas
  const ground = new THREE.Group();
  ground.name = 'Ground';
  world.add(ground);

  const plat1 = await criarPlataforma('Plat1', 0, -3.5);
  const plat2 = await criarPlataforma('Plat2', -7, 0.8);
  const plat3 = await criarPlataforma('Plat3', 7, 0.8);
  const plat4 = await criarPlataforma('Plat4', 0, 3.2);

  plat1.scale.x = 1.5;
  ground.add(plat1, plat2, plat3, plat4);

  for (const plataforma of ground.children) {
    addBoxCollider(physics, plataforma);
  }

  // Checkpoints da patrulha do inimigo
  const checkpoint1 = createCheckpoint('Checkpoint1', -1.6, 0.9);
  const checkpoint2 = createCheckpoint('Checkpoint2', 1.6, 0.9);

  plat3.add(checkpoint1, checkpoint2);

  // Inimigo na plataforma da direita
  const enemy1 = await createEnemy(physics, 7, 2.08);

  enemy1.userData.script.checkpoint1 = checkpoint1;
  enemy1.userData.script.checkpoint2 = checkpoint2;

  world.add(enemy1);
  const enemyVertical = await createEnemyVertical(physics, 4, -1);

enemyVertical.userData.script.minY = -2;
enemyVertical.userData.script.maxY = 2;
enemyVertical.userData.script.speed = 1;

world.add(enemyVertical);

  // Jogador
  const player = await criarSprite(
    'assets/Sprites/Player/Idle (1).png'
  );

  player.name = 'Player';
  player.userData.tag = 'player';
  player.scale.set(0.5, 0.5, 1);
  player.position.set(0, 0, 2);
  scene.add(player);

  addRigidbody(physics, player);
  player.userData.rigidBody.lockRotations(true, true);
  addBoxCollider(physics, player, 0.54, 0.83, -0.22, 0.02);

  // Moedas
  const coin1 = await createCoin(physics, 1.2, -2.2);
  const coin2 = await createCoin(physics, -7, 2.2);
  const coin3 = await createCoin(physics, 7, 2.2);

  world.add(coin1, coin2, coin3);

  // Checkpoint do jogador na plataforma da esquerda
  const checkpoint = await criarSprite(
    'assets/Sprites/Objects/SignArrow.png'
  );

  checkpoint.name = 'Checkpoint';
  checkpoint.userData.tag = 'checkpoint';
  checkpoint.position.set(-7, 1.9, 1);

  world.add(checkpoint);
  addCircleCollider(physics, checkpoint, true);

  // Limite invisível por baixo do mapa
  const limite = await criarSprite(
    'assets/Sprites/Objects/Crate.png'
  );

  limite.name = 'Limite';
  limite.userData.tag = 'limit';
  limite.position.set(0, -8, 0);

  const tamanhoLimite = new THREE.Box3()
    .setFromObject(limite)
    .getSize(new THREE.Vector3());

  limite.scale.set(
    40 / tamanhoLimite.x,
    1 / tamanhoLimite.y,
    1
  );

  world.add(limite);
  addBoxCollider(physics, limite);
  limite.visible = false;

  // Mostrar a hierarquia na consola
  function mostrarHierarquia(objeto, nivel = 0) {
    console.log(
      ' '.repeat(nivel) + (objeto.name || objeto.type)
    );

    for (const filho of objeto.children) {
      mostrarHierarquia(filho, nivel + 1);
    }
  }

  // Scripts
  const playerScript = new Player(player);
  const playerAnimator = new Animator(player, playerController);
  const gameManager = new GameManager();

  gameManager.pauseMenu = document.querySelector('#pauseMenu');

  const scripts = [
    new DebugFisica(scene, physics),
    playerScript,
    playerAnimator,
    new ScoreManager(document.querySelector('#scoreValue')),
    new MainCamera(camera, scene),
    gameManager,
    enemy1.userData.script,
    enemyVertical.userData.script,
  ];

  // Gestor das nuvens
  const level1Manager = new THREE.Group();
  level1Manager.name = 'Level1Manager';
  level1Manager.position.set(0, 3.5, 0);
  scene.add(level1Manager);

  const level1Script = new Level1Manager(
    level1Manager,
    scene,
    scripts,
    camera
  );

  level1Script.cloudPrefab1 = createCloud1;
  level1Script.cloudPrefab2 = createCloud2;
  level1Script.goodCloudPrefab = (x, y) =>
    createGoodCloud(physics, x, y);

  scripts.push(level1Script);

  // Inspector
  const gui = new GUI({ title: 'Inspector' });

  gui.add(playerScript, 'movementSpeed', 0, 10, 0.1);
  gui.add(playerScript, 'jumpPower', 0, 100, 1);
  gui.add(playerAnimator, 'currentState').listen();
  gui.add(
    playerAnimator.parameters,
    'speed',
    0,
    1,
    0.01
  ).listen();

  gui.add(gameManager, 'isPaused')
    .listen()
    .onChange((pausado) => {
      if (pausado) {
        gameManager.pauseGame();
      } else {
        gameManager.resumeGame();
      }
    });

  // Iniciar os scripts e esperar pela criação das nuvens
  for (const script of scripts) {
    await script.start?.();
  }

  mostrarHierarquia(scene);

  // Ciclo do jogo
  const FIXED_STEP = 1 / 50;
  physics.timestep = FIXED_STEP;

  let accumulator = 0;
  let previousTime = performance.now();

  renderer.setAnimationLoop((now) => {
    const dt =
      Math.min((now - previousTime) / 1000, 0.1) *
      Time.timeScale;

    previousTime = now;

    for (const script of scripts) {
      script.update?.(dt);
    }

    accumulator += dt;

    while (accumulator >= FIXED_STEP) {
      for (const script of scripts) {
        script.fixedUpdate?.(FIXED_STEP);
      }

      physics.step(events);
      handleCollisions(physics, events);

      accumulator -= FIXED_STEP;
    }

    syncPhysics(scene);

    for (const script of scripts) {
      script.lateUpdate?.();
    }

    renderer.render(scene, camera);
  });
}

iniciarJogo().catch((erro) => {
  console.error('Erro ao iniciar o jogo:', erro);
});