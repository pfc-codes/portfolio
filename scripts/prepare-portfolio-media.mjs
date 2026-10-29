import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, statSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

// Run from the repository root. Originals remain outside public/ and Git.
const root = process.argv[2];
if (!root) throw new Error("Usage: node scripts/prepare-portfolio-media.mjs <portfolio-assets/media> [entry-slug]");
const allSources = JSON.parse(readFileSync("scripts/media-sources.json", "utf8"));
const selected = process.argv[3];
const sources = allSources.filter((item) => !selected || item.slug === selected);
if (!sources.length) throw new Error(`Unknown entry: ${selected}`);
const limit = 25 * 1024 * 1024;
const probe = (path) => JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-show_streams", "-show_format", "-of", "json", path,
], { encoding: "utf8" }));
const rate = (value) => {
  const [n, d = 1] = value.split("/").map(Number);
  return n / d;
};
const dimensions = (video, short, long) => {
  const scale = Math.min(1, short / Math.min(video.width, video.height), long / Math.max(video.width, video.height));
  return [Math.floor(video.width * scale / 2) * 2, Math.floor(video.height * scale / 2) * 2];
};
const ffmpeg = (args) => execFileSync("ffmpeg", [
  "-nostdin", "-hide_banner", "-loglevel", "error", "-y", ...args,
], { stdio: "inherit" });
const checkSize = (path) => {
  const bytes = statSync(path).size;
  if (bytes >= limit) throw new Error(`Cloudflare 25 MiB limit exceeded: ${path} (${bytes} bytes)`);
  return bytes;
};
const metadata = (path, url) => {
  const info = probe(path);
  const video = info.streams.find((s) => s.codec_type === "video");
  return {
    src: url, width: video.width, height: video.height,
    duration: Number(info.format.duration), fps: Number(rate(video.r_frame_rate).toFixed(3)),
    audio: info.streams.some((s) => s.codec_type === "audio"),
  };
};
// Validate the complete inventory before changing any delivered asset.
const inputs = sources.map((item) => {
  const path = resolve(root, item.source);
  const info = probe(path);
  return { ...item, path, info };
});
const media = selected ? JSON.parse(readFileSync("src/content/imported-media.json", "utf8")) : {};
const inventory = selected ? JSON.parse(readFileSync("docs/media-inventory.json", "utf8")) : [];
for (const item of inputs) {
  const video = item.info.streams.find((s) => s.codec_type === "video");
  const duration = Number(item.info.format.duration);
  const fps = Math.min(30, rate(video.r_frame_rate));
  const directory = `public/media/${item.slug}`;
  const staging = `.generated/media/${item.slug}`;
  const url = `/media/${item.slug}`;
  mkdirSync(directory, { recursive: true });
  mkdirSync(staging, { recursive: true });
  const base = dimensions(video, 720, 1280);
  const hd = dimensions(video, 1080, 1920);
  const files = [];
  const encode = (name, size, loop = false) => {
    const path = `${directory}/${name}.mp4`;
    const temporary = `${staging}/${name}.mp4`;
    const maxrate = loop ? 1_000_000 : Math.min(6_000_000, Math.floor(22 * 1024 * 1024 * 8 / duration) - 128_000);
    ffmpeg([
      ...(loop ? ["-ss", String(Math.max(0, item.posterTime - 1))] : []),
      "-i", item.path, "-map", "0:v:0", ...(loop ? ["-an", "-t", "6"] : ["-map", "0:a:0?"]),
      "-vf", `scale=${size[0]}:${size[1]}:flags=lanczos,setsar=1,fps=${loop ? Math.min(24, fps) : fps}`,
      "-c:v", "libx264", "-threads", "4", "-preset", "slow", "-crf", loop ? "26" : "21",
      "-maxrate", String(maxrate), "-bufsize", String(maxrate * 2),
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
      "-map_metadata", "-1", "-movflags", "+faststart", temporary,
    ]);
    // Reject corrupt or oversized files before replacing a previous deliverable.
    ffmpeg(["-xerror", "-i", temporary, "-f", "null", "-"]);
    checkSize(temporary);
    renameSync(temporary, path);
    files.push({ path: `${url}/${name}.mp4`, bytes: checkSize(path) });
    return metadata(path, `${url}/${name}.mp4`);
  };
  const film = encode("film", base);
  if (hd[0] > base[0] || hd[1] > base[1]) film.hd = encode("film-1080", hd).src;
  const loop = encode("loop", dimensions(video, 480, 854), true);
  const posterPath = `${directory}/poster.webp`;
  ffmpeg(["-ss", String(item.posterTime), "-i", `${directory}/film.mp4`, "-frames:v", "1", "-c:v", "libwebp", "-quality", "88", posterPath]);
  files.push({ path: `${url}/poster.webp`, bytes: checkSize(posterPath) });
  media[item.slug] = { film, loop, poster: { src: `${url}/poster.webp`, width: film.width, height: film.height } };
  const record = {
    slug: item.slug, source: item.source,
    sourceBytes: statSync(item.path).size,
    sourceSha256: createHash("sha256").update(readFileSync(item.path)).digest("hex"),
    width: video.width, height: video.height, fps: rate(video.r_frame_rate), duration,
    audio: film.audio, posterTime: item.posterTime, files,
  };
  const index = inventory.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) inventory[index] = record;
  else inventory.push(record);
  console.log(`Prepared ${item.slug}: ${files.length} files, largest ${(Math.max(...files.map((f) => f.bytes)) / 1024 / 1024).toFixed(2)} MiB`);
}
writeFileSync("src/content/imported-media.json", JSON.stringify(media, null, 2) + "\n");
writeFileSync("docs/media-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
console.log(`Prepared ${inputs.length} supplied videos. Run npm run build to regenerate Bayer posters.`);
