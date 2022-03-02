import type { Plugin } from 'vite'
import type { ResolvedViteStaticCopyOptions } from './options'
import { serveStaticCopyMiddleware } from './middleware'
import {
  collectCopyTargets,
  updateFileMapFromTargets,
  outputCollectedLog,
  formatConsole
} from './utils'
import { debounce } from 'throttle-debounce'
import chokidar from 'chokidar'
import pc from 'picocolors'

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
          ignoreInitial: true,
          ...watch.options
        }
      )
      watcher.on('add', async path => {
        config.logger.info(
          formatConsole(`${pc.green('detected new file')} ${path}`),
          {
            timestamp: true
          }
        )
        await collectFileMapDebounce()
        if (watch.reloadPageOnChange) {
          reloadPage()
        }
      })
      if (watch.reloadPageOnChange) {
        watcher.on('change', path => {
          config.logger.info(
            formatConsole(`${pc.green('file changed')} ${path}`),
            {
              timestamp: true
            }
          )
          reloadPage()
        })
        watcher.on('unlink', path => {
          config.logger.info(
            formatConsole(`${pc.green('file deleted')} ${path}`),
            {
              timestamp: true
            }
          )
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
