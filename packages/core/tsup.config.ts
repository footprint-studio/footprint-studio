import { copyFile, mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  treeshake: true,
  external: ['maplibre-gl'],
  onSuccess: async () => {
    await mkdir('dist', { recursive: true });
    await copyFile('src/styles/footprint-globe.css', 'dist/footprint-globe.css');
  },
});
