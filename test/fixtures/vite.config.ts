import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../dist'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
        },
        {
          src: 'foo.*',
          dest: 'fixture2'
        },
        {
          src: 'dir',
          dest: 'fixture3'
        },
        {
          src: 'foo.txt',
          dest: 'fixture4',
          transform: contents => contents + 'transform file'
        },
        {
          src: 'foo.*',
          dest: 'fixture5',
          transform: contents => contents + 'transform glob'
        }
      ]
    })
  ]
})
