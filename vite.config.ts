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
      name: 'ScreenshotCapture',
      formats: ['es'],
      fileName: () => 'ScreenshotCapture.js',
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});
