import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`video layers stay attached to scrolling content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/work/?noloader");
    const tile = page.locator("[data-dither]").first();
    await expect(tile).toHaveAttribute("data-live", "true");
    await page.evaluate(() => document.fonts.ready);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    // Read immediately after scrolling, before any scroll handler/rAF can run.
    // A viewport-fixed renderer moves independently and fails this assertion.
    const shift = await page.evaluate(() => {
      const canvas = document.querySelector(".dither-overlay")!;
      const tile = document.querySelector("[data-dither]")!;
      const before = [canvas.getBoundingClientRect().top, tile.getBoundingClientRect().top];
      scrollBy(0, 80);
      return [canvas.getBoundingClientRect().top - before[0], tile.getBoundingClientRect().top - before[1]];
    });
    expect(shift[0]).toBe(-80);
    expect(shift[1]).toBe(-80);

    for (const category of ["particle", "point-cloud", "time-block-work"]) {
      await page.locator(`.category-nav a[href='#${category}']`).click();
      const video = page.locator(`#${category} video`).first();
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBeTruthy();
      await expect.poll(() => page.evaluate(() => {
        const canvas = document.querySelector(".dither-overlay")!.getBoundingClientRect();
        return canvas.top <= 0 && canvas.bottom >= innerHeight - 1;
      })).toBeTruthy();
    }
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    const bounds = await page.locator(".dither-overlay").evaluate((canvas) => ({
      bottom: canvas.getBoundingClientRect().bottom + scrollY,
      height: canvas.getBoundingClientRect().height,
      viewport: innerHeight,
      content: document.querySelector("#app")!.getBoundingClientRect().bottom + scrollY,
    }));
    expect(bounds.bottom).toBeLessThanOrEqual(Math.ceil(bounds.content));
    expect(bounds.height).toBeLessThanOrEqual(bounds.viewport + 400);
    await page.evaluate(() => scrollTo(0, 0));
    await expect(tile).toHaveAttribute("data-live", "true");
    await expect.poll(() => page.locator(".dither-overlay").evaluate((c) => c.getBoundingClientRect().top)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
  });
}

test("clean hero playback avoids frame copies and video pixel readbacks", async ({ page }) => {
  await page.addInitScript(() => {
    const counts = { uploads: 0, readbacks: 0 };
    (window as any).mediaCounts = counts;
    const upload = WebGL2RenderingContext.prototype.texImage2D;
    WebGL2RenderingContext.prototype.texImage2D = function (...args: any[]) {
      if (args.some((arg) => arg instanceof HTMLVideoElement && arg.hasAttribute("data-hero-video"))) counts.uploads++;
      return (upload as any).apply(this, args);
    };
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args: any[]) {
      if (args[0] instanceof HTMLVideoElement) counts.readbacks++;
      return (draw as any).apply(this, args);
    };
  });
  await page.goto("/?noloader");
  const hero = page.locator("[data-hero]");
  const video = page.locator("[data-hero-video]");
  await expect(hero).toHaveAttribute("data-clean", "true");
  await expect(video).toHaveCSS("opacity", "1");
  const before = await page.evaluate(() => ({ ...(window as any).mediaCounts, time: document.querySelector<HTMLVideoElement>("[data-hero-video]")!.currentTime }));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(before.time + 1);
  expect(await page.evaluate(() => (window as any).mediaCounts)).toEqual({ uploads: before.uploads, readbacks: 0 });
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBeTruthy();
  await page.getByRole("button", { name: "Resume motion" }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBeTruthy();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).toBeHidden();
  await expect(hero.locator(".dither-poster")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero).toHaveAttribute("data-clean", "true");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBeTruthy();
});

test("card reveal returns to live dither without video frame callbacks", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback", { value: undefined });
    let uploads = 0;
    const upload = WebGL2RenderingContext.prototype.texImage2D;
    WebGL2RenderingContext.prototype.texImage2D = function (...args: any[]) {
      if (args.some((arg) => arg instanceof HTMLVideoElement)) uploads++;
      (window as any).videoUploads = uploads;
      return (upload as any).apply(this, args);
    };
  });
  await page.goto("/work/?noloader");
  const card = page.locator("#particle .work-card-link").first();
  const tile = card.locator("[data-dither]");
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(tile).toHaveAttribute("data-clean", "true");
  await page.mouse.move(1, 1);
  await expect(tile).not.toHaveAttribute("data-clean", "true");
  await expect(tile).toHaveAttribute("data-live", "true");
  const before = await page.evaluate(() => (window as any).videoUploads || 0);
  await expect.poll(() => page.evaluate(() => (window as any).videoUploads)).toBeGreaterThan(before + 2);
});
