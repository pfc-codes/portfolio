import { defineConfig } from "vite";
export default defineConfig(({ isSsrBuild }) => ({
  server: { host: "0.0.0.0", port: 5173, allowedHosts: ["terminal.local"] },
  preview: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  build: { outDir: "dist", sourcemap: false, copyPublicDir: !isSsrBuild },
  assetsInclude: ["**/*.ply", "**/*.glb", "**/*.gltf", "**/*.ksplat"],
}));
