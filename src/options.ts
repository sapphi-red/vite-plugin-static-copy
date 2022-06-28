import type { WatchOptions } from 'chokidar'

/**
 * @param content content of file
 * @param filename absolute path to the file
 */
export type TransformFunc = (content: string, filename: string) => string

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
  /**
   * transform
   *
   * `src` should only include files when this option is used
   */
  transform?: TransformFunc
  /**
   * Should timestamps on copied files be presered?
   *
   * When false, timestamp behavior is OS-dependent.
   * Ignored for transformed files.
   * @default false
   */
  preserveTimestamps?: boolean
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
