import { defineConfig } from 'vite'
// import { viteStaticCopy } from '../../src'
import { viteStaticCopy } from '../../dist'
// import { viteStaticCopy } from 'vite-plugin-static-copy'
console.log('🚀 ~ viteStaticCopy')

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
          // transform: (contents, filename) => '0' + contents
        },
        {
          src: 'foo.*',
          dest: 'fixture2'
          // transform: (contents, filename) => contents
        },
        {
          src: 'dir',
          dest: 'fixture3'
          // transform: (contents, filename) => '0' + contents
        }
      ]
    })
  ]
})
