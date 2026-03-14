---
'vite-plugin-static-copy': minor
---

Add per-target `structured` option with `{ base }` mode. The `structured` option can now be set on individual targets, overriding the global setting. A new `{ base: string }` mode strips the given base prefix and preserves only the relative directory structure beyond it. For example, `{ src: 'src/pages/**/*.html', dest: 'dist/', structured: { base: 'src' } }` copies `src/pages/events/test.html` to `dist/pages/events/test.html`.
