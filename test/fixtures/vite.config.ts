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
        },
        {
          src: 'dir/bar.txt',
          dest: 'fixture6'
        },
        {
          src: 'dir/deep/bar.txt',
          dest: 'fixture6'
        },
        {
          src: 'dir',
          dest: 'fixture7'
        },
        {
          src: 'dir2/dir',
          dest: 'fixture7'
        },
        {
          src: 'foo.txt',
          dest: 'fixture8',
          transform: () => null
        },
        {
          src: 'global.wasm',
          dest: 'fixture9',
          transform: {
            handler: content => content,
            encoding: 'binary'
          }
        }
      ]
    })
  ]
})
