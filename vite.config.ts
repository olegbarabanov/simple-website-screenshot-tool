import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  build: {
    outDir: resolve(__dirname, './dist'),
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'screenshotter',
      formats: ['es'],
      fileName: format => {
        return 'screenshotter.js';
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});