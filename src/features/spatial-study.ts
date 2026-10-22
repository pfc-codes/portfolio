import type { Viewer } from "@mkkellogg/gaussian-splats-3d";
import type { OrthographicCamera, WebGLRenderer } from "three";

export function setupSpatialStudy() {
  const mount = document.querySelector<HTMLElement>("[data-splat-mount]")!;
  const cover = document.querySelector<HTMLElement>("[data-splat-cover]")!;
  const stage = document.querySelector<HTMLElement>("[data-splat-stage]")!;
  const load = document.querySelector<HTMLButtonElement>("[data-splat-load]")!;
  const controls = document.querySelector<HTMLElement>(
    "[data-splat-controls]",
  )!;
  const status = document.querySelector<HTMLElement>("[data-splat-status]")!;
  let viewer: Viewer | undefined;
  let renderer: WebGLRenderer | undefined;
  let resize: ResizeObserver | undefined;
  let ready = false;
  let visible = true;
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let initialZoom = 1;
  let cleanup: Promise<void> = Promise.resolve();
  const sync = () => {
    if (viewer && ready) {
      if (visible && !document.hidden) viewer.start();
      else viewer.stop();
    }
  };
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  });
  observer.observe(stage);
  document.addEventListener("visibilitychange", sync);
  load.hidden = false;

  function close(message: string, focus = false) {
    generation++;
    clearTimeout(timer);
    ready = false;
    const oldViewer = viewer;
    const oldRenderer = renderer;
    viewer = undefined;
    renderer = undefined;
    resize?.disconnect();
    oldViewer?.stop();
    controls.hidden = true;
    mount.tabIndex = -1;
    cover.hidden = false;
    load.disabled = true;
    status.textContent = message;
    cleanup = (async () => {
      try {
        await oldViewer?.dispose();
      } catch {
        /* A cancelled download rejects during disposal; resources below still release. */
      } finally {
        oldRenderer?.dispose();
        oldRenderer?.forceContextLoss();
        mount.replaceChildren();
        load.disabled = false;
        load.textContent = "Load the 3D scene ↗";
        if (focus) load.focus();
      }
    })();
  }

  load.addEventListener("click", async () => {
    load.disabled = true;
    await cleanup;
    load.disabled = true;
    const request = ++generation;
    status.textContent = "Preparing the 3D viewer…";
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2");
    if (!context) {
      close(
        "3D is unavailable on this device. You can still watch the films on the Work page.",
      );
      return;
    }
    context.getExtension("WEBGL_lose_context")?.loseContext();
    timer = setTimeout(
      () =>
        close(
          "The scene took too long to load. Try again on a faster connection, or explore the project films.",
        ),
      90000,
    );
    try {
      const {
        Viewer: SplatViewer,
        RenderMode,
        SceneRevealMode,
        WebGLRenderer: Renderer,
      } = await import("./splat-engine");
      if (request !== generation) return;
      // Own the renderer explicitly: the library's default dispose assumes its
      // root is a direct child of body. This viewer lives inside the About page.
      renderer = new Renderer({
        antialias: false,
        alpha: true,
        precision: "highp",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(0x000000, 1);
      mount.appendChild(renderer.domElement);
      viewer = new SplatViewer({
        rootElement: mount,
        renderer,
        cameraUp: [0, -1, 0],
        initialCameraPosition: [-0.06131, 0.18893, 1.09196],
        initialCameraLookAt: [0.21986, 0.23828, 4.30349],
        useBuiltInControls: true,
        selfDrivenMode: true,
        gpuAcceleratedSort: false,
        sharedMemoryForWorkers: false,
        renderMode: RenderMode.OnChange,
        sceneRevealMode: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? SceneRevealMode.Instant
          : SceneRevealMode.Gradual,
        sceneFadeInRateMultiplier: 0.5,
      });
      // Keep keyboard input scoped to the focused viewport, not the whole page.
      viewer.controls.stopListenToKeyEvents();
      viewer.setOrthographicMode(true);
      viewer.controls.stopListenToKeyEvents();
      if (viewer.keyDownListener)
        window.removeEventListener("keydown", viewer.keyDownListener);
      initialZoom = (viewer.camera as OrthographicCamera).zoom;
      resize = new ResizeObserver(() => {
        if (!renderer || !viewer) return;
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        viewer.forceRenderNextFrame();
      });
      resize.observe(mount);
      const thisViewer = viewer;
      renderer.domElement.addEventListener("webglcontextlost", () => {
        if (viewer === thisViewer)
          close(
            "The 3D connection was interrupted. Reload the scene, or explore the project films.",
          );
      });
      status.textContent = "Loading the scene…";
      await thisViewer.addSplatScene("/models/converted_file.ksplat", {
        showLoadingUI: false,
        splatAlphaRemovalThreshold: 5,
        scale: [1.3, 1.3, 1.3],
        position: [0, 0, 0],
        onProgress: (percent) => {
          if (request === generation)
            status.textContent = `Loading the scene… ${Math.min(100, Math.round(percent))}%`;
        },
      });
      if (request !== generation) return;
      clearTimeout(timer);
      thisViewer.getSplatMesh().setPointCloudModeEnabled(true);
      thisViewer.getSplatMesh().setSplatScale(2.2);
      ready = true;
      cover.hidden = true;
      controls.hidden = false;
      mount.tabIndex = 0;
      status.textContent =
        "Scene ready. Drag to rotate, pinch to zoom, or use the controls below.";
      sync();
      mount.focus({ preventScroll: true });
    } catch {
      if (request === generation)
        close(
          "The 3D scene could not load. Try again, or watch the films on the Work page.",
        );
    }
  });

  function orbit(direction: number) {
    if (!viewer || !ready) return;
    const offset = viewer.camera.position.clone().sub(viewer.controls.target);
    offset.applyAxisAngle(
      viewer.camera.up.clone().normalize(),
      (direction * Math.PI) / 12,
    );
    viewer.camera.position.copy(viewer.controls.target).add(offset);
    viewer.controls.update();
    viewer.forceRenderNextFrame();
  }
  function zoom(factor: number) {
    if (!viewer || !ready) return;
    const camera = viewer.camera as OrthographicCamera;
    camera.zoom = Math.max(
      initialZoom * 0.2,
      Math.min(initialZoom * 8, camera.zoom * factor),
    );
    camera.updateProjectionMatrix();
    viewer.forceRenderNextFrame();
  }
  document
    .querySelectorAll<HTMLButtonElement>("[data-orbit]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        orbit(button.dataset.orbit === "left" ? 1 : -1),
      ),
    );
  document
    .querySelectorAll<HTMLButtonElement>("[data-zoom]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        zoom(button.dataset.zoom === "in" ? 1.2 : 1 / 1.2),
      ),
    );
  mount.addEventListener("keydown", (event) => {
    if (!ready) return;
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
      ].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "ArrowLeft") orbit(1);
      else if (event.key === "ArrowRight") orbit(-1);
      else zoom(["ArrowUp", "+", "="].includes(event.key) ? 1.2 : 1 / 1.2);
    }
  });
  document
    .querySelector("[data-splat-reset]")!
    .addEventListener("click", () => {
      if (!viewer || !ready) return;
      viewer.camera.position.set(-0.06131, 0.18893, 1.09196);
      viewer.camera.up.set(0, -1, 0);
      viewer.controls.target.set(0.21986, 0.23828, 4.30349);
      const camera = viewer.camera as OrthographicCamera;
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      viewer.controls.update();
      viewer.forceRenderNextFrame();
    });
  document
    .querySelector("[data-splat-close]")!
    .addEventListener("click", () =>
      close("Scene closed. You can reopen it whenever you like.", true),
    );
  addEventListener("pagehide", () =>
    close("3D is optional. The scene stays unloaded until you open it."),
  );
}
