import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node18',
  dts: true,
  format: 'esm'
})
