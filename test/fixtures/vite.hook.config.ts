import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const _dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'hook1',
        },
      ],
      hook: 'generateBundle',
    }),
    testHookPlugin(),
  ],
})

function testHookPlugin() {
  return {
    name: 'test-hook-plugin',
    async writeBundle() {
      const filePath = normalizePath(
        path.resolve(_dirname, 'dist', 'hook1', 'foo.txt'),
      )
      await fs.access(filePath)
    },
  }
}
