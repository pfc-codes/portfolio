import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';
import { render, routes, entries, productionRoutes, previewBuild } from '../.prerender/render.js';

const fileFor = route => route === '/404.html' ? 'dist/404.html' : join('dist', route, 'index.html');
const read = route => readFile(fileFor(route), 'utf8');
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=['"]([^'"]*)['"]`))?.[1];
const walk = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(f => f.isDirectory() ? walk(join(dir, f.name)) : join(dir, f.name)))).flat();

test('all routes are prerendered with unique metadata, one main heading, accessible navigation and no duplicate IDs', async () => {
  const titles = new Set(), descriptions = new Set();
  for (const route of routes) {
    const html = await read(route);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1, route);
    assert.match(html, /Skip to content/); assert.match(html, /aria-label='Main navigation'/);
    assert.ok(!html.includes('<!--page-body-->'));
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name='description' content='([^']+)'/)?.[1];
    assert.ok(title && !titles.has(title), route); titles.add(title);
    assert.ok(description && !descriptions.has(description), route); descriptions.add(description);
    assert.match(html, /rel='canonical'/);
    JSON.parse(html.match(/<script type='application\/ld\+json'>(.*?)<\/script>/)?.[1]);
    const ids = [...html.matchAll(/\bid=['"]([^'"]+)['"]/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, route);
    for (const tag of html.match(/<img\b[^>]+>/g) || []) {
      assert.notEqual(attribute(tag, 'alt'), undefined);
      assert.ok(attribute(tag, 'width') && attribute(tag, 'height'));
    }
    assert.doesNotMatch(html, /<em>|<br\s*\/?\s*>|Have something|Back to top|time-ruler|staggered|title-period/);
  }
});

test('canonical work routes and all seven discipline anchors exist; old links redirect', async () => {
  const required = ['/work/ozzy/', '/work/time-block-addon/', '/work/jordan/', '/work/water-dance/'];
  required.forEach(route => assert.ok(productionRoutes.includes(route)));
  const work = await read('/work/');
  const slugs = ['vfx-music-videos', 'audio-visual', 'semi-volumetric', 'time-block-addon', 'time-block-work', 'depth-echo', 'sculpture'];
  const positions = slugs.map(slug => work.indexOf(`id='${slug}'`));
  assert.ok(positions.every((p, i) => p >= 0 && (!i || p > positions[i - 1])));
  assert.match(work, /depth workflow, listed under VFX/);
  const redirects = await readFile('dist/_redirects', 'utf8');
  for (const [from, to] of [['/work/time-block/', '/work/jordan/'], ['/work/depth-echo/', '/work/water-dance/']]) assert.ok(redirects.includes(`${from} ${to} 301`));
  assert.match(redirects, /^\/lab\/spatial-study\/ \/about\/ 302$/m);
  assert.match(redirects, /^\/lab\/frame-study\/ \/work\/ 302$/m);
  assert.equal(render('/work').body, render('/work/').body);
  assert.equal(render('/missing').status, 404);
  assert.match(render('/missing').head, /noindex/);
});

test('drafts render only in development/previews and never enter the sitemap or production route set', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, productionRoutes.length - 1);
  for (const p of entries.filter(e => e.draft)) {
    const route = `/work/${p.slug}/`;
    assert.equal(render(route, false).status, 404);
    assert.equal(render(route, true).status, 200);
    assert.match(render(route, true).head, /noindex/);
    assert.ok(!productionRoutes.includes(route) && !sitemap.includes(route));
    assert.ok(!render('/work/', false).body.includes(p.title));
    if (previewBuild) await access(fileFor(route));
    else await assert.rejects(access(fileFor(route)));
  }
  if (previewBuild) assert.match(await readFile('dist/robots.txt', 'utf8'), /Disallow: \//);
});

test('all internal links, fragments, media sources and posters resolve', async () => {
  for (const route of routes) {
    const html = await read(route);
    for (const m of html.matchAll(/\b(?:href|src|poster|data-src|data-clean-src)=['"]([^'"]+)['"]/g)) {
      const url = m[1]; if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const [path, fragment] = url.split('#');
      if (!path) { assert.ok(html.includes(`id='${fragment}'`) || html.includes(`id="${fragment}"`)); continue; }
      assert.ok(path.startsWith('/'), url);
      const target = path.endsWith('/') ? fileFor(path) : join('dist', path);
      await assert.doesNotReject(access(target), `${route}: ${url}`);
      if (fragment) assert.ok((await readFile(target, 'utf8')).includes(`id='${fragment}'`), url);
    }
    assert.equal(html.includes('data-splat-load'), route === '/about/');
    for (const p of entries.filter(e => !e.draft)) assert.match(render(`/work/${p.slug}/`, false).head, /og:type' content='video.other'/);
  }
});

test('every content string is escaped, including still alt text and process captions', () => {
  const p = entries.find(e => e.slug === 'jordan');
  const frame = p.media.stills[0], saved = frame.alt, process = p.process;
  try {
    frame.alt = `A 'quoted' <img src=x onerror="alert(1)"> & image`;
    p.process = [{ label: '<source> & result', still: { ...frame, caption: '<script>' } }];
    const html = render('/work/jordan/', false).body;
    assert.match(html, /A &#39;quoted&#39; &lt;img src=x onerror=&quot;alert\(1\)&quot;&gt; &amp; image/);
    assert.match(html, /&lt;source&gt; &amp; result/);
    assert.ok(!html.includes('<img src=x'));
  } finally { frame.alt = saved; p.process = process; }
});

test('films are clean native players and YouTube loads only after a click', async () => {
  for (const p of entries.filter(e => e.media.film)) {
    const html = await read(`/work/${p.slug}/`);
    const tag = html.match(/<video\b[^>]+>/)[0];
    assert.ok(tag.includes('controls') && tag.includes('playsinline') && !tag.includes('autoplay'));
    assert.equal(attribute(tag, 'preload'), 'none');
    assert.match(attribute(tag, 'aria-label'), /silent film/);
    assert.ok(!tag.includes('data-dither'));
    const bytes = await readFile(join('public', p.media.film.src));
    assert.ok(bytes.indexOf('moov') < bytes.indexOf('mdat'));
  }
  const ozzy = await read('/work/ozzy/');
  assert.doesNotMatch(ozzy, /<iframe|<script[^>]+src=['"][^'"]*(?:youtube|ytimg)/);
  assert.match(ozzy, /data-youtube='aOJ1GtodHKo'/);
  const main = await readFile('src/main.ts', 'utf8');
  assert.match(main, /youtube-nocookie\.com\/embed/);
});

test('Bayer fallbacks exist for every poster/still, have the right dimensions and contain exactly the loader palette', async () => {
  const manifest = JSON.parse(await readFile('.generated/dither.json', 'utf8'));
  const stills = [...entries.flatMap(p => [p.media.poster, ...(p.media.stills || []), ...(p.process || []).map(m => m.still)]).filter(Boolean), { src: '/media/about/point-cloud.webp' }];
  const paths = new Set(stills.map(s => s.src));
  assert.equal(manifest.length, paths.size);
  for (const item of manifest) {
    assert.ok(paths.has(item.source));
    await access(join('dist', item.fallback));
    const { data, info } = await sharp(join('dist', item.fallback)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const original = await sharp(join('public', item.source)).metadata();
    assert.equal(info.width, original.width); assert.equal(info.height, original.height);
    for (let i = 0; i < data.length; i += 3) {
      assert.ok(data[i] === 0 || data[i] === 237);
      assert.equal(data[i], data[i + 1]); assert.equal(data[i], data[i + 2]);
    }
  }
});

test('Jordan poster is pixel-identical to decoded film frame zero', async () => {
  const frame = execFileSync('ffmpeg', ['-v', 'error', '-i', 'public/media/time-block/jordan.mp4', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 10_000_000 });
  const raw = await sharp(frame).removeAlpha().raw().toBuffer();
  const poster = await sharp('public/media/time-block/poster.webp').removeAlpha().raw().toBuffer();
  assert.deepEqual(poster, raw);
});

test('entry JS remains under 10 kB gzip, 3D stays lazy, capture is unchanged, and every file is below Cloudflare’s limit', async () => {
  const html = await read('/');
  const script = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
  const js = await readFile(join('dist', script));
  assert.ok(gzipSync(js).length < 10_000, `Entry gzip: ${gzipSync(js).length}`);
  assert.ok(!html.includes('.ksplat') && !html.includes('splat-engine'));
  const cssPath = (await readdir('dist/assets')).find(p => p.endsWith('.css'));
  const css = await readFile(join('dist/assets', cssPath), 'utf8');
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /focus-visible/); assert.match(css, /object-fit:contain/);
  assert.doesNotMatch(css, /lab-|frame-stack|lab-art|lab-teaser|staggered|Space Grotesk|Inter,/);
  const capture = await readFile('public/models/converted_file.ksplat');
  assert.equal(capture.length, 22_571_332);
  const hash = createHash('sha1').update(`blob ${capture.length}\0`).update(capture).digest('hex');
  assert.equal(hash, 'f963a58bbebe47c3695748b845bdea351e03c390');
  for (const path of await walk('dist')) assert.ok((await stat(path)).size < 25_000_000, path);
});

test('no unreferenced source files or public assets remain', async () => {
  // Follow real imports from client + prerender roots, including dynamic imports.
  const sourceFiles = await walk('src');
  const reachable = new Set();
  const visit = async path => {
    path = resolve(path); if (reachable.has(path)) return;
    reachable.add(path); const content = await readFile(path, 'utf8');
    if (extname(path) !== '.ts') return;
    for (const ref of ts.preProcessFile(content, true, true).importedFiles) {
      if (!ref.fileName.startsWith('.')) continue;
      const base = resolve(dirname(path), ref.fileName);
      for (const next of [base, `${base}.ts`, `${base}.css`]) {
        try { if ((await stat(next)).isFile()) { await visit(next); break; } } catch {}
      }
    }
  };
  await visit('src/main.ts'); await visit('src/render.ts');
  // Vite injects the loader partial; TypeScript consumes the two ambient declarations.
  const buildRoots = new Set(['src/boot/render-loader.html', 'src/vite-env.d.ts', 'src/types/gaussian-splats.d.ts']);
  for (const file of sourceFiles) assert.ok(reachable.has(resolve(file)) || buildRoots.has(file), `Unreferenced source: ${file}`);
  const html = routes.map(r => render(r, true).body + render(r, true).head).join('\n');
  const code = (await Promise.all(sourceFiles.map(p => readFile(p, 'utf8')))).join('\n');
  const css = await readFile('src/styles/atlas.css', 'utf8');
  const auto = new Set(['public/_headers', 'public/_redirects', 'public/robots.txt', 'public/fonts/OFL-DepartureMono.txt']);
  const template = await readFile('index.html', 'utf8');
  for (const path of await walk('public')) {
    const url = '/' + path.slice('public/'.length);
    assert.ok(auto.has(path) || html.includes(url) || code.includes(url) || css.includes(url) || template.includes(url), `Unreferenced asset: ${path}`);
  }
});
