import { build } from 'esbuild';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await build({
  entryPoints: [resolve(root, 'app/scheduler-worker.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: resolve(root, 'build/scheduler.cjs'),
  alias: {
    '~': resolve(root, 'app'),
  },
});

console.log('build/scheduler.cjs built successfully');
