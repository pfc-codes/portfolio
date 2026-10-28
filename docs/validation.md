# Validation

Run `npm run build && npm test` for production, or `npm run build:preview && npm test` for previews. Both use the same static renderer.

The Node suite checks route output and metadata, all seven discipline anchors, redirects, production exclusion of drafts, sitemap membership, internal links/media, escaping, native clean film controls, click-to-load YouTube, every poster/still fallback and its exact palette, Jordan frame-zero equality, the original capture hash, the unchanged 10 kB gzip entry budget, Cloudflare’s file limit, and source/public-asset references.

The GitHub Actions workflow also runs `npx playwright test` with Chromium’s software WebGL renderer. It captures every built page at 1440 × 900 and 390 × 844, a desktop loader → Jordan recording, and browser traces on failures. Interaction checks cover the FLIP handoff, session skip, reduced motion, mobile Escape/focus, YouTube consent boundary, clean native film controls, point-cloud activation/close, no-JavaScript content, one shared media canvas, pause controls and offscreen playback.

Review artifacts are attached to each production/preview CI job as `moving-image-<mode>-review`. The preview artifact includes the three clearly marked draft project pages. The local interactive browser currently uses the no-WebGL poster fallback; GPU behavior is exercised in CI. See the draft PR for the exact CI run and Cloudflare preview links.
