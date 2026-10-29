import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { DITHER } from "../src/media/dither.ts";

// Keep the loader and paused homepage film on the same decoded frame.
const frame = execFileSync("ffmpeg", [
  "-v", "error", "-i", "public/media/time-block/jordan.mp4",
  "-vf", `select=eq(n\\,${Math.floor(DITHER.heroTime * 24)})`,
  "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-",
], { maxBuffer: 10_000_000 });
await sharp(frame).webp({ lossless: true }).toFile(`public${DITHER.heroImage}`);
console.log(`Prepared the Time Block intro at ${DITHER.heroTime}s.`);
