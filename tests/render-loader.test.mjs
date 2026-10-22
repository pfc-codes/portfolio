import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const html = await readFile("src/boot/render-loader.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Run the shipped loader with a deterministic clock and a minimal DOM/canvas.
// These checks exercise entry, session state, and recovery without a GPU.
function boot(options = {}) {
  let now = 0, nextTimer = 0, frames = [];
  const timers = new Map();
  const storage = options.storage || new Map();
  const elements = new Map();
  let activeElement;
  const context = {
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {}, fillRect() {}, clearRect() {}, drawImage() {},
    fillText() {}, beginPath() {}, arc() {}, fill() {},
    measureText: (text) => ({ width: text.length * 10 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  };
  function element(tag) {
    const attrs = new Map(), listeners = new Map(), classes = new Set();
    const node = {
      tagName: tag.toUpperCase(), style: {}, children: [], hidden: false,
      textContent: "", parentNode: null,
      classList: {
        add: (value) => classes.add(value),
        remove: (value) => classes.delete(value),
        contains: (value) => classes.has(value),
      },
      setAttribute: (key, value) => attrs.set(key, String(value)),
      getAttribute: (key) => attrs.get(key) ?? null,
      removeAttribute: (key) => attrs.delete(key),
      addEventListener: (event, handler) => listeners.set(event, handler),
      focus: () => { activeElement = node; },
      click: () => { if (!node.hidden && !node.disabled) listeners.get("click")?.(); },
      appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
      removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; },
      get firstChild() { return this.children[0]; },
      get lastChild() { return this.children.at(-1); },
      getContext: () => options.canvasFailure ? null : context,
      set innerHTML(value) {
        assert.ok(value.includes('type="button" hidden>Click to enter</button>'));
        const win = element("div"), head = element("div"), canvas = element("canvas");
        const bar = element("i"), foot = [element("span"), element("span")];
        const enter = element("button");
        enter.hidden = true;
        enter.textContent = "Click to enter";
        this.appendChild(win);
        win.appendChild(enter);
        const selectors = { canvas, ".pcl-head": head, ".pcl-bar i": bar, ".pcl-enter": enter };
        this.querySelector = (selector) => selectors[selector];
        this.querySelectorAll = () => foot;
        elements.set("overlay", this);
        elements.set("enter", enter);
        elements.set("percentage", foot[1]);
      },
    };
    return node;
  }
  const root = element("html"), body = element("body"), main = element("main");
  const sandbox = {
    document: {
      documentElement: root, body: options.missingBody ? null : body,
      readyState: options.loading ? "loading" : "complete",
      createElement: element,
      getElementById: (id) => id === "main" ? main : null,
    },
    window: { innerWidth: 1280, innerHeight: 800, addEventListener() {}, matchMedia() {} },
    matchMedia: () => ({ matches: Boolean(options.reduce) }),
    navigator: { webdriver: false }, location: { search: options.search || "" },
    sessionStorage: {
      getItem(key) { if (options.blockedStorage) throw Error("Storage blocked"); return storage.get(key); },
      setItem(key, value) { if (options.blockedStorage) throw Error("Storage blocked"); storage.set(key, value); },
    },
    performance: { now: () => now },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: (callback) => frames.push(callback),
    Image: class { set src(value) { if (options.imageFailure) this.onerror(); else this.onload(); } },
  };
  runInNewContext(script, sandbox);
  return {
    root, body, main, storage, elements,
    get activeElement() { return activeElement; },
    get pendingFrames() { return frames.length; },
    advance(duration) {
      const until = now + duration;
      while (now < until) {
        now = Math.min(now + 16, until);
        const batch = frames;
        frames = [];
        for (const callback of batch) callback(now);
        for (const [id, timer] of timers) {
          if (timer.at <= now) { timers.delete(id); timer.callback(); }
        }
      }
    },
  };
}

test("render lasts 50% longer, then waits for entry and remembers the session", () => {
  const page = boot();
  const enter = page.elements.get("enter");
  page.advance(3899);
  assert.equal(enter.hidden, true);
  assert.equal(page.storage.has("pcl-seen"), false);
  page.advance(200);
  assert.equal(enter.tagName, "BUTTON");
  assert.equal(enter.hidden, false);
  assert.equal(page.elements.get("percentage").textContent, "100%");
  assert.equal(page.elements.get("overlay").getAttribute("role"), "dialog");
  assert.equal(page.activeElement, enter);
  page.advance(30000);
  assert.equal(page.root.classList.contains("pcl-on"), true);
  assert.equal(page.pendingFrames, 0, "Completed render stops animating");
  assert.equal(page.storage.has("pcl-seen"), false);
  enter.click();
  assert.equal(page.root.classList.contains("pcl-on"), false);
  assert.equal(page.activeElement, page.main);
  assert.equal(page.storage.get("pcl-seen"), "1");
  page.advance(800);
  assert.equal(page.body.children.length, 0);
  const nextPage = boot({ storage: page.storage });
  assert.equal(nextPage.elements.has("overlay"), false);
});

test("a slow page load reaches the entry prompt at the animation deadline", () => {
  const page = boot({ loading: true, imageFailure: true });
  page.advance(13499);
  assert.equal(page.elements.get("enter").hidden, true);
  page.advance(1);
  assert.equal(page.elements.get("enter").hidden, false);
  assert.equal(page.root.classList.contains("pcl-on"), true);
  page.elements.get("enter").click();
  assert.equal(page.root.classList.contains("pcl-on"), false);
});

test("reduced motion retains a short static intro and supports blocked storage", () => {
  const page = boot({ reduce: true, blockedStorage: true });
  page.advance(1000);
  assert.equal(page.elements.get("enter").hidden, false);
  page.elements.get("enter").click();
  assert.equal(page.root.classList.contains("pcl-on"), false);
});

test("canvas failure or an unavailable body reveals the page instead of trapping visitors", () => {
  for (const options of [{ canvasFailure: true }, { missingBody: true }]) {
    const page = boot(options);
    page.advance(14000);
    assert.equal(page.root.classList.contains("pcl-on"), false);
    assert.equal(page.body.children.length, 0);
  }
  assert.equal(boot({ search: "?noloader" }).elements.has("overlay"), false);
});
