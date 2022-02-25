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
  watch
}: ResolvedViteStaticCopyOptions): Plugin => {
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
    async buildStart() {
      await collectFileMap()
    },
    configureServer({ httpServer, middlewares, ws, config }) {
      const reloadPage = () => {
        ws.send({ type: 'full-reload', path: '*' })
      }

      // cannot use server.watcher since disableGlobbing is true
      const watcher = chokidar.watch(
        targets.flatMap(target => target.src),
        {
          cwd: config.root,
          ...watch.options
        }
      )
      watcher.on('add', async () => {
        await collectFileMapDebounce()
        if (watch.reloadPageOnChange) {
          reloadPage()
        }
      })
      if (watch.reloadPageOnChange) {
        watcher.on('change', () => {
          reloadPage()
        })
        watcher.on('unlink', () => {
          reloadPage()
        })
      }

      middlewares.use(serveStaticCopyMiddleware(fileMap))
      httpServer?.once('listening', () => {
        setTimeout(() => {
          outputCollectedLog(fileMap.size)
        }, 0)
      })
    }
  }
}
