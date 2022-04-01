import type { Plugin, ResolvedConfig } from 'vite'
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
  let config: ResolvedConfig
  const fileMap = new Map<string, string>()

  const collectFileMap = async () => {
    const copyTargets = await collectCopyTargets(config.root, targets, flatten)
    updateFileMapFromTargets(copyTargets, fileMap)
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
      await collectFileMap()
    },
    configureServer({ httpServer, middlewares, ws }) {
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

      middlewares.use(serveStaticCopyMiddleware(config.root, fileMap))
      httpServer?.once('listening', () => {
        setTimeout(() => {
          outputCollectedLog(config.logger, fileMap.size)
        }, 0)
      })

      httpServer?.once('close', () => {
        watcher.close()
      })
    }
  }
}
