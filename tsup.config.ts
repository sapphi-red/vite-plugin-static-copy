import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node14.18',
  dts: true,
  format: ['esm', 'cjs']
})
