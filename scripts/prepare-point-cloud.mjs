// A deterministic still of the actual capture, without a browser or GPU.
import { readFile } from 'node:fs/promises';
import { SplatBuffer } from '@mkkellogg/gaussian-splats-3d';
import { Vector3, Vector4, OrthographicCamera } from 'three';
import sharp from 'sharp';

const file = await readFile('public/models/converted_file.ksplat');
const splats = new SplatBuffer(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const width = 1200, height = 800;
const camera = new OrthographicCamera(-2.4, 2.4, 1.6, -1.6, 0.01, 1000);
camera.position.set(-0.06131, 0.18893, 1.09196);
camera.up.set(0, -1, 0);
camera.lookAt(0.21986, 0.23828, 4.30349);
camera.updateMatrixWorld();
const pixels = Buffer.alloc(width * height * 3);
const depth = new Float32Array(width * height).fill(Infinity);
const point = new Vector3(), color = new Vector4();
for (let i = 0; i < splats.getSplatCount(); i++) {
  splats.getSplatCenter(i, point); splats.getSplatColor(i, color);
  if (color.w < 5) continue;
  point.multiplyScalar(1.3).project(camera);
  if (point.z < -1 || point.z > 1) continue;
  const x = Math.round((point.x + 1) * width / 2), y = Math.round((1 - point.y) * height / 2);
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const at = y * width + x;
  if (point.z >= depth[at]) continue;
  depth[at] = point.z;
  pixels[at * 3] = color.x; pixels[at * 3 + 1] = color.y; pixels[at * 3 + 2] = color.z;
}
await sharp(pixels, { raw: { width, height, channels: 3 } }).webp({ quality: 92 }).toFile('public/media/about/point-cloud.webp');
console.log(`Projected ${splats.getSplatCount()} capture points.`);
