# Supplied portfolio content — 2026-10-29

## Audit and implementation plan

- Started on clean `feat/moving-image` at `b892a43`, matching the head of existing PR #4.
- Read both supplied copy files and inventoried every MP4 under `portfolio-assets/media`: 15 videos across seven folders. Source files are kept outside Git.
- Retain the Vite/TypeScript static renderer, homepage Jordan film, Bayer rendering, loader, responsive design, redirects and on-demand About capture.
- Import all supplied media with repeatable FFmpeg encoding, generated metadata and a hard 25 MiB file-size check.
- Add the supplied descriptions, credits and About copy. Add Particle and Point Cloud categories; retain established category URLs.
- Validate production and preview output, desktop/mobile playback, accessibility and existing interactions. Save logical checkpoint commits and update the existing branch/PR only.

## Content mapping

| Source folder | Entries |
| --- | --- |
| audio visualization | Chet Baker — mel bands; James Blake — spherical spectrogram |
| depth echo | FKA twigs — cellophane; Jungle — Back on 74; Jordan Simone |
| particle | Accretion Disk; Motion Blur |
| point cloud | Apartment; Treasure of San Gennaro — morph |
| time block | Time Block — viral video; Roberto Carlos — free kick |
| vfx | God Particle — found footage; God Particle |
| volumetric video | Volumetric video — compositor; iPhone LiDAR — depth capture |

Ozzy now has the supplied depth-displacement description and VFX credits for Jabari Browne (linked to his website) and Pietro Francis Costa. The About biography is reproduced as supplied. The view-count claim for the viral Time Block work comes from the supplied copy. Unknown dates and unspecified tools remain unset. Existing Jordan and Water Dance retain their canonical URLs and media; their short descriptions summarize their existing visuals.

## Media decisions

- MP4s contain H.264 `yuv420p`, fast-start metadata and AAC audio where present. Original full durations are retained within frame/audio rounding.
- Full films fit a 720 × 1280 or 1280 × 720 box; optional HD films fit 1080 × 1920 or 1920 × 1080. Neither path upscales a source. Aspect ratios are preserved to even-pixel precision.
- Full films use CRF 21, a capped bitrate, and at most 30 fps. Card loops use CRF 26, at most 24 fps, at most six seconds, a 480 × 854 box and no audio. Cards never download the full films.
- Posters are decoded from the delivered fallback film at the timestamp in `scripts/media-sources.json`. The existing build creates their Bayer fallbacks using the unchanged shared palette and tone mapping.
- Only the viral Time Block, volumetric compositor and iPhone depth files contain audio. The Chet Baker and James Blake source files are silent; no missing soundtrack is fabricated.
- Source hashes, original dimensions/durations and every output's byte size are recorded in [media-inventory.json](media-inventory.json). Generated assets are checked both during import and in the built-output tests.

## Final launch decisions

The owner confirmed retaining Ozzy and Time Block as supplied, removed Sculpture, and requested removal of all editorial checklist areas. Jordan Simone’s profile and Julie Gautier’s source film are linked in the respective credits. The Chet Baker and James Blake pages link to the supplied Instagram reels for audio. Existing Jordan/Water Dance films remain; unknown years are omitted. No editorial placeholders remain in either build mode.
