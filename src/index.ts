import { Plugin } from 'vite'
import { resolveOptions, ViteStaticCopyOptions } from './options'
import { servePlugin } from './serve'
import { buildPlugin } from './build'

export { ViteStaticCopyOptions }
export { Target } from './options'

export const staticCopyPlugin = (options: ViteStaticCopyOptions): Plugin[] => {
  const resolvedOptions = resolveOptions(options)

  return [servePlugin(resolvedOptions), buildPlugin(resolvedOptions)]
}
