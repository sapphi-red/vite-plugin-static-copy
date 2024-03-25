import type { WatchOptions } from 'chokidar'

type MaybePromise<T> = T | Promise<T>

export type RenameFunc = (
  fileName: string,
  fileExtension: string,
  fullPath: string
) => MaybePromise<string>

/**
 * @param content content of file
 * @param filename absolute path to the file
 * @returns the transformed content. when `null` is returned, the file won't be created.
 */
export type TransformFunc<T extends string | Buffer> = (
  content: T,
  filename: string
) => MaybePromise<T | null>

export type TransformOptionObject =
  | {
      encoding: Exclude<BufferEncoding, 'binary'>
      handler: TransformFunc<string>
    }
  | {
      encoding: 'buffer'
      handler: TransformFunc<Buffer>
    }

export type TransformOption = TransformFunc<string> | TransformOptionObject

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
  rename?: string | RenameFunc
  /**
   * transform
   *
   * `src` should only include files when this option is used
   */
  transform?: TransformOption
  /**
   * Should timestamps on copied files be preserved?
   *
   * When false, timestamp behavior is OS-dependent.
   * Ignored for transformed files.
   * @default false
   */
  preserveTimestamps?: boolean
  /**
   * Whether to dereference symlinks.
   *
   * When true, symlinks will be dereferenced.
   * When false, symlinks will not be dereferenced.
   * @default true
   */
  dereference?: boolean
  /**
   * Whether to overwrite existing file or directory.
   *
   * When true, it will overwrite existing file or directory.
   * When false, it will skip those files/directories.
   * When 'error', it will throw an error.
   *
   * @default true
   */
  overwrite?: boolean | 'error'
}

export type ViteStaticCopyOptions = {
  /**
   * Array of targets to copy.
   */
  targets: Target[]
  /**
   * Preserve the directory structure.
   *
   * Similar to `flatten: false` in rollup-plugin-copy
   * @default false
   */
  structured?: boolean
  /**
   * Suppress console output.
   * @default false
   */
  silent?: boolean
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
    /**
     * Copy files to the dist on change
     * @default false
     */
    copyToDest?: boolean
  }
}

export type ResolvedViteStaticCopyOptions = {
  targets: Target[]
  structured: boolean
  silent: boolean
  watch: {
    options: WatchOptions
    reloadPageOnChange: boolean
    copyToDest: boolean
  }
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  targets: options.targets,
  structured: options.structured ?? false,
  silent: options.silent ?? false,
  watch: {
    options: options.watch?.options ?? {},
    reloadPageOnChange: options.watch?.reloadPageOnChange ?? false,
    copyToDest: options.watch?.copyToDest ?? false
  }
})
