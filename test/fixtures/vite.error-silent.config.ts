import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'does-not-exist.txt',
          dest: 'does-not-exist'
        }
      ],
      silent: true
    })
  ]
})
