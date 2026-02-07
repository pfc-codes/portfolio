// ============================================================================
// SCENE OBJECTS — Parse loaded GLB for interactive objects
// ============================================================================

import * as THREE from 'three';
import { registerInteractiveObject, clearInteractiveObjects } from './interactions';

// Expected naming convention in GLB:
// Project objects: "project_p01", "project_p02", etc.
// Specimen objects: "specimen_e01", "specimen_e02", etc.
// If your GLB uses different names, update the prefixes here.

const PROJECT_PREFIX = 'project_';
const SPECIMEN_PREFIX = 'specimen_';

export function setupSceneInteractives(glbScene: THREE.Group): void {
  clearInteractiveObjects();

  glbScene.traverse((child) => {
    const name = child.name.toLowerCase();

    if (name.startsWith(PROJECT_PREFIX)) {
      const id = name.replace(PROJECT_PREFIX, '');
      registerInteractiveObject(child, 'project', id);
    } else if (name.startsWith(SPECIMEN_PREFIX)) {
      const id = name.replace(SPECIMEN_PREFIX, '');
      registerInteractiveObject(child, 'specimen', id);
    }
  });
}
