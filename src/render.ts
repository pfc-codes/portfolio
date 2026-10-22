import { projects, routes, site, type Project } from "./content/projects";

export { routes, projects };
export const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const arrow = `<span aria-hidden='true'>↗</span>`;
const label = (left: string, right = "") =>
  `<div class='section-label'><span>${left}</span>${right ? `<span>${right}</span>` : ""}</div>`;
const image = (p: Project, eager = false) =>
  `<img src='${p.poster}' alt='${escape(p.posterAlt)}' width='900' height='1600' ${eager ? "fetchpriority='high' loading='eager'" : "loading='lazy'"} decoding='async'>`;
const card = (p: Project, eager = false) => `<article class='project-card'>
  <a class='project-link' href='/work/${p.slug}/'>
    <div class='project-image'>${image(p, eager)}<span class='media-caption'>${p.study} <span>${p.duration.toFixed(2)} s</span></span><span class='project-open' aria-hidden='true'>↗</span></div>
    <div class='project-heading'><span class='index'>${p.number}</span><h3>${p.title}</h3><span class='project-arrow' aria-hidden='true'>↗</span></div>
    <p class='project-category'>${p.category}</p>
  </a>
</article>`;

function header(path: string) {
  return `<a class='skip-link' href='#main'>Skip to content</a>
  <header class='site-header wrap'>
    <a class='wordmark' href='/' aria-label='phro.design home'>phro<span class='brand-dot'>.</span><span class='wordmark-tail'>design</span></a>
    <button class='menu-toggle' type='button' data-menu-toggle aria-expanded='false' aria-controls='site-nav' hidden>Menu <span aria-hidden='true'>+</span></button>
    <nav class='site-nav' id='site-nav' aria-label='Main navigation'>${[
      "Work",
      "About",
      "Contact",
    ]
      .map((name) => {
        const href = `/${name.toLowerCase()}/`;
        return `<a href='${href}' ${path.startsWith(href) ? "aria-current='page'" : ""}>${name}${name === "Contact" ? arrow : ""}</a>`;
      })
      .join("")}</nav>
  </header>`;
}

const footer = () => `<footer class='site-footer wrap'>
  <div class='footer-top'><p>Have something<br>in mind?</p><a class='contact-link' href='/contact/'>Let's make it tangible. ${arrow}</a></div>
  <div class='footer-bottom'><a class='footer-brand' href='/'>phro.design</a><span>Creative technology & spatial media</span><div><a href='${site.instagram}'>Instagram ${arrow}</a><a href='mailto:${site.email}'>Email ${arrow}</a></div><a class='back-top' href='#top'>Back to top ↑</a></div>
</footer>`;

function home() {
  return `<section class='hero wrap'>
    ${label("Pietro Francis Costa", "Creative technology / Moving image / Spatial media")}
    <h1>Time, given <em>form.</em></h1>
    <div class='hero-bottom'><p>Experiments at the edges<br>of image, time, and space.</p><a class='text-link' href='#selected-work'>Explore selected work <span aria-hidden='true'>↓</span></a></div>
    <div class='time-ruler' aria-hidden='true'><span>00:00</span><span>00:04</span><span>00:08</span><span>00:12</span></div>
  </section>
  <section class='selected-work wrap' id='selected-work' aria-labelledby='selected-title'>
    <div class='section-heading'><h2 id='selected-title'>Selected work</h2><a class='text-link' href='/work/'>View the index ${arrow}</a></div>
    <div class='project-grid staggered'>${projects.map((p, i) => card(p, i === 0)).join("")}</div>
  </section>
  <section class='practice-strip wrap'>${label("The practice", "01 — Observe / 02 — Reconstruct / 03 — Reimagine")}
    <p>I work with moving images, spatial media, and code to explore how we <em>experience time.</em></p><a class='text-link' href='/about/'>About the practice ${arrow}</a>
  </section>`;
}

function work() {
  return `<section class='page-intro wrap'>${label("Index / Work", "02 selected projects")}<h1>Time in<br><em>another dimension.</em></h1><div class='intro-bottom'><p>Studies in temporal manipulation, experimental video, and spatial media.</p><span class='mono'>Moving image → Spatial object</span></div></section>
    <section class='wrap work-index' aria-labelledby='work-title'><h2 id='work-title' class='sr-only'>Project index</h2><div class='project-grid'>${projects.map((p, i) => card(p, i === 0)).join("")}</div></section>
    <section class='wrap adjacent-work'>${label("Elsewhere / Digital design")}<h2>Across the web.</h2><div class='external-list'>${[
      ["Pietro Costa", "https://pietrocosta.com"],
      ["Whitespace Projects", "https://whitespaceprojectsnapoli.org"],
      ["BACAS", "https://bacasitaly.org/about"],
    ]
      .map(
        ([name, url]) =>
          `<a href='${url}'><span>${name}</span><span class='mono'>Visit website ${arrow}</span></a>`,
      )
      .join("")}</div></section>`;
}

function film(p: Project) {
  return `<figure class='film'>
    <div class='film-stage'><video controls playsinline preload='none' width='720' height='1280' poster='${p.poster}' aria-label='${p.title}: ${p.study}, silent film' src='${p.video}' data-project-video><p>Your browser cannot play this film. <a href='${p.video}'>Open the MP4.</a></p></video></div>
    <figcaption><span>${p.study} / ${p.title}</span><span>${p.duration.toFixed(2)} s · ${p.fps} fps · Silent</span><a href='${p.video}'>Open film ${arrow}</a></figcaption>
    <p class='media-error' data-video-error hidden>The film could not load. <a href='${p.video}'>Open the MP4 directly</a>, or explore the stills below.</p>
  </figure>`;
}

function projectPage(p: Project) {
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return `<section class='project-intro wrap'>${label(`<a href='/work/'>Work</a> / ${p.number}`, p.category)}<h1>${p.title}<span class='title-period'>.</span></h1><div class='project-deck'><span class='mono'>Study / ${p.study}</span></div></section>
  <section class='wrap project-film' aria-label='${p.title} film'>${film(p)}</section>
  <section class='wrap frames-section' aria-labelledby='frames-title'><div class='section-heading'><h2 id='frames-title'>Selected frames</h2><span class='mono'>${p.study}</span></div><div class='frames-grid'>${p.frames.map((f) => `<figure><img src='${f.src}' alt='${f.alt}' width='480' height='853' loading='lazy'><figcaption>${p.study}<span>${f.time}</span></figcaption></figure>`).join("")}</div></section>
  <a class='next-project wrap' href='/work/${next.slug}/'><span class='mono'>Next project / ${next.number}</span><span>${next.title} ${arrow}</span></a>`;
}

function pointCloud() {
  return `<section class='wrap about-scene' aria-labelledby='viewer-heading'>
  <div class='section-heading'><h2 id='viewer-heading'>Point cloud.</h2><span class='mono'>Interactive / 3D</span></div>
  <div class='spatial-stage' data-splat-stage><div class='splat-mount' data-splat-mount aria-label='3D scene viewport' aria-describedby='viewer-help' tabindex='-1'></div><div class='splat-cover' data-splat-cover><span class='point-glyph' aria-hidden='true'>✳</span><button class='button button-light' data-splat-load type='button' hidden>Load the 3D scene <span aria-hidden='true'>↗</span></button><span class='download-note'>22.6 MB · Loads when you choose</span><noscript><p>Enable JavaScript to explore the point cloud, or <a href='/work/'>watch the project films</a>.</p></noscript></div></div>
  <div class='viewer-controls' data-splat-controls hidden><button type='button' data-orbit='left' aria-label='Rotate scene left'>← Rotate</button><button type='button' data-orbit='right' aria-label='Rotate scene right'>Rotate →</button><button type='button' data-zoom='in'>Zoom in +</button><button type='button' data-zoom='out'>Zoom out −</button><button type='button' data-splat-reset>Reset view</button><button type='button' data-splat-close>Close scene</button></div>
  <p class='experiment-status' data-splat-status role='status' aria-live='polite'></p>
  <div class='viewer-help'><p id='viewer-help'>Drag to orbit. Scroll or pinch to zoom. With the scene focused, use the arrow keys and + / −.</p><a class='text-link' href='/work/'>View the work ${arrow}</a></div>
  </section>`;
}

function about() {
  return `<section class='page-intro about-intro wrap'>${label("About", "Pietro Francis Costa")}<h1>I turn moving images into <em>places.</em></h1></section>
  <div class='wrap'><div class='about-copy'><p>Using video, depth, sound, and real-world captures, I build digital objects that show how they were made: semi-volumetric forms where the structure stays visible in the points, the dither, and the artifacts the process leaves behind. Rather than layering effects onto footage, I transform it, pulling a flat image into something you can walk around, slice through, or see from an angle it was never meant to be seen from.</p><p>Time Block and Depth Echo come out of that practice. They’re tools I built in Blender and code to treat time as a material, so a clip can become a volume and a single frame can open into space.</p></div></div>
  ${pointCloud()}`;
}

function contact() {
  return `<section class='page-intro contact-intro wrap'>${label("Contact", "A conversation is a good place to start")}<h1>What are<br>you <em>imagining?</em></h1><div class='intro-bottom'><p>For projects, collaborations, or an interesting question about images, spaces, and time.</p></div><a class='email-link' href='mailto:${site.email}'>${site.email} ${arrow}</a><button class='copy-email text-link' data-copy-email='${site.email}' type='button' hidden>Copy email address</button><p class='copy-status' data-copy-status role='status' aria-live='polite'></p></section>
  <section class='wrap contact-elsewhere'>${label("Find me elsewhere")}<div class='external-list'>${[
    ["Instagram", site.instagram],
    ["YouTube", site.youtube],
    ["TikTok", site.tiktok],
  ]
    .map(([name, url]) => `<a href='${url}'><span>${name}</span>${arrow}</a>`)
    .join("")}</div></section>`;
}

function missing() {
  return `<section class='page-intro wrap not-found'>${label("404 / Outside the frame")}<h1>A moment<br><em>out of place.</em></h1><p>This page isn't here. The work is a good place to pick up the thread.</p><a class='button button-dark' href='/work/'>Explore the work ${arrow}</a></section>`;
}

export function render(pathname: string) {
  const path =
    pathname === "/404.html"
      ? pathname
      : `/${pathname.split("/").filter(Boolean).join("/")}${pathname === "/" ? "" : "/"}`;
  const p = projects.find((item) => path === `/work/${item.slug}/`);
  const known = routes.includes(path);
  const page = p
    ? projectPage(p)
    : path === "/"
      ? home()
      : path === "/work/"
        ? work()
        : path === "/about/"
          ? about()
          : path === "/contact/"
            ? contact()
            : missing();
  const titles: Record<string, string> = {
    "/": "phro.design — Time, given form",
    "/work/": "Work — phro.design",
    "/about/": "About Pietro — phro.design",
    "/contact/": "Contact — phro.design",
  };
  const title = p
    ? `${p.title}: ${p.study} — phro.design`
    : titles[path] || "Page not found — phro.design";
  const descriptions: Record<string, string> = {
    "/": "Pietro Francis Costa explores image, time, and space through creative technology, experimental video, spatial media, and interactive experiences.",
    "/work/":
      "Explore Time Block and Depth Echo: moving-image studies in temporal manipulation, experimental video, and spatial media by Pietro Francis Costa.",
    "/about/":
      "I turn moving images into places. Using video, depth, sound, and real-world captures, I build digital objects that show how they were made.",
    "/contact/":
      "Get in touch with Pietro Francis Costa at phro.design for creative technology, moving image, spatial media, and digital design collaborations.",
  };
  const description = p
    ? `${p.title}: ${p.study}. ${p.duration.toFixed(2)}-second silent film by Pietro Francis Costa.`
    : descriptions[path] ||
      "This page could not be found. Explore the work at phro.design.";
  const canonical = `${site.origin}${known ? path : "/404.html"}`;
  const socialImage = `${site.origin}${p?.poster || projects[0].poster}`;
  const schema = p
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: p.title,
        description,
        url: canonical,
        image: socialImage,
        creator: { "@type": "Person", name: "Pietro Francis Costa" },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: site.origin,
        description: descriptions["/"],
      };
  const head = `<title>${escape(title)}</title>
  <meta name='description' content='${escape(description)}'>
  <link rel='canonical' href='${canonical}'>
  ${!known || path === "/404.html" ? "<meta name='robots' content='noindex'>" : ""}
  <meta property='og:type' content='website'><meta property='og:title' content='${escape(title)}'><meta property='og:description' content='${escape(description)}'><meta property='og:url' content='${canonical}'><meta property='og:image' content='${socialImage}'><meta property='og:image:alt' content='${escape((p || projects[0]).posterAlt)}'><meta property='og:site_name' content='${site.name}'><meta name='twitter:card' content='summary_large_image'>
  <script type='application/ld+json'>${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  return {
    title,
    description,
    head,
    body: `<div id='top'></div>${header(path)}<main id='main' tabindex='-1'>${page}</main>${footer()}`,
    status: known && path !== "/404.html" ? 200 : 404,
  };
}
