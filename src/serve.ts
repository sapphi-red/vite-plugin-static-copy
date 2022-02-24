import { Plugin } from 'vite'
import { ResolvedViteStaticCopyOptions } from './options'
import { serveStaticCopyMiddleware } from './middleware'
import { collectCopyTargets, outputCollectedLog } from './utils'

export const servePlugin = ({
  targets,
  flatten
}: ResolvedViteStaticCopyOptions): Plugin => {
  const fileMap = new Map<string, string>()

  return {
    name: 'vite-plugin-static-copy:serve',
    apply: 'serve',
    async buildStart() {
      const copyTargets = await collectCopyTargets(targets, flatten)

      for (const target of [...copyTargets].reverse()) {
        let dest = target.dest.replace(/\\/g, '/')
        if (!dest.startsWith('/')) {
          dest = `/${dest}`
        }
        fileMap.set(dest, target.src)
      }

      outputCollectedLog(copyTargets.length)
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(serveStaticCopyMiddleware(fileMap))
      }
    }
  }
}
