import type { Connect, Plugin, ResolvedConfig } from 'vite'
import type { ResolvedViteStaticCopyOptions, TransformOption } from './options'
import { serveStaticCopyMiddleware } from './middleware'
import {
  collectCopyTargets,
  updateFileMapFromTargets,
  outputCollectedLog,
  formatConsole,
  copyAll,
  copyFile,
  removeFile,
  outputCopyLog
} from './utils'
import { debounce } from 'throttle-debounce'
import chokidar from 'chokidar'
import pc from 'picocolors'

type FileMapValue = {
  src: string
  transform?: TransformOption
}
export type FileMap = Map<string, FileMapValue[]>

export const servePlugin = ({
  targets,
  flatten,
  watch
}: ResolvedViteStaticCopyOptions): Plugin => {
  let config: ResolvedConfig
  let watcher: chokidar.FSWatcher
  const fileMap: FileMap = new Map()

  const collectFileMap = async () => {
    try {
      const copyTargets = await collectCopyTargets(
        config.root,
        targets,
        flatten
      )
      updateFileMapFromTargets(copyTargets, fileMap)
    } catch (e) {
      config.logger.error(formatConsole(pc.red((e as Error).toString())))
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
      await collectFileMap()
    },
    configureServer({ httpServer, middlewares, ws }) {
      const reloadPage = () => {
        ws.send({ type: 'full-reload', path: '*' })
      }

      if (watch.copyToDest) {
        copyAll(config.root, config.build.outDir, targets, flatten).then(
          copyCount => {
            outputCopyLog(config.logger, copyCount)
          }
        )
      }

      // cannot use server.watcher since disableGlobbing is true
      watcher = chokidar.watch(
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
        if (watch.copyToDest) {
          const dest = await copyFile(
            path,
            config.root,
            config.build.outDir,
            targets,
            flatten
          )
          config.logger.info(
            formatConsole(
              `${pc.green('file added and copied')} ${path} ${pc.green(
                '->'
              )} ${dest.join(pc.green(', '))}`
            ),
            {
              timestamp: true
            }
          )
          if (watch.reloadPageOnChange) {
            reloadPage()
          }
        }
        if (watch.reloadPageOnChange && !watch.copyToDest) {
          reloadPage()
        }
      })
      if (watch.copyToDest) {
        watcher.on('change', async path => {
          const dest = await copyFile(
            path,
            config.root,
            config.build.outDir,
            targets,
            flatten
          )
          if (watch.reloadPageOnChange) {
            reloadPage()
          }
          config.logger.info(
            formatConsole(
              `${pc.green('file changed and copied')} ${path} ${pc.green(
                '->'
              )} ${dest.join(pc.green(', '))}`
            ),
            {
              timestamp: true
            }
          )
        })
        watcher.on('unlink', async path => {
          const dest = await removeFile(
            path,
            config.root,
            config.build.outDir,
            targets,
            flatten
          )
          if (dest.length) {
            config.logger.info(
              formatConsole(
                `${pc.green('file deleted and removed')} ${path} ${pc.green(
                  'and'
                )} ${dest.join(pc.green(', '))}`
              ),
              {
                timestamp: true
              }
            )
          }
        })
      }
      if (watch.reloadPageOnChange && !watch.copyToDest) {
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

      httpServer?.once('listening', () => {
        setTimeout(() => {
          outputCollectedLog(config.logger, fileMap)
        }, 0)
      })

      return () => {
        // insert serveStaticCopyMiddleware before transformMiddleware
        middlewares.use(serveStaticCopyMiddleware(config.root, fileMap))
        const transformMiddlewareIndex = findMiddlewareIndex(
          middlewares.stack,
          'viteTransformMiddleware'
        )
        const serveStaticCopyMiddlewareIndex = findMiddlewareIndex(
          middlewares.stack,
          'viteServeStaticCopyMiddleware'
        )

        const serveStaticCopyMiddlewareItem = middlewares.stack.splice(
          serveStaticCopyMiddlewareIndex,
          1
        )[0]
        if (serveStaticCopyMiddlewareItem === undefined) throw new Error()

        middlewares.stack.splice(
          transformMiddlewareIndex,
          0,
          serveStaticCopyMiddlewareItem
        )
      }
    },
    async closeBundle() {
      await watcher.close()
    }
  }
}

const findMiddlewareIndex = (stack: Connect.ServerStackItem[], name: string) =>
  stack.findIndex(
    middleware =>
      typeof middleware.handle === 'function' && middleware.handle.name === name
  )
