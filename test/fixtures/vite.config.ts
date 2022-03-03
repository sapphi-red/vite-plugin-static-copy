import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../src'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture'
        }
      ]
    })
  ]
})
