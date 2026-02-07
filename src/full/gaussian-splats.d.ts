declare module '@mkkellogg/gaussian-splats-3d' {
  import * as THREE from 'three';

  interface SplatSceneOptions {
    showLoadingUI?: boolean;
    splatAlphaRemovalThreshold?: number;
    position?: number[];
    rotation?: number[];
    scale?: number[];
    progressiveLoad?: boolean;
    onProgress?: (percent: number) => void;
  }

  interface ViewerOptions {
    gpuAcceleratedSort?: boolean;
    sharedMemoryForWorkers?: boolean;
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    rootElement?: HTMLElement | null;
    dropInMode?: boolean;
    camera?: THREE.Camera;
    renderer?: THREE.WebGLRenderer;
    threeScene?: THREE.Scene;
    cameraUp?: number[];
    initialCameraPosition?: number[];
    initialCameraLookAt?: number[];
    dynamicScene?: boolean;
    sphericalHarmonicsDegree?: number;
    antialiased?: boolean;
    focalAdjustment?: number;
    logLevel?: number;
    renderMode?: number;
    sceneRevealMode?: number;
    sceneFadeInRateMultiplier?: number;
    ignoreDevicePixelRatio?: boolean;
    freeIntermediateSplatData?: boolean;
    inMemoryCompressionLevel?: number;
    integerBasedSort?: boolean;
    enableSIMDInSort?: boolean;
    halfPrecisionCovariancesOnGPU?: boolean;
    enableOptionalEffects?: boolean;
  }

  export class DropInViewer extends THREE.Group {
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    addSplatScenes(sceneOptions: Array<SplatSceneOptions & { path: string }>, showLoadingUI?: boolean): Promise<void>;
    getSplatScene(sceneIndex: number): unknown;
    removeSplatScene(index: number, showLoadingUI?: boolean): Promise<void>;
    removeSplatScenes(indexes: number[], showLoadingUI?: boolean): Promise<void>;
    getSceneCount(): number;
    dispose(): Promise<void>;
  }

  export interface SplatMesh {
    setPointCloudModeEnabled(enabled: boolean): void;
    getPointCloudModeEnabled(): boolean;
    setSplatScale(scale: number): void;
    getSplatScale(): number;
    sceneFadeInRateMultiplier: number;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    start(): void;
    stop(): void;
    dispose(): Promise<void>;
    getSplatMesh(): SplatMesh;
    setOrthographicMode(orthographic: boolean): void;
    camera: THREE.Camera;
    controls: {
      target: THREE.Vector3;
      enabled: boolean;
      update(): void;
    };
  }

  export const SceneRevealMode: Record<string, number>;
  export const LogLevel: Record<string, number>;
  export const RenderMode: Record<string, number>;
}
