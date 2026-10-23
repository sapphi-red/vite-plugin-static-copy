---
'vite-plugin-static-copy': major
---

Update `chokidar` to v6. This drops the transitive `braces` dependency, which is affected by [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (CVE-2026-93687, stack-exhaustion denial of service).

**Breaking changes:**

- `watch.options` is now typed as chokidar v6's `ChokidarOptions` (`WatchOptions` is no longer exported by chokidar), and accepts chokidar v6 options. Compared to the chokidar v3 `WatchOptions`, the interface changed as follows:
  - Removed: `disableGlobbing` and `useFsEvents`.
  - `ignored` now accepts a `Matcher` (string, `RegExp`, function or `{ path, recursive? }` object) or an array of them. Strings are no longer interpreted as globs.
  - `awaitWriteFinish` now accepts `boolean | Partial<{ stabilityThreshold; pollInterval }>`.
  - Added: `backend` (`'auto' | 'native' | 'native-recursive' | 'polling'`), `pollingInterval` and `pollingBinaryInterval`.
  - Deprecated: `usePolling` (use `backend: 'polling'`), `interval` (use `pollingInterval`) and `binaryInterval` (use `pollingBinaryInterval`).
- chokidar v6 requires Node.js >= 22.22.

Glob `src` patterns are still supported in watch mode. Since chokidar v4+ no longer supports globs, the plugin now watches the static base directory of each pattern and filters events itself.
