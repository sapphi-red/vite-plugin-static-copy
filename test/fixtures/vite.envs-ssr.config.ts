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
      environment: 'ssr',
    }),
  ],
  environments: {
    // ssr needs an explicit entry to trigger writeBundle
    ssr: {
      build: {
        outDir: 'dist-envs-ssr/ssr',
        rollupOptions: {
          input: 'foo.js',
        },
      },
    },
    client: {
      build: {
        outDir: 'dist-envs-ssr/client',
      },
    },
  },
  builder: {},
})
