---
'vite-plugin-static-copy': patch
---

Use each environment’s resolved `build.outDir` when copying static assets during build on Vite 6. Previously the plugin kept only the last `configResolved` config, so multi-environment setups (for example Astro with separate client and SSR output directories) could copy files into the wrong folder.
