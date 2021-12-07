import { Plugin } from 'vite'
import fs from 'fs-extra'
import { ResolvedViteStaticCopyOptions } from './options'
import { servePublicMiddleware } from './middleware'
import { copyAll, outputCopyLog } from './utils'

export const servePlugin = ({
  devCopyDir,
  targets,
  flatten
}: ResolvedViteStaticCopyOptions): Plugin => {
  return {
    name: 'vite-plugin-static-copy:serve',
    apply: 'serve',
    async buildStart() {
      // copy again
      try {
        await fs.rm(devCopyDir, { force: true, recursive: true })
        // eslint-disable-next-line no-empty
      } catch {}
      await fs.mkdir(devCopyDir, { recursive: true })

      const copyCount = await copyAll(devCopyDir, targets, flatten)
      outputCopyLog(copyCount)
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(servePublicMiddleware(devCopyDir))
      }
    }
  }
}
