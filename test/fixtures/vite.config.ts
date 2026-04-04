import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'
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
        { src: 'foo.js', dest: '' },
        { src: 'noext', dest: '.' },
        { src: 'dir/bar.txt', dest: '' },
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
          rename: { stripBase: 1 },
        },
        {
          src: 'dir/deep/bar.txt',
          dest: 'fixture6',
          rename: { stripBase: 2 },
        },
        {
          src: 'dir',
          dest: 'fixture7',
        },
        {
          src: 'dir2/dir',
          dest: 'fixture7',
          rename: { stripBase: 1 },
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
          rename: { stripBase: 1 },
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
        {
          src: 'foo.txt',
          dest: 'fixture14/sub',
          rename: () => '../renamed.txt',
        },
        { src: '../fixtures2/*.txt', dest: 'fixture15' },
        {
          src: 'dir/bar.txt',
          dest: 'fixture16',
          rename: (_name: string, _ext: string) => `../${_name}.${_ext}`,
        },
        {
          src: 'dir/deep/bar.txt',
          dest: 'fixture16',
          rename: (_name: string, _ext: string) =>
            `../../dir/${_name}2.${_ext}`,
        },
        { src: 'dir/bar.txt', dest: 'fixture17', rename: { stripBase: 1 } },
        {
          src: 'dir/deep/bar.txt',
          dest: 'fixture17',
          rename: { stripBase: 1 },
        },
        {
          src: normalizePath(path.resolve(import.meta.dirname, 'dir/*.txt')),
          dest: 'fixture18',
        },
        {
          src: 'to-flat/**/*.txt',
          dest: 'fixture19',
          rename: (
            fileName: string,
            fileExtension: string,
            absPath: string,
          ) => {
            const s = path.relative(
              absPath,
              path.resolve(import.meta.dirname, 'to-flat'),
            )
            return path.join(s, `${fileName}.${fileExtension}`)
          },
        },
        {
          src: 'to-flat/**/*.txt',
          dest: 'fixture20',
          rename: { stripBase: true },
        },
        { src: 'eexist/**/*', dest: 'eexist', rename: { stripBase: 1 } },
        { src: 'eexist/**/*', dest: 'Eexist', rename: { stripBase: 1 } },
        {
          src: '../fixtures2/**/*.txt',
          dest: 'fixture21',
          rename: { stripBase: true },
        },
        {
          src: '../fixtures2/**/*.txt',
          dest: 'fixture22',
          rename: { stripBase: 1 },
        },
        {
          src: 'dir/deep/*.txt',
          dest: 'fixture23',
          rename: { stripBase: true },
        },
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
