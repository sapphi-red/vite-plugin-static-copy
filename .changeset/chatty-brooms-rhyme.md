---
'vite-plugin-static-copy': major
---

Simplify glob behavior and always preserve directory structure.

**Breaking changes:**

- **Only files are matched.** Glob patterns no longer match directory entries. Previously, matching a directory would recursively copy it via `fs.cp`, which caused files to be copied twice when using `**` patterns.
- **Directory patterns are auto-expanded.** `src: 'assets'` now automatically expands to match all files inside the directory, using tinyglobby's built-in `expandDirectories` option. No migration needed for this pattern alone.
- **`structured` option removed.** Directory structure is now always preserved in the output. The `structured` option has been removed entirely. Use `rename: { stripBase: true }` to flatten output paths when needed.
