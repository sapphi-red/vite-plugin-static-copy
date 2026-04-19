---
'vite-plugin-static-copy': major
---

Upgrade chokidar to v5. The `watch.options` type is now `ChokidarOptions` (was `WatchOptions`), and options removed upstream (e.g. `disableGlobbing`, `useFsEvents`) are no longer accepted.
