# context.md — phro.design (Portfolio) — 3D Loop + Standard Site

## Goal
Build a portfolio with a **portal gate** that routes users into either:
1) **Full Experience**: a scroll-driven 3D world in a black void with a **looping camera path** (end returns to start), and
2) **Standard**: a fast, design-forward, non-3D portfolio for mobile/low-power users.

## Portal (pre-world)
- Shows a **3D Gaussian Splat of Pietro** on black as the *gateway UI*.
- Two buttons: **Full Experience** and **Standard**.
- The splat is **not part of the 3D world** and should not reappear after entering Full Experience.
- Standard should be first-class (performance/accessibility), not a fallback afterthought.

## Full Experience (3D World) — Core IA + Aesthetic
- Environment: **entirely black void**; objects are primarily **white emission** / monochrome; rare accent color if needed.
- Overall concept: identity/token at the portal → inside is a **clean system/index**.
- Navigation is **scroll-to-progress** along a **closed camera spline** so the journey loops.
- Sections in order along the loop:
  1) **Entrance / Calibration**: minimal “system boot” moment (ticks/reticle/axis) establishing tone.
  2) **Client Work**: each project represented by a **sigil** (logo-like symbol). Clicking a sigil opens an **HTML overlay panel** with project details.
  3) **Lab**: entry via a **window or lab symbol** (e.g., observation window / reticle). Inside is a **gray volumetric space** (fog/rays) with **specimen containers** representing personal/WIP projects. Clicking a specimen opens the same overlay panel system.
  4) **Contact**: presented as a **terminal interface** (clean UNIX vibe). It should be functional (copy email, links).
- At Contact, continuing the loop **returns to the start** seamlessly (no “end page”).

## Interaction Rules
- Scroll drives camera progress; progress wraps via modulo to create the loop.
- Overlays (client/lab) should **not break the loop**:
  - Opening overlay does not jump the camera.
  - While overlay open: dampen/lock scroll; closing restores normal control.
- Motion language: premium + restrained (no “tech demo” chaos).

## Implementation Notes (high level)
- Use a **closed spline** for camera position + look-ahead target.
- Map wheel/scroll → `progressTarget`; smooth to `progress`; compute `t = progress % 1`.
- Place section anchors (entrance, client band, lab entry, contact) at ranges of `t` along the spline.

## Deliverables
- Portal route + two site modes.
- Full Experience: looping 3D scroller with the 4 sections + overlays + terminal contact.
- Standard: fast, editorial HTML site mirroring the same IA (work / lab / contact), no WebGL required.
