# Session Notes — 2026-02-02

## What was done this session

### 1. Updated Gaussian Splat Camera (landing-splat.ts)
Changed the portal splat camera to new values and enabled orthographic mode:
- **Position**: `[-0.06131, 0.18893, 1.09196]`
- **Look-at**: `[0.21986, 0.23828, 4.30349]`
- **Up**: `[0, -1, 0]`
- **Mode**: Orthographic (`viewer.setOrthographicMode(true)`)
- Splat scale 2.2, point cloud mode enabled, focal adjustment 1.0 (unchanged)

### 2. Replaced Landing Buttons with Segmented Control
Swapped the two separate CTA buttons ("FULL EXPERIENCE" / "STANDARD") with an OS-style segmented control.

**Files changed:**
- `index.html` — New markup: `.segment-control` container with `.segment-indicator` (sliding white pill) and two `<button class="segment">` elements. "FULL 3D" is pre-selected. Added `<span class="segment-label">SELECT MODE</span>` micro-label beneath.
- `src/styles/base.css` — Removed all `.landing-buttons` / `.landing-btn` / `.landing-btn-full` / `.landing-btn-standard` styles. Added:
  - `.segment-control`: pill container, flexbox, border
  - `.segment-indicator`: absolute-positioned off-white fill (`rgba(255,255,255,0.82)`), slides via `transform: translateX` with 250ms cubic-bezier
  - `.segment`: transparent button, uppercase, z-index above indicator
  - `.segment.active`: dark text (on the white indicator)
  - `.segment-label`: mono font, 0.65rem, uppercase, 60% opacity, 0.12em letter-spacing

### 3. Full 3D Entry Transition (camera-down animation)
When the user clicks "Full 3D", the splat camera animates downward into empty black space before the 3D scroller loads.

**How it works:**
- `enterFullMode()` in `src/main.ts` orchestrates the transition:
  1. Disables pointer-events on the segment control
  2. Fades out `.landing-content` (opacity 0 over 500ms)
  3. Calls `animateSplatDown(700)` — awaits the camera animation
  4. Then calls `showFullMode()` which dismisses landing + inits the 3D scene
- `animateSplatDown()` in `src/full/landing-splat.ts`:
  - Interpolates both camera position AND look-at target over 700ms
  - **Start**: current position/look-at (the splat portrait view)
  - **End position**: `[0.16123, 4.57690, 1.00505]`
  - **End look-at**: `[0.44240, 4.62625, 4.21658]`
  - Cubic ease-in-out easing (smooth, no bounce)
  - Disables orbit controls during animation
  - The 3D scene's `#webgl` canvas then fades in from black via its existing `.visible` CSS transition (1s ease)

### 4. Type Definitions Update (gaussian-splats.d.ts)
Added `camera` and `controls` properties to the `Viewer` class so TypeScript can access the internal Three.js camera and orbit controls for the animation.

## Files modified (summary)
| File | What changed |
|------|-------------|
| `index.html` | Segmented control markup + SELECT MODE label |
| `src/styles/base.css` | Segmented control styles (replaced old button styles) |
| `src/full/landing-splat.ts` | New camera params, orthographic mode, `animateSplatDown()` function |
| `src/full/gaussian-splats.d.ts` | Added `camera`/`controls` types to Viewer |
| `src/main.ts` | `initSegmentControl()` replaces `initLandingButtons()`, new `enterFullMode()` transition flow |

## Current state
- Dev server runs cleanly (`npm run dev`, Vite, no errors)
- Portal shows segmented control with "FULL 3D" pre-selected
- Clicking "FULL 3D" → camera slides down into black → 3D scroller fades in
- Clicking "STANDARD" → indicator slides right → navigates to lite mode
- Not yet committed to git
