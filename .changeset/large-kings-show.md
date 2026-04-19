---
'vite-plugin-static-copy': minor
---

Add `name` property to the `rename` object form and allow rename functions to return a `RenameObject`. The `name` property replaces the file's basename (filename + extension), and can be combined with `stripBase` to both flatten directory structure and rename the file in one step. Rename functions can now return `{ name, stripBase }` objects instead of only strings, making it easier to declaratively control output paths from dynamic rename logic.

```js
// node_modules/lib/dist/index.js → vendor/lib.js
{ src: 'node_modules/lib/dist/index.js', dest: 'vendor', rename: { name: 'lib.js', stripBase: true } }

// src/pages/events/test.html → dist/events/index.html
{ src: 'src/pages/**/*.html', dest: 'dist/', rename: { stripBase: 2, name: 'index.html' } }
```
