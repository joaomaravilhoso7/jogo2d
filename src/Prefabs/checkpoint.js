import * as THREE from 'three';

export function createCheckpoint(name, x, y) {
  const checkpoint = new THREE.Mesh(
    new THREE.CircleGeometry(0.1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  checkpoint.name = name;
  checkpoint.position.set(x, y, 1);

  return checkpoint;
}