# Pietro Francis Portfolio — Project Instructions

## Overview

This is a dual-mode portfolio website with:
1. **Full Mode**: 3D WebGL experience using Three.js (main site)
2. **Lite Mode**: CSS/HTML fallback for mobile/low-power devices (no WebGL)

The site follows a "Void/Sigil" design language — dark backgrounds, white typography, geometric sigil icons, and a sterile white Lab section.

---

## Tech Stack

- **Build Tool**: Vite
- **Language**: TypeScript
- **3D (Full Mode)**: Three.js, GLTFLoader
- **Animation**: GSAP
- **Styling**: Vanilla CSS with CSS custom properties
- **Routing (Lite)**: Custom SPA router using History API

---

## Project Structure

```
portfolio/
├── index.html              # Main 3D site entry
├── main.ts                 # Three.js scene, camera, navigation
├── style.css               # 3D site styles
│
├── lite/                   # Lite fallback site
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   │   ├── media/          # Images, videos (WebP, MP4)
│   │   └── sigils/         # SVG sigil icons (p01.svg - p05.svg)
│   └── src/
│       ├── main.ts         # Entry point, route definitions
│       ├── router.ts       # SPA router (History API)
│       ├── state.ts        # State management, mode detection
│       ├── content/
│       │   └── content.json    # All copy, projects, experiments
│       ├── styles/
│       │   ├── base.css    # Design system, variables, shared
│       │   ├── void.css    # Dark theme (Home, Work, Contact)
│       │   └── lab.css     # White theme (Lab page)
│       └── routes/
│           ├── home.ts     # Landing page with 4 chapters
│           ├── work.ts     # Client projects (selector + panel)
│           ├── lab.ts      # Experiments grid with overlay
│           └── contact.ts  # Terminal UI
│
└── models/
    └── gallery-objects.glb # 3D model for full site
```

---

## Design System

### Colors

```css
/* Void Theme (default) */
--color-bg: #000000;
--color-text: #FFFFFF;
--color-text-muted: rgba(255, 255, 255, 0.7);
--color-hairline: rgba(255, 255, 255, 0.12);

/* Lab Theme */
--lab-bg: #FAFAFA;
--lab-text: #0A0A0A;
--lab-text-muted: rgba(10, 10, 10, 0.65);
```

### Typography

```css
--font-ui: "Inter", system-ui, sans-serif;
--font-display: "Space Grotesk", system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

--size-h1: clamp(2.2rem, 6vw, 4.2rem);
--size-h2: clamp(1.3rem, 3vw, 2.0rem);
--size-body: clamp(0.95rem, 1.6vw, 1.05rem);
--size-small: 0.85rem;

--ls-caps: 0.08em;      /* Uppercase labels */
--ls-tight: -0.015em;   /* Headlines */
```

### Spacing & Layout

```css
--max-width: 1180px;
--gutter: 24px;
--section-padding: clamp(48px, 8vh, 96px);
--radius-lg: 18px;
--radius-md: 12px;
--radius-sm: 8px;
```

### Motion

```css
--transition-default: 180ms ease;
--transition-slow: 320ms ease;
```

Respect `prefers-reduced-motion: reduce` — disable animations when set.

---

## Routes & Pages

### 1. Home (`/`)

Four scroll chapters:
1. **Hero**: Portrait (colored, only strong color on site) + name + tagline + 3 CTAs
2. **Sigil Rail**: Horizontal scroll of 5 project sigils linking to Work
3. **Lab Portal**: White rectangle block linking to Lab
4. **Terminal Teaser**: Preview of contact terminal

Section dots on right side track scroll position.

### 2. Work (`/work`)

- **Desktop**: Two-column layout — left selector list, right detail panel
- **Mobile**: Horizontal tabs or stacked
- Deep linking: `/work?project=p03`
- 5 projects with: title, year, role, summary, bullets, tools, media, links, sigil

### 3. Lab (`/lab`)

- **Theme**: Switches to white/lab theme
- Grid of 3-6 specimen cards
- Click opens overlay panel with full details
- Each experiment has: label, title, summary, constraints, media, notes

### 4. Contact (`/contact`)

Terminal UI with click-first interaction:
- Command chips below prompt (clickable)
- Optional typing support
- Commands: `email`, `copy email`, `links`, `resume`, `help`, `clear`
- Clipboard API with fallback

---

## Content Model

### Project

```typescript
interface Project {
  id: string;           // "p01" - "p05"
  title: string;
  year: string;
  roleLine: string;     // "Creative Direction / 3D Design"
  summary: string;      // One sentence
  bullets: string[];    // Max 3 responsibilities
  tools: string[];      // Technologies used
  media: MediaItem[];
  links: { label: string; href: string }[];
  sigil: { svg: string; alt: string };
}
```

### Experiment

```typescript
interface Experiment {
  id: string;           // "e01" - "e03"
  title: string;
  label: string;        // "SPECIMEN E01 • REALTIME LOD"
  summary: string;
  constraints: string[];
  media: MediaItem[];
  notes?: string;
}
```

### Contact

```typescript
interface Contact {
  email: string;
  links: { label: string; href: string }[];
  resumeUrl: string;
}
```

---

## 3D Site (Full Mode) — Camera Positions

The main Three.js site has 4 chapters with these camera positions:

```typescript
const chapters = [
  {
    name: "Intro",
    cameraPosition: [15, 5, 0],
    lookAt: [9, 1, 0],
  },
  {
    name: "Works", 
    cameraPosition: [6, 4, 0],
    lookAt: [0.3, 1, 2],
  },
  {
    name: "Labs",
    cameraPosition: [6, 4, 0],
    lookAt: [0.3, 1, -2],
  },
  {
    name: "Contact",
    cameraPosition: [0, 4, 0],
    lookAt: [-6.2, 1.0, 0],
  },
];
```

Navigation: Click canvas to advance, or use nav dots on right side.

---

## Mode Detection & Switching

Lite mode activates when:
1. WebGL unavailable or context creation fails
2. `prefers-reduced-motion: reduce` is set
3. Screen width < 900px (optional)
4. User manually toggles via nav button

Preference stored in `localStorage` under key `portfolio_mode`.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Go to Home |
| `2` | Go to Work |
| `3` | Go to Lab |
| `4` | Go to Contact |
| `Esc` | Close overlay / exit terminal focus |

---

## Accessibility Requirements

- All navigation keyboard accessible
- Visible focus states
- `prefers-reduced-motion` respected
- WCAG AA contrast (both themes)
- ARIA labels on interactive elements
- Overlay focus trapping

---

## Performance Budgets

- Initial payload: < 1.5MB
- Hero image: < 400KB
- Hero video loop: < 2MB
- Per-project media: < 4MB
- Use lazy loading for below-fold media
- Images: AVIF > WebP > JPG fallback

---

## File Naming Conventions

```
Media:
/public/media/p01-hero.webp
/public/media/p01-hero.mp4
/public/media/e01.webp
/public/media/e01-poster.jpg

Sigils:
/public/sigils/p01.svg
/public/sigils/p02.svg
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Key Implementation Notes

1. **No WebGL in Lite Mode** — Pure HTML/CSS/minimal JS
2. **Sigils are monochrome SVGs** — White on dark, black on light
3. **Only the hero portrait has color** — Everything else is grayscale
4. **Terminal is click-first** — Typing is optional enhancement
5. **Lab portal is a visual "window"** — White rectangle suggesting entry to different world
6. **Route transitions** — 220ms opacity fade between pages
7. **No bullet points in prose** — Only in structured lists (project responsibilities)

---

## Copy / Content

### Hero
- **Title**: PIETRO FRANCIS
- **Subtitle**: I explore how bodies, data, and space can be re-authored into clean systems.

### Section Labels
- Work: "Selected Client Work" / "5 projects • curated"
- Lab: "Lab" / "Experiments • specimens • constraints"
- Contact: "Terminal" / "Click a command or type it."

---

## TODO / Placeholders to Replace

- [ ] Add actual portrait image/video to hero
- [ ] Replace project media placeholders
- [ ] Replace experiment media placeholders  
- [ ] Update contact email in `content.json`
- [ ] Add social links (Instagram, GitHub, etc.)
- [ ] Add resume PDF to `/public/resume.pdf`
- [ ] Create actual project sigil SVGs (currently geometric placeholders)
- [ ] Add GLB model for 3D site (`/models/gallery-objects.glb`)

---

## Example Prompts for Claude Code

```
"Add a new project p06 with title 'Brand System' for 2024"

"Change the hero subtitle to something about spatial design"

"Make the terminal support an 'instagram' command that opens my IG"

"Add a loading shimmer animation to the project media placeholders"

"Create a 404 page that matches the void theme"

"Add smooth scroll-snap to the home page chapters"

"Implement the mode toggle to actually redirect to /full or /lite"
```
