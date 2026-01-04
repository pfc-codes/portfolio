import { Init3DViewerElements } from "online-3d-viewer";

export function mountLabViewer() {
  // Map data-model -> model (keeps Astro typings clean)
  document.querySelectorAll(".online_3d_viewer[data-model]").forEach((el) => {
    el.setAttribute("model", el.getAttribute("data-model"));
  });

  Init3DViewerElements();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => mountLabViewer(), { once: true });
} else {
  mountLabViewer();
}
