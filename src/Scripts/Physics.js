import * as THREE from 'three';
import RAPIER from '@dimforge/rapier2d-compat';

// Para cada collider, guarda o objeto do Three.js a que pertence.
const objectsByCollider = new Map();

function registerCollider(physics, object, collider) {
  object.userData.collider = collider;
  object.userData.physics = physics;

  objectsByCollider.set(collider.handle, object);
}

// Adiciona um Rigidbody (corpo dinâmico) ao objeto.
export function addRigidbody(physics, object, mass = 1) {
  const desc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(object.position.x, object.position.y)
    .setAdditionalMass(mass);

  const body = physics.createRigidBody(desc);

  object.userData.rigidBody = body;

  return body;
}
export function addKinematicRigidbody(physics, object) {
  const desc = RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(object.position.x, object.position.y);

  const body = physics.createRigidBody(desc);
  object.userData.rigidBody = body;

  return body;
}

// Adiciona um Box Collider (caixa de colisão) ao objeto.
// fitX / fitY: percentagem da imagem que a caixa ocupa.
// offsetX / offsetY: deslocamento em percentagem da largura/altura.
export function addBoxCollider(
  physics,
  object,
  fitX = 1,
  fitY = 1,
  offsetX = 0,
  offsetY = 0
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const dx = size.x * offsetX;
  const dy = size.y * offsetY;

  const desc = RAPIER.ColliderDesc.cuboid(
    (size.x / 2) * fitX,
    (size.y / 2) * fitY
  ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

  const body = object.userData.rigidBody;

  let collider;

  if (body) {
    // Posição relativa ao corpo.
    desc.setTranslation(dx, dy);
    collider = physics.createCollider(desc, body);
  } else {
    // Collider estático, no centro do objeto.
    desc.setTranslation(center.x + dx, center.y + dy);
    collider = physics.createCollider(desc);
  }

  registerCollider(physics, object, collider);

  return collider;
}

// Adiciona um Circle Collider fixo ao objeto.
// isTrigger: true = sensor, deteta o toque sem bloquear.
export function addCircleCollider(
  physics,
  object,
  isTrigger = false
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const desc = RAPIER.ColliderDesc.ball(size.x / 2)
    .setTranslation(center.x, center.y)
    .setSensor(isTrigger)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

  const collider = physics.createCollider(desc);

  registerCollider(physics, object, collider);

  return collider;
}

// Lê os eventos de colisão e avisa os scripts envolvidos.
export function handleCollisions(physics, events) {
  events.drainCollisionEvents((handle1, handle2, started) => {
    if (!started) return;

    const collider1 = physics.getCollider(handle1);
    const collider2 = physics.getCollider(handle2);

    const object1 = objectsByCollider.get(handle1);
    const object2 = objectsByCollider.get(handle2);

    if (!collider1 || !collider2 || !object1 || !object2) {
      return;
    }

    if (collider1.isSensor() || collider2.isSensor()) {
      object1.userData.script?.onTriggerEnter?.(object2);
      object2.userData.script?.onTriggerEnter?.(object1);
    } else {
      object1.userData.script?.onCollisionEnter?.(object2);
      object2.userData.script?.onCollisionEnter?.(object1);
    }
  });
}

// Remove o collider da física e o objeto da cena.
export function destroyObject(object) {
  const collider = object.userData.collider;

  if (collider) {
    objectsByCollider.delete(collider.handle);
    object.userData.physics.removeCollider(collider, false);
    object.userData.collider = null;
  }

  const body = object.userData.rigidBody;

  if (body) {
    object.userData.physics.removeRigidBody(body);
    object.userData.rigidBody = null;
  }

  object.removeFromParent();
}
// Copia a posição/rotação dos corpos físicos para os objetos gráficos.
export function raycast(physics, origin, direction, distance) {
  const ray = new RAPIER.Ray(
    { x: origin.x, y: origin.y },
    { x: direction.x, y: direction.y }
  );

  const hit = physics.castRay(ray, distance, true);

  if (!hit) return null;

  return objectsByCollider.get(hit.collider.handle) ?? null;
}

export function syncPhysics(scene) {
  scene.traverse((object) => {
    const body = object.userData.rigidBody;

    if (body) {
      const pos = body.translation();

      object.position.x = pos.x;
      object.position.y = pos.y;
      object.rotation.z = body.rotation();
    }
  });
}