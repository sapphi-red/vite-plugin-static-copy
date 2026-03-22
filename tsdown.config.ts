import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node22',
  dts: true,
  format: 'esm',
  fixedExtension: false,
  inlineOnly: ['@polka/url', 'mrmime', 'throttle-debounce'],
})
