import { categories, entries, visibleEntries, routeList, site, pointCloudPoster, type Entry, type Still, type Film } from './content/work';
import { fallbackPath } from './media/dither';

export { entries, categories };
export const previewBuild = __PREVIEW__;
export const productionRoutes = routeList(false);
export const routes = routeList(previewBuild);
export const escape = (value: string | number) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const external = `<span aria-hidden='true'>↗</span>`;
const categoryFor = (entry: Entry) => categories.find(c => c.slug === entry.category)!;
const copySlot = (text: string, preview: boolean) => preview ? `<p class='copy-slot' data-copy-needed>${escape(text)}</p>` : '';
const focus = (point: readonly [number, number] = [50, 50]) => `${point[0]}% ${point[1]}%`;

function media(still: Still, options: { loop?: Film; hero?: boolean; entryFocus?: readonly [number, number] } = {}) {
  const { loop, hero } = options;
  return `<div class='media-tile${hero ? ' hero-media' : ''}' data-dither${hero ? " data-hero" : ''} style='--focus:${escape(focus(still.focus || options.entryFocus))}'>
    <img class='dither-poster' src='${escape(fallbackPath(still.src))}' data-clean-src='${escape(still.src)}' alt='${escape(still.alt)}' width='${still.width}' height='${still.height}' ${hero ? "fetchpriority='high' loading='eager'" : "loading='lazy'"} decoding='async'>
    <img class='clean-poster' src='${escape(still.src)}' alt='' aria-hidden='true' width='${still.width}' height='${still.height}' loading='${hero ? 'eager' : 'lazy'}' decoding='async'>
    ${loop ? `<video data-loop${hero ? ' data-hero-video autoplay' : ''} data-src='${escape(loop.src)}' muted loop playsinline preload='none' poster='${escape(fallbackPath(still.src))}' width='${loop.width}' height='${loop.height}' aria-hidden='true' tabindex='-1'></video>` : ''}
  </div>`;
}

function card(p: Entry, preview: boolean) {
  return `<article class='work-card${p.draft ? ' draft-card' : ''}'>
    <a class='work-card-link' href='/work/${escape(p.slug)}/'>
      ${p.media.poster ? media(p.media.poster, { loop: p.media.loop, entryFocus: p.focus }) : `<div class='media-placeholder'><span>Draft / media needed</span></div>`}
      <div class='card-caption'><h3>${escape(p.title)}</h3><span>${p.draft ? 'Preview only' : escape(p.medium.join(' / '))}</span></div>
    </a>
    ${p.draft ? copySlot(p.needed?.[0] || 'Project details needed.', preview) : ''}
  </article>`;
}

function header(path: string) {
  return `<a class='skip-link' href='#main'>Skip to content</a>
  <header class='site-header'>
    <a class='wordmark' href='/' aria-label='phro.design home'>phro.design</a>
    <div class='header-actions'><button type='button' data-motion-toggle hidden>Pause motion</button><button class='menu-toggle' type='button' data-menu-toggle aria-expanded='false' aria-controls='site-nav' hidden>Menu +</button></div>
    <nav class='site-nav' id='site-nav' aria-label='Main navigation'>${['Work', 'About', 'Contact'].map(name => {
      const href = `/${name.toLowerCase()}/`;
      return `<a href='${href}'${path === href ? " aria-current='page'" : path.startsWith(href) ? " class='in-section'" : ''}>${name}</a>`;
    }).join('')}</nav>
  </header>`;
}

const footer = () => `<footer class='site-footer wrap'><a class='footer-email' href='mailto:${escape(site.email)}'>${escape(site.email)}</a><div class='footer-bottom'><span>phro.design</span><a href='${escape(site.instagram)}'>Instagram ${external}</a></div></footer>`;

function home(preview: boolean) {
  const jordan = entries.find(p => p.slug === 'jordan')!;
  return `<section class='hero' aria-label='Jordan — Time Block film'>
    ${media(jordan.media.poster!, { loop: jordan.media.loop, hero: true })}
    <div class='hero-caption'><a href='/work/jordan/'>Jordan / Time Block</a><button type='button' data-hero-play hidden>Play film</button><a href='/work/'>View work</a></div>
    <noscript><a class='hero-static-play' href='/work/jordan/'>Play Jordan</a></noscript>
  </section>
  <section class='identity wrap'><h1>${escape(site.identity)}</h1></section>
  <section class='home-work wrap' aria-labelledby='selected-title'><div class='section-heading'><h2 id='selected-title'>Selected work</h2><a href='/work/'>Full index</a></div><div class='work-grid'>${[entries.find(p => p.slug === 'water-dance')!, entries.find(p => p.slug === 'ozzy')!].map(p => card(p, preview)).join('')}</div></section>
  <div class='home-tool wrap'><a href='/work/time-block-addon/'>Time Block — the Blender add-on</a><span>Tool &amp; practice</span></div>`;
}

function work(preview: boolean) {
  const projects = visibleEntries(preview);
  return `<section class='page-intro wrap'><h1>Work</h1><p>Moving image, tools, objects.</p>
    <nav class='category-nav' aria-label='Work disciplines'>${categories.map(c => `<a href='#${escape(c.slug)}'>${escape(c.title)}</a>`).join('')}</nav></section>
    <div class='work-index wrap'>${categories.map(c => `<section class='category-section' id='${escape(c.slug)}' aria-labelledby='heading-${escape(c.slug)}'>
      <div class='category-heading'><h2 id='heading-${escape(c.slug)}'>${escape(c.title)}</h2>${c.descriptionDraft ? copySlot(c.description, preview) : `<p>${escape(c.description)}</p>`}</div>
      <div class='work-grid'>${projects.filter(p => p.category === c.slug).map(p => card(p, preview)).join('')}</div>
      ${c.related?.map(slug => { const p = entries.find(e => e.slug === slug)!; return `<p class='cross-reference'>Also: <a href='/work/${escape(p.slug)}/'>${escape(p.title)}</a> — depth workflow, listed under VFX.</p>`; }).join('') || ''}
    </section>`).join('')}</div>`;
}

function film(p: Entry) {
  const f = p.media.film!;
  const candidate = f.src.replace(/\.mp4$/, "-1080.mp4");
  const hd = f.hd || (__HD_MEDIA__.includes(candidate) ? candidate : undefined);
  return `<figure class='film'><video controls playsinline preload='none' width='${f.width}' height='${f.height}' poster='${escape(p.media.poster!.src)}' aria-label='${escape(p.title)}, silent film' data-project-video>
    ${hd ? `<source src='${escape(hd)}' type='video/mp4' media='(min-width: 701px)'>` : ''}<source src='${escape(f.src)}' type='video/mp4'>
    <p>Your browser cannot play this film. <a href='${escape(f.src)}'>Open the MP4</a>.</p></video>
    <figcaption><span>${escape(p.title)}</span><span>${f.duration ? `${f.duration.toFixed(2)} s · ` : ''}${f.fps ? `${f.fps} fps · ` : ''}Silent</span><a href='${escape(f.src)}'>Open film</a></figcaption>
    <p class='media-error' data-video-error hidden>The film could not load. <a href='${escape(f.src)}'>Open the MP4</a>.</p></figure>`;
}

function youtube(p: Entry) {
  return `<div class='youtube-facade' data-youtube='${escape(p.media.youtubeId!)}' data-video-title='${escape(p.title)}'>
    ${media(p.media.poster!)}<button class='youtube-play' data-youtube-load type='button' hidden><span aria-hidden='true'>▶</span> Play full video</button>
    <noscript><a class='youtube-play' href='${escape(p.links!.video!)}'>Watch on YouTube ${external}</a></noscript>
  </div><p class='film-note'>Full music video · VFX by Pietro Francis Costa. <a href='${escape(p.links!.video!)}'>YouTube ${external}</a></p>`;
}

function projectPage(p: Entry, preview: boolean) {
  const c = categoryFor(p);
  return `<section class='project-intro wrap'><a class='breadcrumb' href='/work/#${escape(c.slug)}'>${escape(c.title)}</a><h1>${escape(p.title)}</h1>
    <div class='project-meta'><span>${escape(p.medium.join(' / '))}</span>${p.year ? `<span>${p.year}</span>` : ''}${p.tools.length ? `<span>${escape(p.tools.join(' / '))}</span>` : ''}</div>
    ${p.draft ? `<p class='draft-badge'>Draft / preview only</p>` : ''}
    ${p.description ? p.descriptionDraft ? copySlot(p.description, preview) : `<p class='project-description'>${escape(p.description)}</p>` : copySlot('[Copy needed: project description.]', preview)}</section>
    <section class='project-media wrap' aria-label='${escape(p.title)} media'>${p.media.film ? film(p) : p.media.youtubeId ? youtube(p) : p.media.poster ? `<figure>${media(p.media.poster)}${p.media.poster.caption ? `<figcaption>${escape(p.media.poster.caption)}</figcaption>` : ''}</figure>` : `<div class='media-placeholder'><span>Draft / media needed</span></div>`}</section>
    ${p.tool ? `<section class='tool-details wrap' aria-label='Add-on details'><dl><div><dt>Version listed on Gumroad</dt><dd>${escape(p.tool.version)}</dd></div><div><dt>Price</dt><dd>${escape(p.tool.price)}</dd></div><div><dt>License</dt><dd>${escape(p.tool.license)}</dd></div></dl><p class='film-note'>Store details checked ${escape(p.tool.checked)}.</p><a class='button' href='${escape(p.links!.store!)}'>Get Time Block on Gumroad ${external}</a><p><a href='/work/#time-block-work'>See work made with Time Block</a></p></section>` : ''}
    ${p.credits?.length ? `<section class='credits wrap' aria-label='Credits'><dl>${p.credits.map(credit => `<div><dt>${escape(credit.role)}</dt><dd>${escape(credit.artist)}</dd></div>`).join('')}</dl></section>` : ''}
    ${p.media.stills?.length ? `<section class='stills-section wrap' aria-labelledby='stills-heading'><h2 id='stills-heading'>Stills</h2><div class='stills-grid'>${p.media.stills.map(s => `<figure tabindex='0'>${media(s, { entryFocus: p.focus })}<figcaption>${escape(s.caption || p.title)}</figcaption></figure>`).join('')}</div></section>` : ''}
    ${p.process?.length ? `<section class='process-section wrap' aria-labelledby='process-heading'><h2 id='process-heading'>Process</h2><div class='process-grid'>${p.process.map(m => `<figure tabindex='0'>${media(m.still, { loop: m.video })}<figcaption>${escape(m.label)}</figcaption></figure>`).join('')}</div></section>` : ''}
    ${preview && p.needed?.length ? `<aside class='media-checklist wrap' aria-labelledby='needed-heading'><h2 id='needed-heading'>To supply / preview only</h2><ul>${p.needed.map(n => `<li>${escape(n)}</li>`).join('')}</ul></aside>` : ''}
    <div class='project-return wrap'><a href='/work/'>All work</a></div>`;
}

function pointCloud() {
  return `<section class='about-scene wrap' aria-labelledby='viewer-heading'><h2 id='viewer-heading'>Point cloud</h2>
    <div class='spatial-stage' data-splat-stage><div class='splat-mount' data-splat-mount aria-label='3D scene viewport' aria-describedby='viewer-help' tabindex='-1'></div>
    <div class='splat-cover' data-splat-cover>${media(pointCloudPoster)}<div class='splat-gate'><button class='button' data-splat-load type='button' hidden>Explore the point cloud</button><span class='download-note'>22.6 MB · Load on request</span><noscript><p>Enable JavaScript to explore the capture in 3D.</p></noscript></div></div></div>
    <div class='viewer-controls' data-splat-controls hidden><button type='button' data-orbit='left' aria-label='Rotate scene left'>Rotate left</button><button type='button' data-orbit='right' aria-label='Rotate scene right'>Rotate right</button><button type='button' data-zoom='in'>Zoom in</button><button type='button' data-zoom='out'>Zoom out</button><button type='button' data-splat-reset>Reset view</button><button type='button' data-splat-close>Close scene</button></div>
    <p class='experiment-status' data-splat-status role='status' aria-live='polite'></p><p id='viewer-help' class='film-note'>Drag to orbit. Scroll or pinch to zoom. With the scene focused, use the arrow keys and + / −.</p></section>`;
}

function about(preview: boolean) {
  return `<section class='page-intro wrap'><h1>About</h1><p>${escape(site.identity)}</p></section><div class='about-copy wrap'><p>I work with video, depth and real-world captures to build objects that show how they were made.</p>${copySlot('[Copy needed: final biography and practice statement.]', preview)}</div>${pointCloud()}`;
}
function contact() {
  return `<section class='page-intro contact-intro wrap'><h1>Contact</h1><a class='email-link' href='mailto:${escape(site.email)}'>${escape(site.email)}</a><button class='copy-email' data-copy-email='${escape(site.email)}' type='button' hidden>Copy email address</button><p data-copy-status role='status' aria-live='polite'></p></section><nav class='contact-links wrap' aria-label='Elsewhere'>${[['Instagram', site.instagram], ['YouTube', site.youtube], ['TikTok', site.tiktok]].map(([name, url]) => `<a href='${escape(url)}'>${escape(name)} ${external}</a>`).join('')}</nav>`;
}
const missing = () => `<section class='page-intro not-found wrap'><h1>Page not found</h1><p>This address is outside the index.</p><a class='button' href='/work/'>Explore the work</a></section>`;

export function render(pathname: string, preview = previewBuild) {
  const path = pathname === '/404.html' ? pathname : '/' + pathname.split('/').filter(Boolean).join('/') + (pathname.split('/').join('') ? '/' : '');
  const p = visibleEntries(preview).find(e => path === `/work/${e.slug}/`);
  const known = routeList(preview).includes(path) && path !== '/404.html';
  const titles: Record<string, string> = { '/': site.identity + ' — phro.design', '/work/': 'Work — phro.design', '/about/': 'About — phro.design', '/contact/': 'Contact — phro.design' };
  const descriptions: Record<string, string> = { '/': site.identity, '/work/': 'Films, tools and objects by Pietro Francis Costa, grouped by discipline.', '/about/': 'The moving image practice of Pietro Francis Costa.', '/contact/': 'Contact Pietro Francis Costa at phro.design.' };
  const title = p ? `${p.title}${p.category === 'time-block-addon' ? ' — Blender add-on' : ''} — phro.design` : titles[path] || 'Page not found — phro.design';
  const description = p ? p.description || `${p.title}. ${categoryFor(p).title} by Pietro Francis Costa.` : descriptions[path] || 'This page could not be found. Explore the work at phro.design.';
  const canonical = site.origin + (known ? path : '/404.html');
  const poster = p?.media.poster || entries.find(e => e.slug === 'jordan')!.media.poster!;
  const schema = { '@context': 'https://schema.org', '@type': p ? 'CreativeWork' : 'WebSite', name: p?.title || site.name, url: canonical, description, image: site.origin + poster.src };
  const head = `<title>${escape(title)}</title><meta name='description' content='${escape(description)}'><link rel='canonical' href='${escape(canonical)}'>
    ${!known || preview ? "<meta name='robots' content='noindex'>" : ''}
    <meta property='og:type' content='${p ? 'video.other' : 'website'}'><meta property='og:title' content='${escape(title)}'><meta property='og:description' content='${escape(description)}'><meta property='og:url' content='${escape(canonical)}'><meta property='og:image' content='${escape(site.origin + poster.src)}'><meta property='og:image:alt' content='${escape(poster.alt)}'><meta property='og:site_name' content='${escape(site.name)}'><meta name='twitter:card' content='summary_large_image'>
    <script type='application/ld+json'>${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  const page = p ? projectPage(p, preview) : path === '/' ? home(preview) : path === '/work/' ? work(preview) : path === '/about/' ? about(preview) : path === '/contact/' ? contact() : missing();
  return { title, description, head, body: `${header(path)}<main id='main' tabindex='-1'>${page}</main>${footer()}`, status: known ? 200 : 404 };
}
