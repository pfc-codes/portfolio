import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  render,
  routes,
  productionRoutes,
  previewBuild,
} from "../.prerender/render.js";

const template = await readFile("dist/index.html", "utf8");
if (
  !template.includes("<!--page-head-->") ||
  !template.includes("<!--page-body-->")
)
  throw new Error("Prerender markers are missing.");
for (const route of routes) {
  const page = render(route);
  const path =
    route === "/404.html" ? "dist/404.html" : join("dist", route, "index.html");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    template
      .replace("<!--page-head-->", page.head)
      .replace("<!--page-body-->", page.body),
  );
}
const urls = productionRoutes.filter((route) => route !== "/404.html");
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((route) => `<url><loc>https://phro.design${route}</loc></url>`).join("")}</urlset>\n`,
);
if (previewBuild)
  await writeFile("dist/robots.txt", "User-agent: *\nDisallow: /\n");
console.log(
  `Prerendered ${routes.length} ${previewBuild ? "preview" : "production"} pages and sitemap.`,
);
