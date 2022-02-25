import { Plugin } from 'vite'
import { ResolvedViteStaticCopyOptions } from './options'
import { serveStaticCopyMiddleware } from './middleware'
import {
  collectCopyTargets,
  updateFileMapFromTargets,
  outputCollectedLog
} from './utils'
import { debounce } from 'throttle-debounce'
import chokidar from 'chokidar'

export const servePlugin = ({
  targets,
  flatten,
  watchOptions
}: ResolvedViteStaticCopyOptions): Plugin => {
  let viteConfigRoot: string | undefined
  const fileMap = new Map<string, string>()

  const collectFileMap = async () => {
    const copyTargets = await collectCopyTargets(targets, flatten)
    updateFileMapFromTargets(copyTargets, fileMap)
  }
  const collectFileMapDebounce = debounce(100, async () => {
    await collectFileMap()
  })

  return {
    name: 'vite-plugin-static-copy:serve',
    apply: 'serve',
    configResolved(config) {
      viteConfigRoot = config.root
    },
    async buildStart() {
      await collectFileMap()
    },
    configureServer(server) {
      if (viteConfigRoot === undefined) {
        throw new Error('viteConfigRoot is undefined. What happened...?')
      }

      // cannot use server.watcher since disableGlobbing is true
      const watcher = chokidar.watch(
        targets.flatMap(target => target.src),
        {
          cwd: viteConfigRoot,
          ...watchOptions
        }
      )
      watcher.on('add', () => {
        collectFileMapDebounce()
      })

      server.middlewares.use(serveStaticCopyMiddleware(fileMap))
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          outputCollectedLog(fileMap.size)
        }, 0)
      })
    }
  }
}
