import { DITHER, whitePoint } from "./dither";

type Tile = {
  el: HTMLElement;
  poster: HTMLImageElement;
  source: HTMLImageElement;
  video?: HTMLVideoElement;
  texture?: WebGLTexture;
  visible: boolean;
  hovered: boolean;
  entered: boolean;
  progress: number;
  target: number;
  white: number;
  measured: number;
  uploaded: boolean;
  frameTime: number;
  hero: boolean;
  released: boolean;
  failed: boolean;
};
interface HandoffDetail {
  canvas: HTMLCanvasElement;
  crop: number[];
  drawn: number[];
  complete: () => void;
  deadline: number;
}

/** All media tiles share this ONE WebGL2 canvas. The optional 3D viewer is separate. */
export function setupMedia() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "dither-overlay";
  canvas.setAttribute("aria-hidden", "true");
  let gl = reduce.matches
    ? null
    : canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
      });
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = 96;
  const sampleContext = sample.getContext("2d", { willReadFrequently: true });
  let paused = false,
    handingOff = false,
    raf = 0,
    last = 0,
    lost = false;
  let program: WebGLProgram | undefined;
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const tiles: Tile[] = Array.from(
    document.querySelectorAll<HTMLElement>("[data-dither]"),
  ).map((el) => {
    const poster = el.querySelector<HTMLImageElement>(".dither-poster")!;
    const source = new Image();
    source.decoding = "async";
    return {
      el,
      poster,
      source,
      video: el.querySelector<HTMLVideoElement>("video") || undefined,
      visible: false,
      hovered: false,
      entered: false,
      progress: 0,
      target: 0,
      white: 255,
      measured: 0,
      uploaded: false,
      frameTime: NaN,
      hero: el.hasAttribute("data-hero"),
      released: !document.documentElement.classList.contains("pcl-on"),
      failed: false,
    };
  });
  const hero = tiles.find((t) => t.hero);
  const playButton =
    document.querySelector<HTMLButtonElement>("[data-hero-play]");
  const motionButton = document.querySelector<HTMLButtonElement>(
    "[data-motion-toggle]",
  );

  const shader = (type: number, source: string) => {
    const sh = gl!.createShader(type)!;
    gl!.shaderSource(sh, source);
    gl!.compileShader(sh);
    if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(sh) || "Shader compilation failed");
    return sh;
  };
  try {
    if (gl) {
      const vertex = shader(
        gl.VERTEX_SHADER,
        `#version 300 es
        in vec2 position; out vec2 uv;
        void main(){gl_Position=vec4(position,0.,1.);uv=vec2(position.x*.5+.5,.5-position.y*.5);}`,
      );
      const fragment = shader(
        gl.FRAGMENT_SHADER,
        `#version 300 es
        precision highp float;
        in vec2 uv; out vec4 color; uniform sampler2D frame;
        uniform vec2 boxSize,imageSize,focus; uniform float cover,progress,white;
        const float bayer[16]=float[16](${DITHER.matrix.map((n) => `${n}.`).join(",")});
        void main(){
          vec2 ratio=boxSize/imageSize;
          float scale=cover>.5?max(ratio.x,ratio.y):min(ratio.x,ratio.y);
          vec2 size=imageSize*scale;
          vec2 st=(uv*boxSize-(boxSize-size)*focus)/size;
          if(any(lessThan(st,vec2(0.)))||any(greaterThan(st,vec2(1.)))){color=vec4(0.,0.,0.,1.);return;}
          vec3 source=texture(frame,st).rgb;
          ivec2 pixel=ivec2(floor(st*imageSize));
          float threshold=(bayer[(pixel.y&3)*4+(pixel.x&3)]+.5)/16.;
          float luminance=pow(min(1.,dot(source,vec3(${DITHER.weights.join(",")}))*255./white),${DITHER.gamma});
          vec3 ink=vec3(${DITHER.ink.map((n) => (n / 255).toFixed(8)).join(",")});
          vec3 paper=vec3(${DITHER.bg.join(",")});
          color=vec4(progress>threshold?source:(luminance>threshold?ink:paper),1.);
        }`,
      );
      program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Media shader linking failed");
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const name of [
        "frame",
        "boxSize",
        "imageSize",
        "focus",
        "cover",
        "progress",
        "white",
      ])
        uniforms[name] = gl.getUniformLocation(program, name);
      gl.uniform1i(uniforms.frame, 0);
      gl.enable(gl.SCISSOR_TEST);
      document.body.appendChild(canvas);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn("Dither renderer:", error);
    gl = null;
    canvas.remove();
  }
  document.documentElement.dataset.reducedMotion = String(reduce.matches);
  document.documentElement.dataset.mediaRenderer = gl ? "webgl2" : "poster";

  function wake() {
    if (!raf && gl && !lost && !document.hidden && !reduce.matches)
      raf = requestAnimationFrame(draw);
  }
  function load(tile: Tile) {
    if (!tile.source.src) {
      tile.source.onload = () => {
        tile.uploaded = false;
        wake();
      };
      tile.source.src = tile.poster.dataset.cleanSrc!;
    }
    if (tile.video && !tile.video.src && !reduce.matches && gl) {
      // No source is fetched until visible. The hero holds the intro frame paused.
      tile.video.autoplay = false;
      tile.video.muted = true;
      if (tile.hero) {
        tile.video.addEventListener("loadedmetadata", () => {
          tile.video!.currentTime = DITHER.heroTime;
        }, { once: true });
      }
      tile.video.src = tile.video.dataset.src!;
      tile.video.preload = "auto";
      tile.video.load();
    }
  }
  function sync() {
    for (const tile of tiles) {
      if (!tile.video || tile.el.dataset.native) continue;
      const shouldPlay =
        !!gl &&
        !lost &&
        tile.visible &&
        !reduce.matches &&
        !paused &&
        !document.hidden &&
        (!tile.hero || (tile.released && tile.progress >= 1));
      if (shouldPlay) {
        if (tile.video.paused && tile.video.readyState >= 2)
          void tile.video.play().catch(() => {
            if (tile.hero && playButton) playButton.hidden = false;
          });
      } else tile.video.pause();
    }
    if (motionButton) {
      motionButton.hidden = reduce.matches || !gl;
      motionButton.textContent = paused ? "Resume motion" : "Pause motion";
      motionButton.setAttribute("aria-pressed", String(paused));
    }
    if (playButton && (reduce.matches || !gl)) playButton.hidden = false;
    wake();
  }
  function setTarget(tile: Tile, value: number) {
    tile.target = value;
    if (paused) tile.progress = value;
    wake();
  }
  function measure(tile: Tile, source: TexImageSource) {
    if (!sampleContext) return;
    try {
      sampleContext.drawImage(source as CanvasImageSource, 0, 0, 96, 96);
      tile.white = whitePoint(sampleContext.getImageData(0, 0, 96, 96).data);
    } catch {
      /* Keep the last valid tone map if a source cannot be sampled. */
    }
  }
  function draw(now: number) {
    raf = 0;
    if (!gl || !program || lost || document.hidden || reduce.matches) return;
    // Films are 24/25 fps; cap the shared compositor at 30 fps.
    if (last && now - last < 30) {
      wake();
      return;
    }
    const dt = Math.min(50, last ? now - last : 16);
    last = now;
    const dpr = Math.min(devicePixelRatio, 1.5);
    const w = Math.round(innerWidth * dpr),
      h = Math.round(innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.scissor(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let moving = false;
    for (const tile of tiles) {
      if (
        !tile.visible ||
        (tile.hero && handingOff) ||
        tile.failed ||
        tile.el.dataset.native ||
        !tile.el.isConnected ||
        tile.el.closest("[hidden]")
      )
        continue;
      const rect = tile.el.getBoundingClientRect();
      if (
        !rect.width ||
        !rect.height ||
        rect.bottom <= 0 ||
        rect.top >= innerHeight
      )
        continue;
      const playing =
        !!tile.video && tile.video.readyState >= 2 && !tile.video.paused;
      const useVideo =
        !!tile.video &&
        tile.video.readyState >= 2 &&
        (!tile.hero || tile.released);
      const source = useVideo ? tile.video! : tile.source;
      const sw =
        source instanceof HTMLVideoElement
          ? source.videoWidth
          : source.naturalWidth;
      const sh =
        source instanceof HTMLVideoElement
          ? source.videoHeight
          : source.naturalHeight;
      if (!sw || !sh) continue;
      const before = tile.progress;
      tile.progress +=
        Math.sign(tile.target - tile.progress) *
        Math.min(Math.abs(tile.target - tile.progress), dt / 520);
      moving ||= tile.progress !== tile.target || playing;
      try {
        if (!tile.texture) {
          tile.texture = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, tile.texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else gl.bindTexture(gl.TEXTURE_2D, tile.texture);
        const frameTime = useVideo ? tile.video!.currentTime : -1;
        if (frameTime !== tile.frameTime || !tile.uploaded) {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            source,
          );
          tile.uploaded = true;
          tile.frameTime = frameTime;
        }
        if (!tile.measured || (playing && now - tile.measured > 750)) {
          measure(tile, source);
          tile.measured = now;
        }
        const css = getComputedStyle(tile.poster);
        const pos = css.objectPosition.split(" ").map(parseFloat);
        gl.viewport(
          Math.round(rect.left * dpr),
          Math.round((innerHeight - rect.bottom) * dpr),
          Math.round(rect.width * dpr),
          Math.round(rect.height * dpr),
        );
        const left = Math.max(0, Math.round(rect.left * dpr)),
          bottom = Math.max(0, Math.round((innerHeight - rect.bottom) * dpr));
        gl.scissor(
          left,
          bottom,
          Math.max(0, Math.min(w, Math.round(rect.right * dpr)) - left),
          Math.max(
            0,
            Math.min(h, Math.round((innerHeight - rect.top) * dpr)) - bottom,
          ),
        );
        gl.uniform2f(uniforms.boxSize, rect.width, rect.height);
        gl.uniform2f(uniforms.imageSize, sw, sh);
        gl.uniform2f(uniforms.focus, (pos[0] || 0) / 100, (pos[1] || 0) / 100);
        gl.uniform1f(uniforms.cover, css.objectFit === "cover" ? 1 : 0);
        gl.uniform1f(uniforms.progress, tile.progress);
        gl.uniform1f(uniforms.white, tile.white);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        tile.el.dataset.live = "true";
        if (tile.hero && before < 1 && tile.progress === 1) sync();
      } catch {
        tile.failed = true;
        tile.el.dataset.failed = "true";
        tile.video?.pause();
        delete tile.el.dataset.live;
      }
    }
    if (moving) wake();
  }

  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        const tile = tiles.find((t) => t.el === change.target)!;
        tile.visible = change.isIntersecting;
        if (tile.visible) {
          load(tile);
          if (!tile.entered && !tile.hero) {
            tile.entered = true;
            setTarget(tile, 1);
            setTimeout(() => {
              if (!tile.hovered) setTarget(tile, 0);
            }, 1050);
          }
        }
      }
      sync();
    },
    { threshold: 0.01 },
  );
  for (const tile of tiles) {
    observer.observe(tile.el);
    const control =
      tile.el.closest("a,figure,.youtube-facade,.splat-cover") || tile.el;
    const enter = () => {
      tile.hovered = true;
      if (!tile.hero) setTarget(tile, 1);
    };
    const leave = () => {
      tile.hovered = false;
      if (!tile.hero) setTarget(tile, 0);
    };
    control.addEventListener("pointerenter", enter);
    control.addEventListener("pointerleave", leave);
    control.addEventListener("focusin", enter);
    control.addEventListener("focusout", (event) => {
      if (!control.contains((event as FocusEvent).relatedTarget as Node))
        leave();
    });
    tile.video?.addEventListener("canplay", () => {
      if (tile.hero && tile.released) setTarget(tile, 1);
      sync();
    });
    tile.video?.addEventListener("error", () => {
      if (tile.hero && playButton) playButton.hidden = false;
    });
    if (tile.hero) load(tile);
  }
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    canvas.hidden = true;
    tiles.forEach((t) => {
      delete t.el.dataset.live;
      t.video?.pause();
    });
    if (playButton) playButton.hidden = false;
  });
  motionButton?.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  playButton?.addEventListener("click", () => {
    if (!hero?.video) return;
    hero.el.dataset.native = "true";
    hero.released = true;
    hero.video.src ||= hero.video.dataset.src!;
    hero.video.controls = true;
    hero.video.removeAttribute("aria-hidden");
    hero.video.tabIndex = 0;
    hero.video.loop = false;
    void hero.video.play().catch(() => {});
    playButton.hidden = true;
    wake();
    hero.video.focus();
  });
  reduce.addEventListener("change", () => {
    canvas.hidden = reduce.matches;
    if (reduce.matches)
      tiles.forEach((t) => {
        t.video?.pause();
        t.video?.removeAttribute("autoplay");
      });
    else tiles.filter((t) => t.visible).forEach(load);
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  addEventListener("resize", wake);
  addEventListener("scroll", wake, { passive: true });
  addEventListener("pageshow", sync);
  addEventListener("pagehide", () => {
    cancelAnimationFrame(raf);
    raf = 0;
    tiles.forEach((t) => t.video?.pause());
  });
  addEventListener("pcl:done", () => {
    if (!hero) return;
    handingOff = false;
    hero.el.style.removeProperty("visibility");
    hero.released = true;
    if (hero.video && hero.video.readyState >= 2) setTarget(hero, 1);
    sync();
  });

  addEventListener("pcl:handoff", (event) => {
    if (!hero?.video || !gl || lost || reduce.matches) return;
    event.preventDefault();
    const detail = (event as CustomEvent<HandoffDetail>).detail;
    const video = hero.video;
    let started = false;
    const begin = async () => {
      if (started || !document.documentElement.classList.contains("pcl-on"))
        return;
      started = true;
      video.removeEventListener("canplay", begin);
      if (performance.now() + 1200 > detail.deadline) {
        detail.complete();
        return;
      }
      video.pause();
      const old = detail.canvas.getBoundingClientRect();
      const box = hero.el.getBoundingClientRect();
      const css = getComputedStyle(hero.poster);
      const fit = css.objectFit === "cover" ? Math.max : Math.min;
      const scale = fit(
        box.width / video.videoWidth,
        box.height / video.videoHeight,
      );
      const pos = css.objectPosition.split(" ").map(parseFloat);
      const [x, y, cw] = detail.crop,
        [dx, dy, dw] = detail.drawn;
      const unit = (cw * scale) / dw;
      const left =
        box.left +
        ((box.width - video.videoWidth * scale) * pos[0]) / 100 +
        x * scale -
        dx * unit;
      const top =
        box.top +
        ((box.height - video.videoHeight * scale) * pos[1]) / 100 +
        y * scale -
        dy * unit;
      const width = detail.canvas.width * unit,
        height = detail.canvas.height * unit;
      Object.assign(detail.canvas.style, {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transformOrigin: "0 0",
        outline: "none",
      });
      // The moving loader is the only copy of the subject during the flight.
      // Reveal the matching hero frame only once it reaches its destination.
      handingOff = true;
      hero.el.style.visibility = "hidden";
      wake();
      document.documentElement.classList.remove("pcl-on");
      document.querySelector("#pcl")?.classList.add("pcl-flight");
      const [, , drawWidth, drawHeight] = detail.drawn;
      const clip = `inset(${dy * unit}px ${(detail.canvas.width - dx - drawWidth) * unit}px ${(detail.canvas.height - dy - drawHeight) * unit}px ${dx * unit}px)`;
      const animation = detail.canvas.animate(
        [
          {
            transform: `translate(${old.left - left}px,${old.top - top}px) scale(${old.width / width},${old.height / height})`,
            clipPath: "inset(0px)",
          },
          { transform: "translate(0px,0px) scale(1)", clipPath: clip },
        ],
        {
          duration: 620,
          easing: "cubic-bezier(.22,.68,0,1)",
          fill: "forwards",
        },
      );
      try {
        await animation.finished;
      } catch {
        detail.complete();
        return;
      }
      handingOff = false;
      hero.el.style.removeProperty("visibility");
      hero.released = true;
      hero.progress = 0;
      setTarget(hero, 1);
      detail.canvas.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 180,
        fill: "forwards",
      });
      setTimeout(detail.complete, 550);
    };
    if (video.readyState >= 3) void begin();
    else video.addEventListener("canplay", begin, { once: true });
  });
  if (reduce.matches)
    tiles.forEach((t) => t.video?.removeAttribute("autoplay"));
  sync();
}
