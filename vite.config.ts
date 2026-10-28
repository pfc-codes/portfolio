import { readFileSync, existsSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import { entries } from "./src/content/work.ts";
import { DITHER, whitePoint, toneMap } from "./src/media/dither.ts";

// Inlines the render loader at the top of <head> on every page, before the
// stylesheet and module script, so the first paint is the loader rather than
// a flash of the page.
const renderLoader = (): Plugin => ({
  name: "phro-render-loader",
  transformIndexHtml(html) {
    const partial = readFileSync("src/boot/render-loader.html", "utf8").trim()
      .replace("/*shared-dither*/", `var DITHER = ${JSON.stringify(DITHER)}; var whitePoint = ${whitePoint.toString()}; var toneMap = ${toneMap.toString()};`);
    if (!html.includes("<!--render-loader-->"))
      throw new Error("index.html is missing the <!--render-loader--> marker.");
    return html.replace("<!--render-loader-->", partial);
  },
});

export default defineConfig(({ isSsrBuild, mode, command }) => ({
  define: {
    __PREVIEW__: JSON.stringify(command === "serve" || mode === "preview"),
    __HD_MEDIA__: JSON.stringify(entries.flatMap(p => p.media.film ? [p.media.film.src.replace(/\.mp4$/, "-1080.mp4")] : []).filter(path => existsSync(`public${path}`))),
  },
  plugins: [renderLoader()],
  server: { host: "0.0.0.0", port: 5173, allowedHosts: ["terminal.local"] },
  preview: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  build: { outDir: "dist", sourcemap: false, copyPublicDir: !isSsrBuild },
  assetsInclude: ["**/*.ply", "**/*.glb", "**/*.gltf", "**/*.ksplat"],
}));
