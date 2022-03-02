import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node14',
  dts: true,
  format: ['esm', 'cjs']
})
