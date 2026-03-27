import type { Plugin, ResolvedConfig } from 'vite'
import type { ResolvedViteStaticCopyOptions } from './options'
import { copyAll, outputCopyLog } from './utils'

export const buildPlugin = ({
  targets,
  silent,
  hook,
  environment,
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
      if (this.environment && this.environment.name !== environment) return
      // reset for watch mode
      output = false
    },
    async [hook as 'writeBundle']() {
      if (this.environment && this.environment.name !== environment) return
      // run copy only once even if multiple bundles are generated
      if (output) return
      output = true

      // In Vite 6's Environment API, configResolved is called per-environment
      // and the last call overwrites `config`. Use the environment-specific
      // outDir so files land in the correct output directory.
      const outDir =
        this.environment?.config?.build?.outDir ?? config.build.outDir

      const result = await copyAll(config.root, outDir, targets, silent)
      if (!silent) outputCopyLog(config.logger, result)
    },
  }
}
