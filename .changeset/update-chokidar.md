---
'vite-plugin-static-copy': major
---

Update `chokidar` to v6. This drops the transitive `braces` dependency, which is affected by [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (CVE-2026-93687, stack-exhaustion denial of service).

**Breaking changes:**

- `watch.options` is now typed as chokidar v6's `ChokidarOptions` (`WatchOptions` is no longer exported by chokidar), and accepts chokidar v6 options.
- chokidar v6 requires Node.js >= 22.22.

Glob `src` patterns are still supported in watch mode. Since chokidar v4+ no longer supports globs, the plugin now watches the static base directory of each pattern and filters events itself.
