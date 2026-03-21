---
'vite-plugin-static-copy': minor
---

Add `{ stripBase: number }` object form to the `rename` option. This strips the given number of leading directory segments from the matched path, avoiding the need for manual `../` traversals in a rename function.

This is useful when copying files from deep paths like `node_modules/my-lib/dist/**/*` with `structured: true`, where the full directory structure would otherwise be preserved in the output. Instead of writing a rename function that manually returns `../` traversals to flatten unwanted nesting, you can use `rename: { stripBase: N }` to declaratively strip the leading segments.
