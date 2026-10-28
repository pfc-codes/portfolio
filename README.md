# phro.design

Pietro Francis Costa’s moving image portfolio. Vite and TypeScript, with static HTML generated at build time. Cloudflare Pages serves `dist/`.

## Develop

Use Node 22.18+ (or Node 24), then:

```sh
npm ci
npm run dev
```

`npm run build` creates a production build. `npm test` checks that build and needs ffmpeg for the frame-zero check. `npm run build:preview` includes clearly marked drafts. On Cloudflare, `CF_PAGES_BRANCH` selects preview mode for any branch other than `main`; use `npm run build -- --mode production` to force production. Previews are noindex; draft URLs never enter the sitemap.

## Add work

Edit `src/content/work.ts`. Put media in `public/media/<entry>/`, supply image dimensions and alt text, and select one of the seven category slugs. Use `year: null` until confirmed. `draft: true` entries appear only in development and preview builds. Optional `focus` is an `[x, y]` percentage pair. `process` accepts labelled source/depth/output images, optional loops, or node-graph crops.

`npm run prepare:dither` generates a two-colour Bayer fallback for every poster and still. This also runs before development and builds. The matrix, palette and tone mapping live in `src/media/dither.ts`; the loader and shared WebGL renderer use the same definitions. Full films stay clean.

Original film masters are not in this repo. With ffmpeg installed, run `bash scripts/prepare-media.sh /path/to/originals` to generate 1080 × 1920 films and 720p fallbacks. The script names the originals it needs and checks Cloudflare’s 25 MB limit. HD sources are included automatically when present. Jordan’s poster comes from frame zero of the delivered 720p film.

The About capture stays unloaded until activated. To regenerate its still, run `npm run prepare:point-cloud`. Departure Mono is self-hosted under the [SIL OFL](public/fonts/OFL-DepartureMono.txt).

[Content checklist and implementation notes](docs/moving-image.md) · [Browser checks](docs/validation.md)
