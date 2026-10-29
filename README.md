# phro.design

Pietro Francis Costa’s moving image portfolio. Vite and TypeScript, with static HTML generated at build time. Cloudflare Pages serves `dist/`.

## Develop

Use Node 22.18+ (or Node 24), then:

```sh
npm ci
npm run dev
```

`npm run build` creates a production build. Run it before `npm test`, which checks that build and needs ffmpeg and ffprobe for media verification. `npm run build:preview` creates a noindex branch preview. On Cloudflare, `CF_PAGES_BRANCH` selects preview mode for any branch other than `main`; use `npm run build -- --mode production` to force production. Draft URLs never enter the sitemap.

## Add work

Edit `src/content/work.ts`. Put media in `public/media/<entry>/`, supply image dimensions and alt text, and select one of the eight category slugs. Use `year: null` until confirmed. `draft: true` entries appear only in development and preview builds; the launch content has no drafts or editorial placeholders. Optional `focus` is an `[x, y]` percentage pair. `process` accepts labelled source/depth/output images, optional loops, or node-graph crops. Credits accept an optional `url`; `links.audio` adds a link to the Instagram version with audio. Film `audio: true` labels the native player as having sound; card loops remain muted.

`npm run prepare:dither` generates a two-colour Bayer fallback for every poster and still. This also runs before development and builds. The matrix, palette and tone mapping live in `src/media/dither.ts`; the loader and shared WebGL renderer use the same definitions. Full films stay clean.

The supplied portfolio media is already optimized and committed. To regenerate it with ffmpeg and ffprobe installed:

```sh
node scripts/prepare-portfolio-media.mjs /path/to/portfolio-assets/media
npm run build
npm test
```

`scripts/media-sources.json` maps all 15 inputs to stable entry slugs and poster timestamps. The importer creates H.264/AAC fast-start films (720p plus up to 1080p where the source supports it), short silent 480p card loops and WebP posters. It preserves aspect ratios and existing audio, caps frame rates at 30 fps, verifies decoding and enforces Cloudflare’s 25 MiB per-file limit. Generated dimensions/audio metadata live in `src/content/imported-media.json`; source hashes and delivered sizes live in `docs/media-inventory.json`. Originals remain outside the repository.

After a full import, append an entry slug to the import command to regenerate only that entry.

The older `bash scripts/prepare-media.sh /path/to/originals` command is only for Jordan and Water Dance’s separate original masters, which were not included in this delivery. Their existing films are retained. Jordan’s project poster remains pixel-identical to frame zero. The homepage and render loader use the original stretched composition at 6.42 seconds; regenerate that exact-frame still with `npm run prepare:intro`. The homepage holds that frame until the loader lands, then dissolves to clean playback. All viewport widths contain the complete portrait film.

The About capture stays unloaded until activated. To regenerate its still, run `npm run prepare:point-cloud`. Departure Mono is self-hosted under the [SIL OFL](public/fonts/OFL-DepartureMono.txt).

[Content checklist and implementation notes](docs/moving-image.md) · [Browser checks](docs/validation.md)
