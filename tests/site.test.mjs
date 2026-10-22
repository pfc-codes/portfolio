import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { render, routes, projects } from "../.prerender/render.js";

const fileFor = (route) =>
  route === "/404.html" ? "dist/404.html" : join("dist", route, "index.html");
const read = (route) => readFile(fileFor(route), "utf8");
const attribute = (tag, name) =>
  tag.match(new RegExp(`\\b${name}=['"]([^'"]*)['"]`))?.[1];

test("every route ships readable content, navigation, unique metadata, and a single main heading without JavaScript", async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    const html = await read(route);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1, route);
    assert.match(html, /Skip to content/);
    assert.match(html, /aria-label='Main navigation'/);
    assert.ok(!html.includes("<!--page-body-->"));
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name='description' content='([^']+)'/)?.[1];
    assert.ok(title && !titles.has(title), `${route}: unique title`);
    assert.ok(
      description && !descriptions.has(description),
      `${route}: unique description`,
    );
    titles.add(title);
    descriptions.add(description);
    assert.match(html, /rel='canonical'/);
    assert.doesNotThrow(() =>
      JSON.parse(
        html.match(/<script type='application\/ld\+json'>(.*?)<\/script>/)?.[1],
      ),
    );
    const ids = [...html.matchAll(/\bid=['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    );
    assert.equal(new Set(ids).size, ids.length, `${route}: duplicate IDs`);
  }
});

test("all internal navigation, fragments, and media paths resolve in the production build", async () => {
  for (const route of routes) {
    const html = await read(route);
    for (const match of html.matchAll(
      /\b(?:href|src|poster)=['"]([^'"]+)['"]/g,
    )) {
      const url = match[1];
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      if (url.startsWith("#")) {
        assert.ok(
          html.includes(`id='${url.slice(1)}'`) ||
            html.includes(`id="${url.slice(1)}"`),
          `${route}: ${url}`,
        );
        continue;
      }
      assert.ok(url.startsWith("/"), `Use root-relative paths: ${url}`);
      const path = url.split(/[?#]/)[0];
      const target = path.endsWith("/") ? fileFor(path) : join("dist", path);
      await assert.doesNotReject(access(target), `${route}: missing ${url}`);
    }
  }
});

test("provided films are mapped correctly and remain user-initiated, described, and uncropped", async () => {
  assert.equal(
    projects.find((p) => p.slug === "depth-echo").study,
    "Water Dance",
  );
  assert.equal(projects.find((p) => p.slug === "time-block").study, "Jordan");
  for (const route of routes) {
    const html = await read(route);
    for (const tag of html.match(/<video\b[^>]+>/g) || []) {
      assert.equal(attribute(tag, "preload"), "none");
      assert.ok(tag.includes("controls") && tag.includes("playsinline"));
      assert.ok(!tag.includes("autoplay"));
      assert.ok(attribute(tag, "aria-label")?.includes("silent film"));
      assert.ok(attribute(tag, "poster"));
      assert.equal(
        Number(attribute(tag, "width")) / Number(attribute(tag, "height")),
        9 / 16,
      );
    }
    for (const tag of html.match(/<img\b[^>]+>/g) || []) {
      assert.notEqual(attribute(tag, "alt"), undefined);
      assert.ok(attribute(tag, "width") && attribute(tag, "height"));
    }
  }
  for (const p of projects) {
    const bytes = await readFile(join("dist", p.video));
    assert.ok(
      bytes.indexOf("moov") >= 0 &&
        bytes.indexOf("moov") < bytes.indexOf("mdat"),
      `${p.slug}: MP4 must contain metadata and support fast start`,
    );
    assert.ok(bytes.length < 2_500_000, `${p.slug}: film size budget`);
  }
});

test("unknown URLs have a useful, non-indexed 404 and valid paths normalize consistently", async () => {
  assert.equal(render("/does-not-exist/").status, 404);
  assert.match(
    render("/does-not-exist/").head,
    /name='robots' content='noindex'/,
  );
  assert.equal(render("/work").body, render("/work/").body);
  assert.match(await read("/404.html"), /Explore the work/);
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  assert.ok(!sitemap.includes("404.html"));
  assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length - 1);
});

test("homepage stays within its JS budget and does not preload 3D or film data", async () => {
  const html = await read("/");
  const script = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
  assert.ok(script);
  const js = await readFile(join("dist", script));
  assert.ok(
    gzipSync(js).length < 10_000,
    "Entry JS must stay below 10 kB gzip",
  );
  assert.ok(!html.includes(".ksplat") && !html.includes(".mp4"));
  assert.ok(
    !html.includes("gaussian-splats-3d") && !html.includes("three.module"),
  );
  const cssFile = (await readdir("dist/assets")).find((name) =>
    name.endsWith(".css"),
  );
  const css = await readFile(join("dist/assets", cssFile), "utf8");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
  assert.match(css, /object-fit:contain/);
  assert.equal(
    (await stat("public/models/converted_file.ksplat")).size,
    22_571_332,
    "Original reconstruction must remain intact",
  );
});
