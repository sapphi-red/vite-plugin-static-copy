import { Plugin } from 'vite'
import { ResolvedViteStaticCopyOptions } from './options'
import { copyAll, outputCopyLog } from './utils'

export const buildPlugin = ({
  targets,
  flatten
}: ResolvedViteStaticCopyOptions): Plugin => {
  let viteConfigBuildOutDir: string | undefined
  let copyCount: number | undefined

  return {
    name: 'vite-plugin-static-copy:build',
    apply: 'build',
    configResolved(config) {
      viteConfigBuildOutDir = config.build.outDir
    },
    async writeBundle() {
      if (viteConfigBuildOutDir === undefined) {
        throw new Error('viteConfigBuildOutDir is undefined. What happened...?')
      }

      copyCount = await copyAll(viteConfigBuildOutDir, targets, flatten)
    },
    closeBundle() {
      outputCopyLog(copyCount)
    }
  }
}
