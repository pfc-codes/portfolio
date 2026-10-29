# Validation

Run `npm run build && npm test` for production, or `npm run build:preview && npm test` for previews. Both use the same static renderer.

The Node suite checks route output and metadata, all eight discipline anchors, redirects, production exclusion of drafts, sitemap membership, internal links/media, escaping, native clean film controls, click-to-load YouTube, every poster/still fallback and its exact palette, Jordan frame-zero equality, the original capture hash, the unchanged 10 kB gzip entry budget, Cloudflare’s 25 MiB file limit, and source/public-asset references. It also probes all 15 imported films, their HD variants and card loops for codecs, dimensions, duration, audio, fast-start ordering and loop size. Both ffmpeg and ffprobe must be on PATH. The final content checks require the four supplied external links and reject editorial placeholders or a Sculpture category/route in either mode.

The GitHub Actions workflow also runs `npx playwright test` with Chromium’s software WebGL renderer. It captures every built page at 1440 × 900 and 390 × 844, a desktop loader → Jordan recording, and browser traces on failures. Interaction checks cover the FLIP handoff, session skip, reduced motion, mobile Escape/focus, YouTube consent boundary, clean native film controls, point-cloud activation/close, no-JavaScript content, one shared media canvas, pause controls and offscreen playback. Every imported film is played at desktop and mobile widths, checking its selected source and sound label.

Full-page layout screenshots use the static Bayer fallback to avoid stretching a fixed WebGL canvas past texture limits on the long index. Separate live viewport screenshots and interaction tests scroll to Particle and Point Cloud, verify muted card-loop playback and ensure no full films are fetched by those cards. Windows uses native ANGLE for browser tests: SwiftShader can stall while releasing the original million-point capture there. Linux CI retains SwiftShader.

Review artifacts are attached to each production/preview CI job as `moving-image-<mode>-review`. Both final build modes contain the same 24 pages; previews remain noindex. Source-file reference checks normalize Windows path separators before comparing URL paths.

## Initial media delivery verification — 2026-10-29

- `npm ci`: passed; 34 packages audited, no reported vulnerabilities.
- Production: 24 prerendered pages, 11 Node checks and 10 Chromium browser checks passed.
- Preview: 25 prerendered pages, 11 Node checks and 10 Chromium browser checks passed; only the sculpture draft is added and previews remain noindex.
- Ran `npm run build` twice consecutively after preview validation; both production builds passed and produced the same bundle filenames and sizes.
- All 15 supplied films play at 1440px and 390px, selecting HD only when available and appropriate. Audio is retained in the three inputs that contain it; every card loop is muted and below 1 MB.
- Entry JavaScript remains 5.91 kB gzip. The largest new video is 11.30 MiB; the unchanged 21.53 MiB capture remains the largest deployed asset. Every output is below 25 MiB.
- Reviewed clean posters, static layouts, the About biography, Ozzy credits and live Particle/Point Cloud rendering. Jordan frame-zero equality, loader behavior and the original capture hash remain verified.
- The existing lazy splat chunk still triggers Vite’s advisory 500 kB chunk warning. It remains unloaded until the About viewer is activated.

## Final launch verification — 2026-10-29

- Owner-confirmed Ozzy and Time Block content is retained. Sculpture, editorial checklist data, placeholder markup and its unused styles are removed.
- Jordan Simone’s Instagram profile, Julie Gautier’s *AMA*, and the two Instagram audio reels are linked and checked in generated output.
- Production and preview each build 24 pages with eight disciplines and 19 projects. Both pass all 11 Node checks and 10 browser checks, including desktop/mobile playback, live Bayer rendering, loader handoff and 3D activation/close.
- Two consecutive final production builds pass. Media files, loader, dither code and capture are unchanged; every deployed asset remains below 25 MiB.
- Mobile screenshots of the audio links and Julie Gautier source credit were reviewed before release.
