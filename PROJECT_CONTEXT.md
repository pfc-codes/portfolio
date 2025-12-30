\# PROJECT\_CONTEXT.md



\## Project Overview



This project is a design- and VFX-focused personal portfolio website for freelance work, hosted publicly but currently gated behind password protection while under construction.



The site is intentionally minimal and design-forward, with an initial “In progress — stay tuned” landing page. It is meant to evolve into a full portfolio showcasing design, VFX, and visual media projects.



---



\## Core Technology Stack



\### Front-end framework

\- Astro (static site generation)

\- Astro is used in static output mode

\- Pages are written in `.astro` components

\- Content-driven sections use Astro Content Collections



\### Styling

\- Tailwind CSS

\- Used directly inside Astro components

\- No external UI frameworks



\### Content Management

\- Markdown-based CMS

\- Content lives in `src/content/`

\- Projects are individual Markdown files with frontmatter

\- Astro Content Collections enforce schema validation



\### Runtime / Language

\- TypeScript (used for middleware and config)

\- JavaScript (build tooling)

\- Node.js for local development and builds



---



\## Hosting \& Infrastructure



\### Hosting Provider

\- Cloudflare Pages



\### DNS \& Domain

\- Custom domain: `phro.design`

\- DNS managed by Cloudflare

\- Domain originally purchased via Namecheap

\- Nameservers fully transferred to Cloudflare



\### Deployment Model

\- GitHub → Cloudflare Pages

\- Production branch: `main`

\- Build command: `npm run build`

\- Output directory: `dist`

\- Automatic deployments on `git push`



---



\## Security \& Access Control



\### Password Protection

\- Implemented via Cloudflare Pages Functions middleware

\- File location:

functions/\_middleware.ts



yaml

Copy code

\- Uses HTTP Basic Authentication

\- Credentials stored as Cloudflare Pages Secrets:

\- BASIC\_USER

\- BASIC\_PASS



This middleware protects the entire site, including custom domains.



---



\## Project Structure (Key Paths)



```text

/

├── src/

│   ├── pages/

│   │   ├── index.astro        # Landing page ("In progress — stay tuned")

│   │   ├── work/              # Portfolio listing pages

│   │   └── contact/           # Contact page

│   │

│   ├── content/

│   │   └── projects/

│   │       ├── design-portfolio-site.md

│   │       └── vfx-music-video.md

│   │

│   └── styles/

│

├── functions/

│   └── \_middleware.ts         # Password protection

│

├── public/

├── astro.config.mjs

├── package.json

└── PROJECT\_CONTEXT.md

Content Model

Projects

Stored as Markdown files



Use YAML frontmatter



Fields include:



title



description



tools (array)



tags (array)



date



optional links/media



Astro enforces schema validation — incorrect types (e.g. string instead of array) will cause build errors.



Current State of the Site

The homepage is a temporary landing page



The portfolio pages exist and render locally and in production



The site is live at https://phro.design



Access is currently restricted by password



SSL is managed automatically by Cloudflare



The site is intentionally not indexed yet



Design Intent

Minimal



Editorial typography



No heavy animation yet



Design-first, not template-driven



Clean separation between content and layout



Built to scale later (blog, case studies, motion embeds)



Things That Are Intentional (Do Not “Fix”)

Password protection via middleware (temporary but deliberate)



Markdown-based content instead of a visual CMS



Astro static build (not SSR)



Cloudflare Pages (not Vercel / Netlify)



Tailwind utility-first styling



Future Planned Work (Non-exhaustive)

Replace landing page with full homepage



Remove password protection when ready



Add richer case studies



Embed video / VFX breakdowns



Possibly add motion or WebGL elements



Improve SEO once public



How to Continue This Project with an LLM

When continuing this project with an LLM, assume:



You are modifying an Astro + Tailwind + Markdown CMS site



Hosting is Cloudflare Pages



Security is handled via Pages Functions



Changes must be compatible with static builds

