import { WatchOptions } from 'chokidar'

export type Target = {
  /**
   * path or glob
   */
  src: string | string[]
  /**
   * destination
   */
  dest: string
  /**
   * rename
   */
  rename?: string
}

export type ViteStaticCopyOptions = {
  /**
   * Array of targets to copy.
   */
  targets: Target[]
  /**
   * Remove the directory structure.
   * @default true
   */
  flatten?: boolean
  /**
   * Watch options
   */
  watchOptions?: WatchOptions
}

export type ResolvedViteStaticCopyOptions = {
  targets: Target[]
  flatten: boolean
  watchOptions: WatchOptions
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  targets: options.targets,
  flatten: options.flatten ?? true,
  watchOptions: options.watchOptions ?? {}
})
