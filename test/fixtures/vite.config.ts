import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../dist'

const wait = (delay: number) =>
  new Promise(resolve => {
    setTimeout(resolve, delay)
  })

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
        },
        {
          src: 'noext',
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
          src: 'foo.js',
          dest: 'fixture4',
          transform: async contents => {
            await wait(10)
            return contents + 'transform file'
          }
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
            encoding: 'buffer'
          }
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: 'foo2.txt'
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: (fileName, fileExtension) => {
            return `/v1/${fileName}.${fileExtension}`
          }
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: async (fileName, fileExtension) => {
            await wait(10)
            return `/v2/${fileName}.${fileExtension}`
          }
        },
        {
          src: 'foo.txt',
          dest: 'fixture11/overwriteDir/',
          overwrite: true
        },
        {
          src: 'foo.txt',
          dest: 'fixture11/notOverwriteDir/',
          overwrite: false
        },
        {
          src: 'dir/bar.txt',
          dest: 'fixture11/notOverwriteDir/',
          overwrite: false,
          transform(content) {
            return content + '1'
          }
        }
      ]
    })
  ]
})
