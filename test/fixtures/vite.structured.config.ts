import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'node:path'
import url from 'node:url'
import { normalizePath } from 'vite'

const _dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default defineConfig({
  appType: 'custom', // disable SPA/MPA fallback
  build: {
    outDir: './dist-structured',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '*.txt',
          dest: 'fixture1',
        },
        {
          src: 'dir/*.txt',
          dest: 'fixture2',
        },
        {
          src: '../fixtures2/*.txt',
          dest: 'fixture3',
        },
        {
          src: 'foo.js',
          dest: '',
        },
        {
          src: 'noext',
          dest: '.',
        },
        {
          src: 'dir/bar.txt',
          dest: '',
        },
        {
          src: normalizePath(path.resolve(_dirname, 'dir/*.txt')),
          dest: 'fixture4',
        },
      ],
      structured: true,
    }),
  ],
})
