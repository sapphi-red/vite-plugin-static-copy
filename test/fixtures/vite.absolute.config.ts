import path from 'node:path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, './dist-absolute')
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
        }
      ]
    })
  ]
})
