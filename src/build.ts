import type { Plugin, ResolvedConfig } from 'vite'
import type { ResolvedViteStaticCopyOptions } from './options'
import { copyAll, outputCopyLog } from './utils'

export const buildPlugin = ({
  targets,
  structured,
  silent
}: ResolvedViteStaticCopyOptions): Plugin => {
  let config: ResolvedConfig
  let output = false

  return {
    name: 'vite-plugin-static-copy:build',
    apply: 'build',
    configResolved(_config) {
      config = _config
    },
    buildEnd() {
      // reset for watch mode
      output = false
    },
    async writeBundle() {
      // run copy only once even if multiple bundles are generated
      if (output) return
      output = true

      const result = await copyAll(
        config.root,
        config.build.outDir,
        targets,
        structured
      )
      if (!silent) outputCopyLog(config.logger, result)
    }
  }
}
