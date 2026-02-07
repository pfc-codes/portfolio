// ============================================================================
// INTERACTIONS — Raycasting for 3D object clicks (projects, specimens)
// ============================================================================

import * as THREE from 'three';
import { showWorksDetail, showSpecimenDetail } from './overlays';
import { getCurrentChapter } from './chapters';

let raycaster: THREE.Raycaster | null = null;
let mouse: THREE.Vector2 | null = null;
let canvas: HTMLCanvasElement | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let interactiveObjects: THREE.Object3D[] = [];
let onClickHandler: ((e: MouseEvent) => void) | null = null;
let onMoveHandler: ((e: MouseEvent) => void) | null = null;

export interface InteractiveObject {
  mesh: THREE.Object3D;
  type: 'project' | 'specimen';
  id: string;
}

const interactiveMap = new Map<THREE.Object3D, InteractiveObject>();

export function initInteractions(
  cam: THREE.PerspectiveCamera,
  canvasEl: HTMLCanvasElement
): void {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  camera = cam;
  canvas = canvasEl;

  onClickHandler = (e: MouseEvent) => handleClick(e);
  onMoveHandler = (e: MouseEvent) => handleMouseMove(e);

  canvas.addEventListener('click', onClickHandler);
  canvas.addEventListener('mousemove', onMoveHandler);
}

export function registerInteractiveObject(
  mesh: THREE.Object3D,
  type: 'project' | 'specimen',
  id: string
): void {
  interactiveObjects.push(mesh);
  interactiveMap.set(mesh, { mesh, type, id });
}

export function clearInteractiveObjects(): void {
  interactiveObjects = [];
  interactiveMap.clear();
}

function updateMouse(e: MouseEvent): void {
  if (!mouse || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function getIntersected(): InteractiveObject | null {
  if (!raycaster || !mouse || !camera || interactiveObjects.length === 0) return null;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length === 0) return null;

  // Walk up the parent chain to find a registered object
  let obj: THREE.Object3D | null = intersects[0].object;
  while (obj) {
    const data = interactiveMap.get(obj);
    if (data) return data;
    obj = obj.parent;
  }

  return null;
}

function handleClick(e: MouseEvent): void {
  updateMouse(e);
  const hit = getIntersected();
  if (!hit) return;

  const chapter = getCurrentChapter();

  if (hit.type === 'project' && chapter === 1) {
    showWorksDetail(hit.id);
  } else if (hit.type === 'specimen' && chapter === 2) {
    showSpecimenDetail(hit.id);
  }
}

function handleMouseMove(e: MouseEvent): void {
  updateMouse(e);
  const hit = getIntersected();

  if (canvas) {
    canvas.style.cursor = hit ? 'pointer' : 'default';
  }
}

export function disposeInteractions(): void {
  if (canvas && onClickHandler) {
    canvas.removeEventListener('click', onClickHandler);
  }
  if (canvas && onMoveHandler) {
    canvas.removeEventListener('mousemove', onMoveHandler);
  }

  raycaster = null;
  mouse = null;
  camera = null;
  canvas = null;
  onClickHandler = null;
  onMoveHandler = null;
  interactiveObjects = [];
  interactiveMap.clear();
}
