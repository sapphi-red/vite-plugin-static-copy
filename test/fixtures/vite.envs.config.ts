import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  appType: 'custom',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'foo.txt',
          dest: 'fixture',
        },
      ],
    }),
  ],
  environments: {
    client: {
      build: {
        outDir: 'dist-envs/client',
      },
    },
    ssr: {
      build: {
        outDir: 'dist-envs/ssr',
      },
    },
  },
  builder: {},
})
