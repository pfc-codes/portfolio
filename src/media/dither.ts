/** One source for the loader, WebGL tiles and build-time images. */
export const DITHER = {
  matrix: [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
  bg: [0, 0, 0],
  ink: [237, 237, 237],
  dot: [36, 36, 36],
  weights: [0.299, 0.587, 0.114],
  blackCutoff: 6,
  whitePercentile: 0.02,
  minimumWhite: 60,
  gamma: 0.8,
  // The original stretched Time Block composition, aligned to a delivered frame.
  heroImage: "/media/time-block/intro.webp",
  heroTime: 6.42, // Inside frame 154 at 24 fps, avoiding a seek on its boundary.
  heroCrop: [32, 472, 688, 344],
} as const;

export function whitePoint(
  data: ArrayLike<number>,
  pixels = data.length / 4,
): number {
  const hist = new Uint32Array(256);
  let count = 0;
  for (let i = 0; i < pixels; i++) {
    const l = Math.floor(
      data[i * 4] * DITHER.weights[0] +
        data[i * 4 + 1] * DITHER.weights[1] +
        data[i * 4 + 2] * DITHER.weights[2],
    );
    if (l > DITHER.blackCutoff) {
      hist[l]++;
      count++;
    }
  }
  let white = 255,
    sum = 0;
  for (let v = 255; v > 0; v--) {
    sum += hist[v];
    if (sum > count * DITHER.whitePercentile) {
      white = v;
      break;
    }
  }
  return Math.max(white, DITHER.minimumWhite);
}

export const toneMap = (
  r: number,
  g: number,
  b: number,
  white: number,
): number =>
  Math.pow(
    Math.min(
      1,
      (r * DITHER.weights[0] + g * DITHER.weights[1] + b * DITHER.weights[2]) /
        white,
    ),
    DITHER.gamma,
  );

export const threshold = (x: number, y: number): number =>
  (DITHER.matrix[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
export const fallbackPath = (path: string): string =>
  path.replace(/\.[^.]+$/, ".dither.png");
