import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../dist'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
        }
      ]
    })
  ]
})
