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
          src: 'foo.txt',
          dest: 'overwriteDir/',
          overwrite: true
        },
        {
          src: 'foo.txt',
          dest: 'notOverwriteDir/',
          overwrite: false
        }
      ]
    })
  ]
})
