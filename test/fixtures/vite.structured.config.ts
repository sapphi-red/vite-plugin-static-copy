import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  appType: 'custom', // disable SPA/MPA fallback
  build: {
    outDir: './dist-structured'
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
        },
        {
          src: 'foo.js',
          dest: ''
        },
        {
          src: 'noext',
          dest: '.'
        },
        {
          src: 'dir/bar.txt',
          dest: ''
        }
      ],
      structured: true
    })
  ]
})
