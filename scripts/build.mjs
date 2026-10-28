import { execFileSync } from 'node:child_process';
// Cloudflare calls npm run build on both main and preview branches.
const args = process.argv.slice(2);
const explicit = args.indexOf('--mode');
const mode = explicit >= 0 ? args[explicit + 1] : process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main' ? 'preview' : 'production';
if (!['production', 'preview'].includes(mode)) throw new Error('Use --mode production or --mode preview.');
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run(process.execPath, ['--experimental-strip-types', 'scripts/prepare-dither.mjs']);
run(process.execPath, ['node_modules/typescript/bin/tsc']);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', mode]);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', mode, '--ssr', 'src/render.ts', '--outDir', '.prerender']);
run(process.execPath, ['scripts/prerender.mjs']);
