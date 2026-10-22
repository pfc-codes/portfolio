# PHROGRAPHICA — Temporal Atlas

Pietro Francis Costa's portfolio, built with Vite, TypeScript, and static HTML.
Cloudflare Pages continues to serve `dist/`; this change does not introduce a
server framework, CMS, or new hosting provider.

## Development

Use Node 22.12+ (the supported major is in `.node-version`).

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

`build` type-checks the application, creates the browser bundles, builds the
shared renderer for Node, and writes ten complete HTML pages plus `sitemap.xml`.
`.prerender/` is an ignored build intermediate, not a deployment directory.
The development server uses the same page renderer. Production content and
navigation work without JavaScript; interactive tools progressively enhance it.

## Pages and content

- `/`: introduction, selected projects, practice, and Lab.
- `/work/`: project index and retained digital-design links.
- `/work/time-block/`: Time Block, with the **Jordan** film.
- `/work/depth-echo/`: Depth Echo, with the **Water Dance** film.
- `/lab/`: working experiments.
- `/lab/frame-study/`: film selection, playback, frame steps, and scrubbing.
- `/lab/spatial-study/`: the preserved Gaussian splat reconstruction.
- `/about/`, `/contact/`, and a real `404.html`.

Reusable project records live in `src/content/projects.ts`; page composition and
SEO metadata live in `src/render.ts`. Styles and design tokens are in
`src/styles/atlas.css`. Browser enhancements are in `src/main.ts` and
`src/features/`. The original experimental `src/full/` modules, legacy route
files, and sigils remain in Git for reference; they are not imported by the new
entry point. Only their Gaussian-splat TypeScript declaration is used.

Project descriptions are editorial observations of the supplied films, not
claims about a client, production date, commercial outcome, or technical pipeline.
Confirm process descriptions, credits, collaborators, and download links before
adding them. Unfinished experiments are not presented as available tools.

## Media and 3D

`public/media/` contains web encodes and stills derived exclusively from the two
supplied videos. MP4s are H.264/yuv420p at 720 × 1280 with fast-start metadata,
original frame rates, and no audio. Case-study playback and selected frames keep
the full portrait composition; index thumbnails are cropped for layout.

Both films are silent. Each has a visible visual description; captions are not
invented. Videos use native controls and `preload="none"`. No video autoplays.
All original uploads should remain in the owner's media archive; they are not
duplicated in this repository.

The original `public/models/converted_file.ksplat` is unchanged. The model and
3D libraries load only after explicit activation in the Lab. Rendering pauses
offscreen or in hidden tabs, pixel ratio is capped, and the scene releases its
resources when closed or the page is left. A readable fallback and links to the
films remain if WebGL is unavailable or loading fails. Keyboard and button
controls supplement drag/pinch interactions. Reduced motion skips the reveal.

## Design system

- Paper `#f1f0e9`, ink `#161616`, oxide `#9e2e24`, muted text `#62615a`.
- Self-hosted Space Grotesk for display; Inter for body; system mono for metadata.
- Fluid page gutters; two-column editorial grids; single-column phone layouts.
- Fine rules, time markers, large typography, and actual film material.
- Visible focus, skip link, native links, mobile menu with Escape dismissal,
  explicit media controls, reduced-motion support, and readable error states.

## Validation and release

`npm test` checks all generated routes, unique metadata, headings, structured
data, internal links/fragments/assets, project-to-film mapping, MP4 metadata,
media-size budgets, original model size, and the entry-JavaScript budget.
The GitHub workflow runs install/build/tests for the feature branch and PR.

Keep this work on `feat/temporal-atlas` and review its draft PR and Cloudflare
preview before merging. **Production deployment requires the owner's explicit
approval.** Build command remains `npm run build`; output remains `dist`.
No Cloudflare dashboard settings are changed by this repository update.

Before release, verify in a GPU-enabled browser that the scene renders, rotates,
zooms, resets, closes, and reopens; check iOS/Safari playback and real touch input;
check the deployed preview's direct URLs, 404 status, caching, noindex headers,
and production Lighthouse scores. Local browser QA is not a field performance
measurement. See `docs/validation.md` for the review record.
