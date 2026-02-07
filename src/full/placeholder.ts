// ============================================================================
// PLACEHOLDER — Temporary geometry for the 3D scene (until GLB is ready)
// ============================================================================

import * as THREE from 'three';

export function createPlaceholderScene(scene: THREE.Scene): void {
  // Ground grid
  const grid = new THREE.GridHelper(40, 40, 0x222222, 0x111111);
  grid.position.y = 0;
  scene.add(grid);

  // Wireframe cubes scattered around as stand-ins for gallery objects
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    wireframe: true,
  });

  // Intro area — tall column
  const introGeo = new THREE.BoxGeometry(1.5, 3, 1.5);
  const introMesh = new THREE.Mesh(introGeo, wireframeMaterial);
  introMesh.position.set(9, 1.5, 0);
  scene.add(introMesh);

  // Works area — floating shapes representing projects
  const projectPositions = [
    [1.5, 1.5, 2.5],
    [0.3, 2.5, 3.5],
    [-0.5, 1, 1.5],
    [1, 0.8, 4],
    [-1, 2, 3],
  ];

  projectPositions.forEach(([x, y, z], i) => {
    const size = 0.4 + Math.random() * 0.4;
    const geo = i % 2 === 0
      ? new THREE.IcosahedronGeometry(size, 0)
      : new THREE.OctahedronGeometry(size, 0);
    const mesh = new THREE.Mesh(geo, wireframeMaterial.clone());
    mesh.position.set(x, y, z);
    mesh.name = `project_p0${i + 1}`;
    scene.add(mesh);
  });

  // Labs area — wireframe shapes
  const labPositions = [
    [1.5, 1.5, -2.5],
    [0, 2, -3],
    [-1, 1, -1.5],
  ];

  labPositions.forEach(([x, y, z], i) => {
    const geo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const mesh = new THREE.Mesh(geo, wireframeMaterial.clone());
    mesh.position.set(x, y, z);
    mesh.name = `specimen_e0${i + 1}`;
    scene.add(mesh);
  });

  // Contact area — terminal-like box
  const termGeo = new THREE.BoxGeometry(2, 1.5, 0.5);
  const termMesh = new THREE.Mesh(termGeo, wireframeMaterial);
  termMesh.position.set(-6.2, 1, 0);
  scene.add(termMesh);

  // Ambient floating particles
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }

  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: 0x444444,
    size: 0.03,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);
}
