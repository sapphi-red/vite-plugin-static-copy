import type { Plugin } from 'vite'
import type { ResolvedViteStaticCopyOptions } from './options'
import { copyAll, outputCopyLog } from './utils'

export const buildPlugin = ({
  targets,
  flatten
}: ResolvedViteStaticCopyOptions): Plugin => {
  let viteConfigRoot: string
  let viteConfigBuildOutDir: string
  let copyCount: number | undefined

  return {
    name: 'vite-plugin-static-copy:build',
    apply: 'build',
    configResolved(config) {
      viteConfigRoot = config.root
      viteConfigBuildOutDir = config.build.outDir
    },
    async writeBundle() {
      copyCount = await copyAll(
        viteConfigRoot,
        viteConfigBuildOutDir,
        targets,
        flatten
      )
    },
    closeBundle() {
      outputCopyLog(copyCount)
    }
  }
}
