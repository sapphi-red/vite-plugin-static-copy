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
import chokidar, { type FSWatcher } from 'chokidar'
import picomatch from 'picomatch'
import { isDynamicPattern } from 'tinyglobby'
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
        config.logger.error(formatConsole(pc.red(String(e))))
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

      // cannot use server.watcher since disableGlobbing is true
      // chokidar v4+ does not support globs, so watch the static base directories and filter events
      const { roots, isTargetPath, ignored } = createWatchMatcher(
        config.root,
        targets.flatMap((target) => target.src),
      )
      watcher = chokidar.watch(roots, {
        cwd: config.root,
        ignoreInitial: true,
        ...watch.options,
        ignored: [ignored, ...[watch.options.ignored ?? []].flat()],
      })
      watcher.on('add', (path) => {
        if (!isTargetPath(path)) return
        if (!silent) {
          config.logger.info(formatConsole(`${pc.green('detected new file')} ${path}`), {
            timestamp: true,
          })
        }
        collectFileMapDebounce()
        if (watch.reloadPageOnChange) {
          reloadPage()
        }
      })
      if (watch.reloadPageOnChange) {
        watcher.on('change', (path) => {
          if (!isTargetPath(path)) return
          if (!silent) {
            config.logger.info(formatConsole(`${pc.green('file changed')} ${path}`), {
              timestamp: true,
            })
          }
          reloadPage()
        })
        watcher.on('unlink', (path) => {
          if (!isTargetPath(path)) return
          if (!silent) {
            config.logger.info(formatConsole(`${pc.green('file deleted')} ${path}`), {
              timestamp: true,
            })
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

        middlewares.stack.splice(targetMiddlewareIndex, 0, serveStaticCopyMiddlewareItem)
      }
    },
    async closeBundle() {
      if (this.environment && this.environment.name !== environment) return
      await watcher.close()
    },
  }
}

const toPosix = (p: string) => p.split(path.sep).join('/')

/**
 * Splits `src` patterns into static directories to watch and a matcher for emitted paths.
 * Emitted paths are relative to `root` (or absolute when outside of it).
 */
export const createWatchMatcher = (root: string, srcs: string[]) => {
  const roots = new Set<string>()
  const includes: ((p: string) => boolean)[] = []
  const excludes: ((p: string) => boolean)[] = []
  // directories that may still contain matches: static prefix and max depth (Infinity if unbounded)
  const descend: { prefix: string[]; maxDepth: number }[] = []

  for (const src of srcs) {
    const negated = src.startsWith('!')
    const pattern = negated ? src.slice(1) : src
    const normalized = pattern.replace(/^\.\//, '')
    const segments = normalized.split('/')
    const staticSegments: string[] = []
    for (const seg of segments) {
      if (isDynamicPattern(seg)) break
      staticSegments.push(seg)
    }
    const dynamic = staticSegments.length < segments.length
    const base = staticSegments.join('/')

    // match against root-relative posix paths; absolute patterns are made relative
    const rel = path.isAbsolute(normalized) ? toPosix(path.relative(root, normalized)) : normalized
    const matcher = picomatch([rel, `${rel}/**`], { dot: true })
    ;(negated ? excludes : includes).push(matcher)
    if (!negated) {
      roots.add(base === '' ? '.' : base)
      const unbounded = !dynamic || /\*\*|[{(]/.test(rel)
      descend.push({
        prefix: staticSegments,
        maxDepth: unbounded ? Infinity : rel.split('/').length - 1,
      })
    }
  }

  const isTargetPath = (p: string) => {
    const posix = toPosix(p)
    return includes.some((m) => m(posix)) && !excludes.some((m) => m(posix))
  }
  const toRelative = (p: string) => (path.isAbsolute(p) ? path.relative(root, p) : p)
  /** whether a directory can contain (or lead to) a matching file */
  const isDirRelevant = (p: string) => {
    const segs = toPosix(toRelative(p))
      .split('/')
      .filter((x) => x !== '' && x !== '.')
    return descend.some(
      (d) =>
        segs.length <= d.maxDepth &&
        segs.slice(0, d.prefix.length).every((seg, i) => seg === d.prefix[i]),
    )
  }
  /** chokidar `ignored` function: skips irrelevant directories and non-matching files */
  const ignored = (p: string, stats?: { isFile(): boolean; isDirectory(): boolean }) => {
    const rel = toRelative(p)
    if (stats?.isDirectory()) return !isDirRelevant(rel)
    if (stats?.isFile()) return !isTargetPath(rel)
    return false
  }
  return { roots: [...roots], isTargetPath, ignored }
}

const findMiddlewareIndex = (stack: Connect.ServerStackItem[], names: string | string[]) => {
  const ns = Array.isArray(names) ? names : [names]
  for (const name of ns) {
    const index = stack.findIndex(
      (middleware) => typeof middleware.handle === 'function' && middleware.handle.name === name,
    )
    if (index > 0) {
      return index
    }
  }
  return -1
}
