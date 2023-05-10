import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../dist'

export default defineConfig({
  build: {
    outDir: './dist-overwrite'
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo1.txt',
          dest: 'overwriteDir/',
          overwrite: true
        },
        {
          src: 'foo1.txt',
          dest: 'notOverwriteDir/',
          overwrite: false
        }
      ]
    })
  ]
})
