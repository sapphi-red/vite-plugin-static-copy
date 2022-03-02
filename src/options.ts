import type { WatchOptions } from 'chokidar'

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
  watch?: {
    /**
     * Watch options
     */
    options?: WatchOptions
    /**
     * Reloads page on file change when true
     * @default false
     */
    reloadPageOnChange?: boolean
  }
}

export type ResolvedViteStaticCopyOptions = {
  targets: Target[]
  flatten: boolean
  watch: {
    options: WatchOptions
    reloadPageOnChange: boolean
  }
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  targets: options.targets,
  flatten: options.flatten ?? true,
  watch: {
    options: options.watch?.options ?? {},
    reloadPageOnChange: options.watch?.reloadPageOnChange ?? false
  }
})
