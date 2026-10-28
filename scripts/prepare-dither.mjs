import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { allStills } from '../src/content/work.ts';
import { DITHER, fallbackPath, whitePoint, toneMap, threshold } from '../src/media/dither.ts';

const manifest = [];
for (const still of new Map(allStills().map(s => [s.src, s])).values()) {
  const { data, info } = await sharp(join('public', still.src)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const white = whitePoint(data);
  const output = Buffer.alloc(info.width * info.height * 3);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = y * info.width + x;
    const rgb = toneMap(data[i * 4], data[i * 4 + 1], data[i * 4 + 2], white) > threshold(x, y) ? DITHER.ink : DITHER.bg;
    output.set(rgb, i * 3);
  }
  const dest = join('public', fallbackPath(still.src));
  await mkdir(dirname(dest), { recursive: true });
  await sharp(output, { raw: { width: info.width, height: info.height, channels: 3 } }).png({ palette: true, colours: 2 }).toFile(dest);
  manifest.push({ source: still.src, fallback: fallbackPath(still.src), width: info.width, height: info.height, white });
}
await mkdir('.generated', { recursive: true });
await writeFile('.generated/dither.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${manifest.length} Bayer fallback images.`);
