// ============================================================================
// LOADER — Load GLB model and Gaussian splat assets
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DropInViewer } from '@mkkellogg/gaussian-splats-3d';

export interface LoadedAssets {
  glbScene: THREE.Group;
  splatGroup: THREE.Group;
}

const GLB_PATH = '/models/gallery-objects.glb';
const SPLAT_PATH = '/models/phro-pfp.splat';

export async function loadAssets(
  scene: THREE.Scene,
  onProgress?: (progress: number) => void
): Promise<LoadedAssets> {
  let glbProgress = 0;
  let splatDone = false;

  function reportProgress(): void {
    // GLB is ~60% of total, splat is ~40%
    const total = glbProgress * 0.6 + (splatDone ? 1 : 0) * 0.4;
    onProgress?.(Math.min(total, 1));
  }

  // Load GLB model
  const gltfLoader = new GLTFLoader();
  const gltf = await new Promise<THREE.Group>((resolve, reject) => {
    gltfLoader.load(
      GLB_PATH,
      (gltf) => {
        glbProgress = 1;
        reportProgress();
        resolve(gltf.scene);
      },
      (event) => {
        if (event.lengthComputable) {
          glbProgress = event.loaded / event.total;
          reportProgress();
        }
      },
      (error) => reject(error)
    );
  });

  scene.add(gltf);

  // Load Gaussian splat
  const splatGroup = new DropInViewer({
    gpuAcceleratedSort: false,
    sharedMemoryForWorkers: false,
  }) as unknown as THREE.Group;

  // Position the splat at the Intro chapter location
  splatGroup.position.set(9, 1, 0);

  scene.add(splatGroup);

  try {
    await (splatGroup as any).addSplatScene(SPLAT_PATH, {
      showLoadingUI: false,
      splatAlphaRemovalThreshold: 5,
      position: [0, 0, 0],
      scale: [2.5, 2.5, 2.5],
    });
  } catch (e) {
    console.warn('Gaussian splat failed to load, continuing without it:', e);
  }

  splatDone = true;
  reportProgress();

  return { glbScene: gltf, splatGroup };
}
