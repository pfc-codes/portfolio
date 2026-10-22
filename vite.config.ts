import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

// Inlines the render loader at the top of <head> on every page, before the
// stylesheet and module script, so the first paint is the loader rather than
// a flash of the page.
const renderLoader = (): Plugin => ({
  name: "phro-render-loader",
  transformIndexHtml(html) {
    const partial = readFileSync("src/boot/render-loader.html", "utf8").trim();
    if (!html.includes("<!--render-loader-->"))
      throw new Error("index.html is missing the <!--render-loader--> marker.");
    return html.replace("<!--render-loader-->", partial);
  },
});

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [renderLoader()],
  server: { host: "0.0.0.0", port: 5173, allowedHosts: ["terminal.local"] },
  preview: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  build: { outDir: "dist", sourcemap: false, copyPublicDir: !isSsrBuild },
  assetsInclude: ["**/*.ply", "**/*.glb", "**/*.gltf", "**/*.ksplat"],
}));
