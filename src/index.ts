import type { Plugin } from 'vite'
import type { ViteStaticCopyOptions } from './options'
import { resolveOptions } from './options'
import { servePlugin } from './serve'
import { buildPlugin } from './build'

export type { ViteStaticCopyOptions }
export type {
  RenameFunc,
  TransformFunc,
  TransformOption,
  Target,
} from './options'

export const viteStaticCopy = (options: ViteStaticCopyOptions): Plugin[] => {
  const resolvedOptions = resolveOptions(options)

  return [servePlugin(resolvedOptions), buildPlugin(resolvedOptions)]
}
