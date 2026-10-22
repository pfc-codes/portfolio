// A narrow export surface lets Vite discard unused Three.js and splat APIs.
// This module is requested only after the visitor activates the 3D viewer.
export {
  Viewer,
  RenderMode,
  SceneRevealMode,
} from "@mkkellogg/gaussian-splats-3d";
export { WebGLRenderer } from "three";
