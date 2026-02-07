// ============================================================================
// LANDING SPLAT — Gaussian splat for the landing page
// ============================================================================

import { Viewer, SceneRevealMode } from '@mkkellogg/gaussian-splats-3d';

const SPLAT_PATH = '/models/phro-pfp.splat';

let viewer: Viewer | null = null;

export function initLandingSplat(container: HTMLElement): void {
  if (viewer) return; // already initialized

  viewer = new Viewer({
    cameraUp: [0, -1, 0],
    initialCameraPosition: [-0.06131, 0.18893, 1.09196],
    initialCameraLookAt: [0.21986, 0.23828, 4.30349],
    rootElement: container,
    useBuiltInControls: true,
    selfDrivenMode: true,
    gpuAcceleratedSort: false,
    sharedMemoryForWorkers: false,
    focalAdjustment: 1.0,
    sceneRevealMode: SceneRevealMode.Gradual,
    sceneFadeInRateMultiplier: 0.5,
  });

  viewer.setOrthographicMode(true);

  viewer.addSplatScene(SPLAT_PATH, {
    showLoadingUI: false,
    splatAlphaRemovalThreshold: 5,
    scale: [1.3, 1.3, 1.3],
    position: [0, 0, 0],
  }).then(() => {
    // Enable point cloud rendering + set splat scale
    const splatMesh = viewer?.getSplatMesh();
    if (splatMesh) {
      splatMesh.setPointCloudModeEnabled(true);
      splatMesh.setSplatScale(2.2);

      // Ease-in the reveal: start very slow, ramp up over ~3 seconds
      const startRate = 0.1;
      const endRate = 0.6;
      const rampDuration = 3000;
      const startTime = performance.now();
      splatMesh.sceneFadeInRateMultiplier = startRate;

      function rampReveal() {
        if (!splatMesh) return;
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / rampDuration, 1);
        // Ease-in curve (quadratic)
        const eased = t * t;
        splatMesh.sceneFadeInRateMultiplier = startRate + (endRate - startRate) * eased;
        if (t < 1) requestAnimationFrame(rampReveal);
      }
      requestAnimationFrame(rampReveal);
    }
    viewer?.start();
  }).catch((e: unknown) => {
    console.warn('Landing splat failed to load:', e);
  });
}

export function animateSplatDown(duration = 700): Promise<void> {
  return new Promise((resolve) => {
    if (!viewer) { resolve(); return; }

    const cam = viewer.camera;
    const controls = viewer.controls;
    const startPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
    const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
    const endPos = { x: 0.16123, y: 4.57690, z: 1.00505 };
    const endTarget = { x: 0.44240, y: 4.62625, z: 4.21658 };
    const startTime = performance.now();

    controls.enabled = false;

    function tick() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      cam.position.x = startPos.x + (endPos.x - startPos.x) * eased;
      cam.position.y = startPos.y + (endPos.y - startPos.y) * eased;
      cam.position.z = startPos.z + (endPos.z - startPos.z) * eased;
      controls.target.x = startTarget.x + (endTarget.x - startTarget.x) * eased;
      controls.target.y = startTarget.y + (endTarget.y - startTarget.y) * eased;
      controls.target.z = startTarget.z + (endTarget.z - startTarget.z) * eased;
      controls.update();

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

export function disposeLandingSplat(): void {
  if (viewer) {
    viewer.dispose();
    viewer = null;
  }
}
