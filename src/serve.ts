import type { Connect, Plugin, ResolvedConfig } from 'vite'
import type { ResolvedViteStaticCopyOptions, TransformOption } from './options'
import { serveStaticCopyMiddleware } from './middleware'
import {
  collectCopyTargets,
  updateFileMapFromTargets,
  outputCollectedLog,
  formatConsole,
} from './utils'
import { debounce } from 'throttle-debounce'
import type { FSWatcher, Matcher } from 'chokidar'
import chokidar from 'chokidar'
import picomatch from 'picomatch'
import pc from 'picocolors'
import path from 'node:path'

type FileMapValue = {
  src: string
  dest: string
  overwrite: boolean | 'error'
  transform?: TransformOption
}
export type FileMap = Map<string, FileMapValue[]>

export const servePlugin = ({
  targets,
  watch,
  silent,
  environment,
}: ResolvedViteStaticCopyOptions): Plugin => {
  let config: ResolvedConfig
  let watcher: FSWatcher
  const fileMap: FileMap = new Map()

  const collectFileMap = async () => {
    const absoluteBuildOutDir = path.resolve(config.root, config.build.outDir)
    try {
      const copyTargets = await collectCopyTargets(config.root, targets, silent)
      updateFileMapFromTargets(copyTargets, fileMap, absoluteBuildOutDir)
    } catch (e) {
      if (!silent) {
        config.logger.error(formatConsole(pc.red((e as Error).toString())))
      }
    }
  }
  const collectFileMapDebounce = debounce(100, async () => {
    await collectFileMap()
  })

  return {
    name: 'vite-plugin-static-copy:serve',
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    async buildStart() {
      if (this.environment && this.environment.name !== environment) return
      await collectFileMap()
    },
    configureServer({ httpServer, middlewares, ws }) {
      const reloadPage = () => {
        ws.send({ type: 'full-reload', path: '*' })
      }

      const { watchSpecs, srcMatchers, globalDepth } =
        resolveWatchSources(targets)

      // chokidar invokes `ignored` with absolute paths, and stats is only
      // defined once the entry has been stat'd. For files, reject those that
      // don't match any src pattern. For directories, prune subtrees that no
      // watch spec can descend into — otherwise a shallow pattern like
      // `foo.*` (base='.', depth=0) would still cause chokidar to walk the
      // entire project since the global `depth` option falls back to
      // unlimited when any other pattern needs it. Paths we can't classify
      // (stats undefined, symlinks, …) pass through so chokidar handles them.
      const srcMatcher: Matcher = (p, stats) => {
        if (!stats) return false
        const relative = path.isAbsolute(p) ? path.relative(config.root, p) : p
        const normalized = relative.split(path.sep).join('/')
        if (stats.isDirectory()) {
          return !watchSpecs.some((spec) => {
            const depth = depthFromBase(spec.base, normalized)
            if (depth < 0) return false
            return spec.depth === undefined || depth <= spec.depth
          })
        }
        if (stats.isFile()) {
          return !srcMatchers.some((m) => m(normalized))
        }
        return false
      }

      const userIgnored = watch.options.ignored
      const userIgnoredArr: Matcher[] = Array.isArray(userIgnored)
        ? userIgnored
        : userIgnored != null
          ? [userIgnored]
          : []

      // cannot use server.watcher since it filters non-code files
      watcher = chokidar.watch(
        watchSpecs.map((s) => s.base),
        {
          cwd: config.root,
          ignoreInitial: true,
          ...(globalDepth !== undefined ? { depth: globalDepth } : {}),
          ...watch.options,
          ignored: [...userIgnoredArr, srcMatcher],
        },
      )
      watcher.on('add', async (path) => {
        if (!silent) {
          config.logger.info(
            formatConsole(`${pc.green('detected new file')} ${path}`),
            {
              timestamp: true,
            },
          )
        }
        await collectFileMapDebounce()
        if (watch.reloadPageOnChange) {
          reloadPage()
        }
      })
      if (watch.reloadPageOnChange) {
        watcher.on('change', (path) => {
          if (!silent) {
            config.logger.info(
              formatConsole(`${pc.green('file changed')} ${path}`),
              {
                timestamp: true,
              },
            )
          }
          reloadPage()
        })
        watcher.on('unlink', (path) => {
          if (!silent) {
            config.logger.info(
              formatConsole(`${pc.green('file deleted')} ${path}`),
              {
                timestamp: true,
              },
            )
          }
          reloadPage()
        })
      }

      if (!silent) {
        httpServer?.once('listening', () => {
          setTimeout(() => {
            outputCollectedLog(config.logger, fileMap)
          }, 0)
        })
      }

      return () => {
        // insert serveStaticCopyMiddleware before viteServePublicMiddleware
        // if viteServePublicMiddleware didn't exist use transformMiddleware instead
        const middleware = serveStaticCopyMiddleware(config, fileMap)
        middlewares.use(middleware)
        const targetMiddlewareIndex = findMiddlewareIndex(middlewares.stack, [
          'viteServePublicMiddleware',
          'viteTransformMiddleware',
        ])
        const serveStaticCopyMiddlewareIndex = middlewares.stack.findIndex(
          (item) => item.handle === middleware,
        )

        const serveStaticCopyMiddlewareItem = middlewares.stack.splice(
          serveStaticCopyMiddlewareIndex,
          1,
        )[0]
        if (serveStaticCopyMiddlewareItem === undefined) throw new Error()

        middlewares.stack.splice(
          targetMiddlewareIndex,
          0,
          serveStaticCopyMiddlewareItem,
        )
      }
    },
    async closeBundle() {
      if (this.environment && this.environment.name !== environment) return
      await watcher.close()
    },
  }
}

type WatchSpec = {
  // Forward-slash base path (relative to cwd unless the user passed an
  // absolute path).
  base: string
  // Max directory descent chokidar should make under this base. `undefined`
  // means unlimited (literal base that may point at a directory, or a pattern
  // containing `**`).
  depth: number | undefined
}

// chokidar v4+ dropped glob support, so resolve each src pattern to a base
// directory to watch and a per-pattern matcher used to filter emitted events.
// Patterns are normalized to forward slashes so matching lines up with the
// normalized event paths regardless of the platform separator. Depth is
// tracked per base so a shallow glob like `foo.*` (base='.', depth=0) doesn't
// force chokidar to walk the whole project just because a sibling pattern
// elsewhere needs unlimited depth.
const resolveWatchSources = (
  targets: ResolvedViteStaticCopyOptions['targets'],
) => {
  const watchSpecs: WatchSpec[] = []
  const srcMatchers: ((p: string) => boolean)[] = []
  const upsertSpec = (base: string): WatchSpec => {
    let spec = watchSpecs.find((s) => s.base === base)
    if (!spec) {
      spec = { base, depth: 0 }
      watchSpecs.push(spec)
    }
    return spec
  }
  for (const target of targets) {
    const patterns = Array.isArray(target.src) ? target.src : [target.src]
    for (const rawPattern of patterns) {
      const pattern = rawPattern.split(path.sep).join('/')
      const scanned = picomatch.scan(pattern)
      if (scanned.isGlob) {
        const spec = upsertSpec(scanned.base || '.')
        srcMatchers.push(picomatch(pattern, { dot: true }))
        if (spec.depth !== undefined) {
          if (scanned.glob.includes('**')) {
            spec.depth = undefined
          } else {
            spec.depth = Math.max(
              spec.depth,
              scanned.glob.split('/').length - 1,
            )
          }
        }
      } else {
        const spec = upsertSpec(pattern)
        spec.depth = undefined
        srcMatchers.push((p) => p === pattern || p.startsWith(`${pattern}/`))
      }
    }
  }
  // chokidar's `depth` is global; set it to the loosest per-spec bound so the
  // per-base pruning in the `ignored` matcher can handle the stricter cases.
  const globalDepth = watchSpecs.some((s) => s.depth === undefined)
    ? undefined
    : Math.max(0, ...watchSpecs.map((s) => s.depth as number))
  return { watchSpecs, srcMatchers, globalDepth }
}

// How many directory levels deep `path` sits within `base`. Returns -1 when
// `path` is not under `base` at all.
const depthFromBase = (base: string, path: string): number => {
  if (base === '.') {
    if (path === '' || path === '.') return 0
    return path.split('/').length
  }
  if (path === base) return 0
  if (!path.startsWith(`${base}/`)) return -1
  return path.slice(base.length + 1).split('/').length
}

const findMiddlewareIndex = (
  stack: Connect.ServerStackItem[],
  names: string | string[],
) => {
  const ns = Array.isArray(names) ? names : [names]
  for (const name of ns) {
    const index = stack.findIndex(
      (middleware) =>
        typeof middleware.handle === 'function' &&
        middleware.handle.name === name,
    )
    if (index > 0) {
      return index
    }
  }
  return -1
}
