import "./styles/atlas.css";

async function init() {
  // Production pages are rendered at build time. Development uses the exact
  // same renderer; no client router is needed for normal links or deep URLs.
  if (import.meta.env.DEV) {
    const { render } = await import("./render");
    const page = render(location.pathname);
    document.querySelector("#app")!.innerHTML = page.body;
    document.title = page.title;
  }

  const toggle =
    document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const nav = document.querySelector<HTMLElement>("#site-nav");
  if (toggle && nav) {
    const mobile = matchMedia("(max-width: 700px)");
    const close = () => {
      nav.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = 'Menu <span aria-hidden="true">+</span>';
    };
    const sync = () => {
      toggle.hidden = !mobile.matches;
      close();
    };
    nav.dataset.enhanced = "true";
    sync();
    mobile.addEventListener("change", sync);
    toggle.addEventListener("click", () => {
      const open = nav.dataset.open !== "true";
      nav.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open
        ? 'Close <span aria-hidden="true">−</span>'
        : 'Menu <span aria-hidden="true">+</span>';
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.dataset.open === "true") {
        close();
        toggle.focus();
      }
    });
  }

  const copy = document.querySelector<HTMLButtonElement>("[data-copy-email]");
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const status = document.querySelector<HTMLElement>("[data-copy-status]")!;
      try {
        await navigator.clipboard.writeText(copy.dataset.copyEmail!);
        status.textContent = "Email address copied.";
      } catch {
        status.textContent =
          "Select the email address above to copy it or open your email app.";
      }
    });
  }
  document
    .querySelectorAll<HTMLVideoElement>("[data-project-video]")
    .forEach((video) => {
      video.addEventListener("error", () => {
        const error = document.querySelector<HTMLElement>("[data-video-error]");
        if (error) error.hidden = false;
      });
    });
  // Playing media pauses when the page is hidden; it never resumes itself.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden)
      document.querySelectorAll("video").forEach((video) => video.pause());
  });
  addEventListener("pagehide", () =>
    document.querySelectorAll("video").forEach((video) => video.pause()),
  );

  if (document.querySelector("[data-splat-load]")) {
    const { setupSpatialStudy } = await import("./features/spatial-study");
    setupSpatialStudy();
  }
  if (document.querySelector("[data-frame-experiment]")) {
    const { setupFrameStudy } = await import("./features/frame-study");
    setupFrameStudy();
  }
}

void init();
