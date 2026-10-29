# Moving image overhaul

## Content status

The 2026-10-29 delivery adds all 15 supplied films, project descriptions, artist/source credits, the About biography, and Particle/Point Cloud categories. See [the import record](media-import.md) and [source/output inventory](media-inventory.json). The Work index now has nine disciplines and 19 published entries. Only the sculpture entry remains a draft.

| Discipline | Needed |
| --- | --- |
| VFX & music videos | Ozzy release year, approved poster and optional VFX shot/process breakdown. Its description, tools and Jabari Browne/Pietro Francis Costa credits are supplied. |
| Time Block — the add-on | Confirm store version (see below); dedicated tool demo and interface screenshot, process/node graph, release year and final product copy. Jordan’s existing still is clearly captioned as work made with the tool. |
| Time Block — work | Jordan release year, approved source-footage credits, optional process media and original `jordan_render_instagram.mp4`. |
| Depth Echo | Water Dance release year, approved performer/source credits, optional process media and original `water_dance_2_HQ.mp4`. |
| 3D sculpture | Project title/year, materials, dimensions, printing method, description, sculpture/detail photos, turntable loop, alt text, source motion → time stack → printed object images, fabrication/exhibition credits if applicable. |

Unknown years remain `null`. Search `needed` and `draft: true` in `src/content/work.ts` for remaining editorial slots. Drafts and notes appear only in development/Cloudflare previews. Existing contact details are retained.

## Decisions to review

- Canonical film URLs are `/work/jordan/` and `/work/water-dance/`; the old `/work/time-block/` and `/work/depth-echo/` URLs redirect permanently. Existing `/lab` redirects remain.
- [Time Block’s Gumroad page](https://phr0swork.gumroad.com/l/time-block) displayed **0.2.2**, a **$0 minimum / pay-what-you-want** price and a **$5 suggested amount** when retrieved on **2026-10-28**. The site states 0.2.2 and free/pay-what-you-want, with that verification date. This may be an outdated store listing: review it before merging. The license is **GPL-3.0-or-later**, as specified in the brief; no Blender compatibility claim was added.
- Ozzy’s thumbnail host returned an unavailable response. A temporary, locally rendered title slate is used for the facade; it does not pretend to be a VFX still. Replace `/media/ozzy/poster.webp` with an approved poster. No YouTube connection occurs until the play button is clicked.
- [Departure Mono 1.500](https://github.com/rektdeckard/departure-mono) is self-hosted, with the upstream **SIL Open Font License 1.1** copyright and license shipped in `public/fonts/OFL-DepartureMono.txt`.
- Poster generation uses lossless two-colour PNG so the fallback palette is exactly black and #ededed. Live video uses the same luminance weights, 98th-percentile white normalization, black exclusion and gamma as the loader, sampling the current frame periodically. The shared renderer uses one WebGL2 context; the explicitly activated About 3D viewer has its own independent context.
- Jordan’s old poster was a later frame. Its replacement is a lossless, pixel-identical decode of frame zero of the delivered 720p film. The loader crop was remeasured for that image and the FLIP calculation uses the actual video fitting/positioning geometry.
- On WebGL failure, disabled JavaScript or reduced motion, the prebuilt dithered images remain. Reduced motion has an explicit Play film control and no sweep/autoplay. A global pause control stops automatic loops.
- The entry-JS limit remains **10,000 gzip bytes**. The implementation is around 6 kB gzip; the large Three/splat engine remains a separate lazy chunk.
- The original high-resolution film masters are absent. Existing 720p films are retained. `scripts/prepare-media.sh` is ready to produce 1080 × 1920 films plus 720p fallbacks from the two named originals; the renderer automatically adds HD sources when those files exist. Nothing is upscaled and presented as an original HD master.

## Fixes

- Removed the footer CTA (and its mobile missing-space bug); the new renderer has no breakpoint-hidden `<br>` elements.
- Uncropped media cards/stills use `contain` and optional object-position; the contradictory late `cover` override is gone. Hero fitting is separate and its geometry is used by the loader handoff.
- Removed unstyled headline emphasis, giant template headlines, internal-link arrows, decorative time ruler, observe/reconstruct/reimagine triad, staggered grid, title dots and back-to-top CTA.
- Project `og:type` is `video.other`; interpolated alt text and all other content strings are escaped, including process captions.
- CI runs on pull requests and pushes to `main`, and validates production and preview builds independently.
- Replaced the handoff-style README with developer setup, build and content instructions.
- Added click-to-load YouTube privacy embeds, process-media support, preview-only editorial slots and draft routing/sitemap safeguards.

## Deleted

- `public/sigils/p01.svg`
- `public/sigils/p02.svg`
- `public/sigils/p03.svg`
- `public/sigils/p04.svg`
- `public/sigils/p05.svg`
- `public/vite.svg`
- `src/content/content.json`
- `src/content/projects.ts`
- `src/counter.ts`
- `src/features/frame-study.ts`
- `src/full/chapters.ts`
- `src/full/gaussian-splats.d.ts` (declaration moved to `src/types/gaussian-splats.d.ts`)
- `src/full/index.ts`
- `src/full/interactions.ts`
- `src/full/landing-splat.ts`
- `src/full/loader.ts`
- `src/full/overlays.ts`
- `src/full/placeholder.ts`
- `src/full/scene-objects.ts`
- `src/full/scene.ts`
- `src/router.ts`
- `src/routes/contact.ts`
- `src/routes/home.ts`
- `src/routes/lab.ts`
- `src/routes/work.ts`
- `src/state.ts`
- `src/style.css`
- `src/styles/base.css`
- `src/styles/lab.css`
- `src/styles/void.css`
- `src/typescript.svg`

Removed dependencies: `gsap`, `@fontsource/inter`, `@fontsource/space-grotesk`. Replaced the legacy stylesheet, including all `.lab-*`, `.frame-stack`, `.lab-art`, `.lab-teaser`, `.lab-index` and `.lab-entry` rules.
