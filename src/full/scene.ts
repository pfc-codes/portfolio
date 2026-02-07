// ============================================================================
// SCENE — Three.js scene, renderer, camera, lighting, render loop
// ============================================================================

import * as THREE from 'three';

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let animationId: number | null = null;
let renderCallbacks: Array<() => void> = [];

export function initScene(): {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
} {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;
  if (!canvas) throw new Error('#webgl canvas not found');

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(15, 5, 0);
  camera.lookAt(9, 1, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Resize handler
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera };
}

function onResize(): void {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function addRenderCallback(cb: () => void): void {
  renderCallbacks.push(cb);
}

export function removeRenderCallback(cb: () => void): void {
  renderCallbacks = renderCallbacks.filter(c => c !== cb);
}

export function startRenderLoop(): void {
  if (animationId !== null) return;

  function loop(): void {
    if (!renderer || !scene || !camera) return;

    for (const cb of renderCallbacks) {
      cb();
    }

    renderer.render(scene, camera);
    animationId = requestAnimationFrame(loop);
  }

  loop();
}

export function stopRenderLoop(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

export function getCamera(): THREE.PerspectiveCamera | null {
  return camera;
}

export function getScene(): THREE.Scene | null {
  return scene;
}

export function getRenderer(): THREE.WebGLRenderer | null {
  return renderer;
}

export function disposeScene(): void {
  stopRenderLoop();
  renderCallbacks = [];
  window.removeEventListener('resize', onResize);

  if (scene) {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else if (object.material) {
          object.material.dispose();
        }
      }
    });
    scene.clear();
    scene = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  camera = null;
}
