// ============================================================================
// CHAPTERS — Scroll-driven camera animation through 4 chapters
// ============================================================================

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export interface Chapter {
  name: string;
  cameraPosition: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const chapters: Chapter[] = [
  {
    name: 'Intro',
    cameraPosition: new THREE.Vector3(15, 5, 0),
    lookAt: new THREE.Vector3(9, 1, 0),
  },
  {
    name: 'Works',
    cameraPosition: new THREE.Vector3(6, 4, 0),
    lookAt: new THREE.Vector3(0.3, 1, 2),
  },
  {
    name: 'Labs',
    cameraPosition: new THREE.Vector3(6, 4, 0),
    lookAt: new THREE.Vector3(0.3, 1, -2),
  },
  {
    name: 'Contact',
    cameraPosition: new THREE.Vector3(0, 4, 0),
    lookAt: new THREE.Vector3(-6.2, 1.0, 0),
  },
];

let currentChapter = 0;
let chapterChangeCallbacks: Array<(index: number) => void> = [];
let scrollTriggerInstance: ScrollTrigger | null = null;

// Temporary vectors for interpolation
const tempPos = new THREE.Vector3();
const tempLook = new THREE.Vector3();

export function onChapterChange(cb: (index: number) => void): () => void {
  chapterChangeCallbacks.push(cb);
  return () => {
    chapterChangeCallbacks = chapterChangeCallbacks.filter(c => c !== cb);
  };
}

export function getCurrentChapter(): number {
  return currentChapter;
}

export function initScrollChapters(camera: THREE.PerspectiveCamera): void {
  const spacer = document.getElementById('scroll-spacer');
  if (!spacer) return;

  // Ensure body can scroll
  document.body.style.overflow = 'auto';
  document.body.style.height = 'auto';

  const totalChapters = chapters.length;

  // Create a GSAP ScrollTrigger that maps scroll to camera animation
  const proxy = { progress: 0 };

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: spacer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    onUpdate: (self) => {
      proxy.progress = self.progress;
      updateCamera(camera, proxy.progress, totalChapters);
    },
  });
}

function updateCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  totalChapters: number
): void {
  // Map progress (0-1) to chapter segments
  const chapterProgress = progress * (totalChapters - 1);
  const chapterIndex = Math.min(Math.floor(chapterProgress), totalChapters - 2);
  const t = chapterProgress - chapterIndex;

  const from = chapters[chapterIndex];
  const to = chapters[chapterIndex + 1];

  // Smooth interpolation with easing
  const easedT = smoothstep(t);

  // Interpolate camera position
  tempPos.lerpVectors(from.cameraPosition, to.cameraPosition, easedT);
  camera.position.copy(tempPos);

  // Interpolate lookAt target
  tempLook.lerpVectors(from.lookAt, to.lookAt, easedT);
  camera.lookAt(tempLook);

  // Determine active chapter (snaps at midpoint)
  const newChapter = Math.round(progress * (totalChapters - 1));
  if (newChapter !== currentChapter) {
    currentChapter = newChapter;
    for (const cb of chapterChangeCallbacks) {
      cb(currentChapter);
    }
    updateNavDots(currentChapter);
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function updateNavDots(index: number): void {
  const dots = document.querySelectorAll('#full-nav-dots .nav-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

export function scrollToChapter(index: number): void {
  const spacer = document.getElementById('scroll-spacer');
  if (!spacer) return;

  const totalHeight = spacer.scrollHeight - window.innerHeight;
  const targetScroll = (index / (chapters.length - 1)) * totalHeight;

  gsap.to(window, {
    scrollTo: { y: targetScroll },
    duration: 1.2,
    ease: 'power2.inOut',
  });
}

export function initNavDots(): void {
  const dotsContainer = document.getElementById('full-nav-dots');
  if (!dotsContainer) return;

  dotsContainer.querySelectorAll('.nav-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const chapter = parseInt(dot.getAttribute('data-chapter') || '0', 10);
      scrollToChapter(chapter);
    });
  });
}

export function disposeChapters(): void {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
  ScrollTrigger.getAll().forEach(t => t.kill());
  chapterChangeCallbacks = [];
  currentChapter = 0;
}
