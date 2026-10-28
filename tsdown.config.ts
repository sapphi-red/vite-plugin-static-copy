import { defineConfig, type UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['src/index.ts'],
  target: 'node22',
  dts: true,
  format: 'esm',
  fixedExtension: false,
  deps: {
    onlyBundle: ['@polka/url', 'mrmime', 'throttle-debounce'],
  },
})

export default config
