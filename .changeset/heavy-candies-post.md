---
'vite-plugin-static-copy': patch
---

Fix `rename.stripBase` to work correctly with `../` paths

Previously, `stripBase` counted `..` as directory segments, causing incorrect output paths when copying from parent directories.

```js
{ src: '../../src/pages/**/*.html', dest: 'dist/', rename: { stripBase: 2 } }
```

**Before**: `dist/src/pages/events/test.html`
**After**: `dist/events/test.html`

```js
{ src: '../../src/pages/**/*.html', dest: 'dist/', rename: { stripBase: true } }
```

**Before**: `dist/src/pages/events/test.html`
**After**: `dist/test.html`
