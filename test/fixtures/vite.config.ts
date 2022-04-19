
import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../src'
// import { fileURLToPath } from 'node:url'


// export const root = new URL('./fixtures/', import.meta.url)
// console.log("🚀 ~ root", root)

// const fileURLToNormalizedPath = (url: URL) => normalizePath(fileURLToPath(url))

export default defineConfig({
  // logLevel: 'silent',
  // root: fileURLToNormalizedPath(root),
  // configFile: fileURLToNormalizedPath(new URL('./vite.config.ts', root)),
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1',
        },
        {
          src: 'foo.*',
          dest: 'fixture2',
          transform: (contents, filename) => contents
        },
        {
          src: 'dir',
          dest: 'fixture3',
        },
        {
          src: 'foo.txt',
          dest: 'fixture4',
          transform: (contents, filename) => contents + 'transform file'
        }
        ,
        {
          src: 'dir',
          dest: 'fixture5',
          transform: (contents, filename) => contents + 'transform dir'
        }
      ]
    })
  ]
})
