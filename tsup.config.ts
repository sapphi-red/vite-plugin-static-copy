import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node12.2',
  dts: true,
  format: ['esm', 'cjs']
})
