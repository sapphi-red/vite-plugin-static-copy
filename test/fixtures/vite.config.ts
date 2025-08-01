import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const _dirname = path.dirname(fileURLToPath(import.meta.url))

const wait = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, delay)
  })

export default defineConfig({
  appType: 'custom', // disable SPA/MPA fallback
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1',
        },
        {
          src: 'noext',
          dest: 'fixture1',
        },
        {
          src: 'foo.*',
          dest: 'fixture2',
        },
        {
          src: 'dir',
          dest: 'fixture3',
        },
        {
          src: 'foo.txt',
          dest: 'fixture4',
          transform: (contents) => contents + 'transform file',
        },
        {
          src: 'foo.js',
          dest: 'fixture4',
          transform: async (contents) => {
            await wait(10)
            return contents + 'transform file'
          },
        },
        {
          src: 'foo.*',
          dest: 'fixture5',
          transform: (contents) => contents + 'transform glob',
        },
        {
          src: 'dir/bar.txt',
          dest: 'fixture6',
        },
        {
          src: 'dir/deep/bar.txt',
          dest: 'fixture6',
        },
        {
          src: 'dir',
          dest: 'fixture7',
        },
        {
          src: 'dir2/dir',
          dest: 'fixture7',
        },
        {
          src: 'foo.txt',
          dest: 'fixture8',
          transform: () => null,
        },
        {
          src: 'global.wasm',
          dest: 'fixture9',
          transform: {
            handler: (content) => content,
            encoding: 'buffer',
          },
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: 'foo2.txt',
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: (fileName, fileExtension) => {
            return `/v1/${fileName}.${fileExtension}`
          },
        },
        {
          src: 'foo.txt',
          dest: 'fixture10',
          rename: async (fileName, fileExtension) => {
            await wait(10)
            return `/v2/${fileName}.${fileExtension}`
          },
        },
        {
          src: 'foo.txt',
          dest: 'fixture11/overwriteDir/',
          overwrite: true,
        },
        {
          src: 'foo.txt',
          dest: 'fixture11/notOverwriteDir/',
          overwrite: false,
        },
        {
          src: 'dir/bar.txt',
          dest: 'fixture11/notOverwriteDir/',
          overwrite: false,
          transform(content) {
            return content + '1'
          },
        },
        {
          src: 'foo.js',
          dest: 'fixture12',
          rename: (filename) => {
            return `${filename}.txt`
          },
        },
        {
          src: 'foo.txt',
          dest: 'fixture12',
          transform(content) {
            return JSON.stringify({ value: content.trim() })
          },
          rename: (filename) => {
            return `${filename}.json`
          },
        },
        {
          src: 'foo.txt',
          dest: 'fixture12',
          rename: (filename) => {
            return `${filename}.foo`
          },
        },
        {
          src: 'foo.txt',
          dest: path.resolve(_dirname, 'dist/fixture13'),
        },
        { src: 'eexist/*', dest: 'eexist' },
        { src: 'eexist/*', dest: 'Eexist' },
      ],
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1-1',
        },
      ],
    }),
  ],
})
