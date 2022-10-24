import { defineConfig } from 'vite'
import { viteStaticCopy } from '../../dist'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture1'
        },
        {
          src: 'foo.txt',
          dest: 'fixture2',
          rename: 'foo2.txt'
        },
        {
          src: 'foo.txt',
          dest: 'fixture3',
          rename: (fileName, fileExtension) => {
            return `/v1/${fileName}.${fileExtension}`
          }
        }
      ]
    })
  ]
})
