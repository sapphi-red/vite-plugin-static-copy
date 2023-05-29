import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  build: {
    outDir: './dist-noflatten'
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '*.txt',
          dest: 'fixture1'
        },
        {
          src: 'dir/*.txt',
          dest: 'fixture2'
        },
        {
          src: '../fixtures2/*.txt',
          dest: 'fixture3'
        }
      ],
      flatten: false
    })
  ]
})
