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
  `<img src='${p.poster}' alt='${escape(p.visualDescription.replace(" The film is silent.", ""))}' width='900' height='1600' ${eager ? "fetchpriority='high' loading='eager'" : "loading='lazy'"} decoding='async'>`;
const card = (p: Project, eager = false) => `<article class='project-card'>
  <a class='project-link' href='/work/${p.slug}/'>
    <div class='project-image'>${image(p, eager)}<span class='media-caption'>${p.study} <span>${p.duration.toFixed(2)} s</span></span><span class='project-open' aria-hidden='true'>↗</span></div>
    <div class='project-heading'><span class='index'>${p.number}</span><h3>${p.title}</h3><span class='project-arrow' aria-hidden='true'>↗</span></div>
    <p class='project-category'>${p.category}</p>
  </a>
  <p class='project-summary'>${p.summary}</p>
</article>`;

function header(path: string) {
  return `<a class='skip-link' href='#main'>Skip to content</a>
  <header class='site-header wrap'>
    <a class='wordmark' href='/' aria-label='phro.design home'>phro<span class='brand-dot'>.</span><span class='wordmark-tail'>design</span></a>
    <button class='menu-toggle' type='button' data-menu-toggle aria-expanded='false' aria-controls='site-nav' hidden>Menu <span aria-hidden='true'>+</span></button>
    <nav class='site-nav' id='site-nav' aria-label='Main navigation'>${[
      "Work",
      "Lab",
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
  </section>
  <section class='lab-teaser wrap'><div>${label("Inside the Lab")}<h2>A place to<br><em>pull things apart.</em></h2><p>Interactive studies in frames, depth, and reconstruction. Open an experiment and explore it at your own pace.</p><a class='button button-dark' href='/lab/'>Enter the Lab ${arrow}</a></div><a class='lab-art' href='/lab/frame-study/' aria-label='Open the frame study'><div class='frame-stack' aria-hidden='true'><img src='${projects[1].frames[0].src}' alt='' loading='lazy' width='480' height='853'><img src='${projects[1].poster}' alt='' loading='lazy' width='900' height='1600'><img src='${projects[1].frames[1].src}' alt='' loading='lazy' width='480' height='853'></div><span class='mono'>LAB / 01 — A gesture, frame by frame ${arrow}</span></a></section>`;
}

function work() {
  return `<section class='page-intro wrap'>${label("Index / Work", "02 selected projects")}<h1>Time in<br><em>another dimension.</em></h1><div class='intro-bottom'><p>Studies in temporal manipulation, experimental video, and spatial media.</p><span class='mono'>Moving image → Spatial object</span></div></section>
    <section class='wrap work-index' aria-labelledby='work-title'><h2 id='work-title' class='sr-only'>Project index</h2><div class='project-grid'>${projects.map((p, i) => card(p, i === 0)).join("")}</div></section>
    <section class='wrap adjacent-work'>${label("Elsewhere / Digital design")}<h2>Across the web.</h2><div class='external-list'>${[
      ["Pietro Costa", "https://pietrocosta.com"],
      ["Whitespace Projects", "https://whitespaceprojectsnapoli.com"],
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
    <div class='film-stage'><video controls playsinline preload='none' width='720' height='1280' poster='${p.poster}' aria-label='${p.title}: ${p.study}, silent film' aria-describedby='film-description' src='${p.video}' data-project-video><p>Your browser cannot play this film. <a href='${p.video}'>Open the MP4.</a></p></video></div>
    <figcaption><span>${p.study} / ${p.title}</span><span>${p.duration.toFixed(2)} s · ${p.fps} fps · Silent</span><a href='${p.video}'>Open film ${arrow}</a></figcaption>
    <details class='visual-description'><summary>Visual description</summary><p id='film-description'>${p.visualDescription}</p></details>
    <p class='media-error' data-video-error hidden>The film could not load. <a href='${p.video}'>Open the MP4 directly</a>, or explore the stills below.</p>
  </figure>`;
}

function projectPage(p: Project) {
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return `<section class='project-intro wrap'>${label(`<a href='/work/'>Work</a> / ${p.number}`, p.category)}<h1>${p.title}<span class='title-period'>.</span></h1><div class='project-deck'><p>${p.summary}</p><span class='mono'>Study / ${p.study}</span></div></section>
  <section class='wrap project-film' aria-label='${p.title} film'>${film(p)}</section>
  <section class='wrap project-notes'>${label("01 / The study")}<div><h2>A different way<br>to see a moment.</h2><p>${p.description}</p><p>${p.observation}</p></div></section>
  <section class='wrap frames-section' aria-labelledby='frames-title'><div class='section-heading'><h2 id='frames-title'>Fragments of a gesture.</h2><span class='mono'>02 / Selected frames</span></div><div class='frames-grid'>${p.frames.map((f) => `<figure><img src='${f.src}' alt='${f.alt}' width='480' height='853' loading='lazy'><figcaption>${p.study}<span>${f.time}</span></figcaption></figure>`).join("")}</div></section>
  <section class='wrap project-lab-link'><span class='mono'>Look a little closer</span><h2>Pause. Move through it.<br>Find another moment.</h2><a class='text-link' href='/lab/frame-study/?project=${p.slug}'>Explore this film in the Lab ${arrow}</a></section>
  <a class='next-project wrap' href='/work/${next.slug}/'><span class='mono'>Next project / ${next.number}</span><span>${next.title} ${arrow}</span></a>`;
}

function lab() {
  return `<section class='page-intro lab-intro wrap'>${label("Index / Lab", "Interactive studies")}<h1>Keep<br><em>experimenting.</em></h1><div class='intro-bottom'><p>A working space for images, spatial experiments, and small tools. Start with a moment or step inside a reconstruction.</p><span class='mono'>Observe / Interact / Repeat</span></div></section>
  <section class='wrap lab-index' aria-label='Experiments'>
    <article class='lab-entry'><span class='index'>01</span><div><span class='mono'>Moving image / Frame explorer</span><h2><a href='/lab/frame-study/'>Between frames ${arrow}</a></h2><p>Move through Time Block and Depth Echo at your own pace. Pause on a gesture, compare its shape, and look again.</p><a class='text-link' href='/lab/frame-study/'>Open the frame study ${arrow}</a></div><a class='lab-thumb' href='/lab/frame-study/' tabindex='-1' aria-hidden='true'>${image(projects[1])}</a></article>
    <article class='lab-entry'><span class='index'>02</span><div><span class='mono'>3D reconstruction / Gaussian splats</span><h2><a href='/lab/spatial-study/'>A point of view ${arrow}</a></h2><p>A reconstruction made of points. Rotate, zoom, and change your perspective inside the site's original 3D scene.</p><a class='text-link' href='/lab/spatial-study/'>Open the spatial study ${arrow}</a></div><a class='lab-thumb spatial-thumb' href='/lab/spatial-study/' tabindex='-1' aria-hidden='true'><span class='point-glyph'>✳</span><span class='mono'>x / y / z</span></a></article>
  </section><section class='wrap lab-note'>${label("An ongoing practice")}<p>The Lab follows the questions behind the work: how images become spaces, how gestures leave traces, and what happens when time becomes a material.</p></section>`;
}

function spatialStudy() {
  return `<section class='experiment-intro wrap'>${label(`<a href='/lab/'>Lab</a> / 02`, "Spatial study")}<h1>A point of view<span class='title-period'>.</span></h1><p>A scene assembled from points. Move around it and watch its structure shift.</p></section>
  <section class='wrap experiment-space' aria-labelledby='viewer-heading'><h2 id='viewer-heading' class='sr-only'>Interactive 3D reconstruction</h2>
  <div class='spatial-stage' data-splat-stage><div class='splat-mount' data-splat-mount aria-label='3D scene viewport' tabindex='0'></div><div class='splat-cover' data-splat-cover><span class='point-glyph' aria-hidden='true'>✳</span><span class='mono'>Spatial reconstruction / Gaussian splats</span><p>The original phro.design scene, ready to explore.</p><button class='button button-light' data-splat-load type='button' hidden>Load the 3D scene <span aria-hidden='true'>↗</span></button><span class='download-note'>22.6 MB · Loads when you choose</span><noscript><p>Enable JavaScript to explore 3D, or <a href='/work/'>watch the project films</a>.</p></noscript></div></div>
  <div class='viewer-controls' data-splat-controls hidden><button type='button' data-orbit='left' aria-label='Rotate scene left'>← Rotate</button><button type='button' data-orbit='right' aria-label='Rotate scene right'>Rotate →</button><button type='button' data-zoom='in'>Zoom in +</button><button type='button' data-zoom='out'>Zoom out −</button><button type='button' data-splat-reset>Reset view</button><button type='button' data-splat-close>Close scene</button></div>
  <p class='experiment-status' data-splat-status role='status' aria-live='polite'>3D is optional. The scene stays unloaded until you open it.</p>
  <div class='experiment-notes'><div><h2>Find your perspective.</h2><p>Drag to orbit. Scroll or pinch to zoom. You can also use the buttons below the scene, or focus the viewport and use the arrow keys and + / −.</p></div><div><h2>About this scene.</h2><p>This is the Gaussian splat reconstruction from the original phro.design homepage, preserved as an interactive study. The scene uses points in space to form an image that changes with your viewpoint.</p><p>If 3D is unavailable on your device, <a href='/lab/frame-study/'>explore the frame study</a> or <a href='/work/'>watch the project films</a>.</p></div></div>
  </section>`;
}

function frameStudy() {
  return `<section class='experiment-intro wrap'>${label(`<a href='/lab/'>Lab</a> / 01`, "Frame study")}<h1>Between frames<span class='title-period'>.</span></h1><p>A small tool for looking closely. Choose a film and move through it one moment at a time.</p></section>
  <section class='wrap experiment-space frame-experiment' data-frame-experiment>
    <div class='frame-toolbar'><label for='film-select'>Study</label><select id='film-select' data-film-select>${projects.map((p) => `<option value='${p.slug}' data-src='${p.video}' data-poster='${p.poster}' data-fps='${p.fps}' data-duration='${p.duration}'>${p.title} — ${p.study}</option>`).join("")}</select><a class='text-link' href='/work/time-block/' data-study-link>View project ${arrow}</a></div>
    <div class='film-stage'><video controls playsinline preload='none' width='720' height='1280' poster='${projects[0].poster}' src='${projects[0].video}' data-frame-video aria-label='Time Block — Jordan, silent film'></video></div>
    <div class='frame-controls' data-frame-controls hidden><button class='button button-dark' type='button' data-frame-load>Load frame controls ${arrow}</button><div class='frame-buttons'><button type='button' data-frame-step='-1' disabled aria-label='Previous frame'>← Frame</button><button type='button' data-frame-play disabled>Play</button><button type='button' data-frame-step='1' disabled aria-label='Next frame'>Frame →</button></div><div class='scrubber'><label for='frame-range'>Position <output for='frame-range' data-frame-time aria-live='off'>00:00.00</output></label><input id='frame-range' data-frame-range type='range' min='0' max='13' value='0' step='0.0416667' disabled></div></div>
    <p class='experiment-status' role='status' aria-live='polite' data-frame-status>Use the video controls to watch. Load the frame controls to explore individual moments.</p>
    <div class='experiment-notes'><div><h2>Look at the in-between.</h2><p>Pause and use the frame buttons or position slider to explore the film. The controls seek in steps based on the original frame rate; browser seeking may land on a nearby decoded frame.</p></div><div><h2>A gesture becomes a shape.</h2><p>Watch how repeated forms emerge, overlap, and separate. Both films are silent and remain in their original portrait composition.</p><details><summary>Visual descriptions</summary>${projects.map((p) => `<p><strong>${p.title}:</strong> ${p.visualDescription}</p>`).join("")}</details></div></div>
  </section>`;
}

function about() {
  return `<section class='page-intro wrap'>${label("About / The practice", "Pietro Francis Costa")}<h1>Image.<br>Space. <em>Possibility.</em></h1><div class='intro-bottom'><p>I'm Pietro, the creative technologist behind phro.design. I work across moving image, digital design, and interactive experiences.</p></div></section>
  <section class='wrap about-practice'>${label("A practice across mediums")}<div><h2>I make things<br>that make me <em>look again.</em></h2><p>My practice brings together creative technology, experimental video, spatial media, and temporal manipulation. I work with 3D reconstruction, Blender tools, and code to investigate the space between an image and an experience.</p><p>Time Block and Depth Echo are part of that exploration: studies in how a moving image can become something spatial, layered, and open to another point of view.</p><a class='text-link' href='/work/'>Explore the work ${arrow}</a></div></section>
  <section class='wrap practice-areas' aria-labelledby='areas-title'><div class='section-heading'><h2 id='areas-title'>Ways of working.</h2><span class='mono'>Connected by curiosity</span></div>${[
    [
      "01",
      "Creative technology",
      "Code, prototypes, and interactive experiences.",
    ],
    ["02", "Moving image", "Experimental video and temporal manipulation."],
    ["03", "Spatial media", "3D reconstruction, depth, and Blender tools."],
    ["04", "Digital design", "Interfaces, websites, and digital experiences."],
  ]
    .map(
      ([number, title, text]) =>
        `<div class='practice-row'><span class='index'>${number}</span><h3>${title}</h3><p>${text}</p></div>`,
    )
    .join("")}</section>`;
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
        : path === "/lab/"
          ? lab()
          : path === "/lab/spatial-study/"
            ? spatialStudy()
            : path === "/lab/frame-study/"
              ? frameStudy()
              : path === "/about/"
                ? about()
                : path === "/contact/"
                  ? contact()
                  : missing();
  const titles: Record<string, string> = {
    "/": "phro.design — Time, given form",
    "/work/": "Work — phro.design",
    "/lab/": "Lab — phro.design",
    "/lab/spatial-study/": "A point of view — phro.design Lab",
    "/lab/frame-study/": "Between frames — phro.design Lab",
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
    "/lab/":
      "Interactive studies from phro.design. Explore moving images frame by frame or step inside a Gaussian splat reconstruction.",
    "/lab/spatial-study/":
      "Rotate, zoom, and explore the original phro.design Gaussian splat reconstruction in an optional interactive 3D viewer.",
    "/lab/frame-study/":
      "Explore Time Block and Depth Echo frame by frame with an interactive film study tool.",
    "/about/":
      "Meet Pietro Francis Costa, the creative technologist behind phro.design, working across moving image, spatial media, Blender tools, and digital design.",
    "/contact/":
      "Get in touch with Pietro Francis Costa at phro.design for creative technology, moving image, spatial media, and digital design collaborations.",
  };
  const description =
    p?.summary ||
    descriptions[path] ||
    "This page could not be found. Explore the work at phro.design.";
  const canonical = `${site.origin}${known ? path : "/404.html"}`;
  const socialImage = `${site.origin}${p?.poster || projects[0].poster}`;
  const schema = p
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: p.title,
        description: p.description,
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
  <meta property='og:type' content='website'><meta property='og:title' content='${escape(title)}'><meta property='og:description' content='${escape(description)}'><meta property='og:url' content='${canonical}'><meta property='og:image' content='${socialImage}'><meta property='og:image:alt' content='${escape((p || projects[0]).visualDescription)}'><meta property='og:site_name' content='${site.name}'><meta name='twitter:card' content='summary_large_image'>
  <script type='application/ld+json'>${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  return {
    title,
    description,
    head,
    body: `<div id='top'></div>${header(path)}<main id='main' tabindex='-1'>${page}</main>${footer()}`,
    status: known && path !== "/404.html" ? 200 : 404,
  };
}
