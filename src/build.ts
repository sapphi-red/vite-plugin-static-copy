import type { Plugin, ResolvedConfig } from 'vite'
import type { ResolvedViteStaticCopyOptions } from './options'
import { copyAll, outputCopyLog } from './utils'

export const buildPlugin = ({
  targets,
  flatten,
  silent
}: ResolvedViteStaticCopyOptions): Plugin => {
  let config: ResolvedConfig
  let copyCount: number | undefined

  return {
    name: 'vite-plugin-static-copy:build',
    apply: 'build',
    configResolved(_config) {
      config = _config
    },
    async writeBundle() {
      copyCount = await copyAll(
        config.root,
        config.build.outDir,
        targets,
        flatten
      )
    },
    closeBundle() {
      if (!silent)
        outputCopyLog(config.logger, copyCount)
    }
  }
}
