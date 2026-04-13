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
    // ssr is defined first so that configResolved is called for ssr before client.
    // This means config ends up holding client's resolved config (the last call),
    // which would cause the stale outDir bug to copy files into dist-envs-ssr/client
    // instead of dist-envs-ssr/ssr without the this.environment?.config fix.
    ssr: {
      build: {
        outDir: 'dist-envs-ssr/ssr',
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
