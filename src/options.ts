import type { WatchOptions } from 'chokidar'

type MaybePromise<T> = T | Promise<T>
type WithRequiredSingleKey<T, K extends keyof T> = {
  [P in K]-?: Required<T[P]>
} & T

type OptionalRenameObject = { stripBase?: number | true; name?: string }
export type RenameObject =
  | WithRequiredSingleKey<OptionalRenameObject, 'stripBase'>
  | WithRequiredSingleKey<OptionalRenameObject, 'name'>

export type RenameFunc = (
  fileName: string,
  fileExtension: string,
  fullPath: string,
) => MaybePromise<string | RenameObject>

/**
 * @param content content of file
 * @param filename absolute path to the file
 * @returns the transformed content. when `null` is returned, the file won't be created.
 */
export type TransformFunc<T extends string | Buffer> = (
  content: T,
  filename: string,
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
   * destination path
   *
   * If a relative path is passed, it will be resolved from `build.outDir`.
   */
  dest: string
  /**
   * Rename the output file.
   *
   * When a string is provided, it is a shorthand for `{ name: string }`.
   *
   * When an object is provided:
   * - `name`: replaces the file's basename (filename + extension).
   * - `stripBase`: the given number of leading directory segments from the matched
   *   path are stripped from the destination. When `true`, all directory segments
   *   are stripped (equivalent to flat copy).
   * - When both are provided, `stripBase` is applied first, then `name` replaces
   *   the basename.
   *
   * When a function is provided, it receives `(fileName, fileExtension, fullPath)`
   * and should return the new file name or a `RenameObject`.
   * When a string is returned, it is joined with the resolved `dest` directory
   * using `path.join`, so it can include path segments (e.g. `subdir/file.txt`)
   * or `../` traversals to restructure the output.
   * When a `RenameObject` is returned, it is applied the same way as the object
   * form above.
   *
   * @example
   * ```js
   * // Copies src/pages/events/test.html to dist/events/test.html
   * { src: 'src/pages/**\/*.html', dest: 'dist/', rename: { stripBase: 2 } }
   * // Copies ../../src/pages/events/test.html to dist/events/test.html
   * { src: '../../src/pages/**\/*.html', dest: 'dist/', rename: { stripBase: 2 } }
   * // Copies src/pages/events/test.html to dist/test.html
   * { src: 'src/pages/**\/*.html', dest: 'dist/', rename: { stripBase: true } }
   * // Copies ../../src/pages/events/test.html to dist/test.html
   * { src: '../../src/pages/**\/*.html', dest: 'dist/', rename: { stripBase: true } }
   * // Copies foo.txt to dist/newname.txt (name only)
   * { src: 'foo.txt', dest: 'dist/', rename: { name: 'newname.txt' } }
   * // Copies src/pages/events/test.html to dist/events/newname.txt (stripBase + name)
   * { src: 'src/pages/**\/*.html', dest: 'dist/', rename: { stripBase: 2, name: 'newname.txt' } }
   *
   * // Copies src/pages/events/test.html to dist/src/pages/events/test2.html
   * { src: 'src/pages/**\/*.html', dest: 'dist/', rename: (name, ext) => `${name}2.${ext}` }
   * // Copies src/pages/events/test.html to dist/pages/events/test.html
   * { src: 'src/pages/**\/*.html', dest: 'dist/', rename: (name, ext, fullPath) => `../${name}.${ext}` }
   * ```
   */
  rename?: string | RenameObject | RenameFunc
  /**
   * Transform file contents before writing.
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
   * Suppress console output and ignore validation errors.
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
  }
  /**
   * Rollup hook the plugin should use during build.
   * @default 'writeBundle'
   */
  hook?: string
  /**
   * The environment to run this plugin in.
   * @default 'client'
   */
  environment?: string
}

export type ResolvedViteStaticCopyOptions = {
  targets: Target[]
  silent: boolean
  watch: {
    options: WatchOptions
    reloadPageOnChange: boolean
  }
  hook: string
  environment: string
}

export const resolveOptions = (
  options: ViteStaticCopyOptions,
): ResolvedViteStaticCopyOptions => ({
  targets: options.targets,
  silent: options.silent ?? false,
  watch: {
    options: options.watch?.options ?? {},
    reloadPageOnChange: options.watch?.reloadPageOnChange ?? false,
  },
  hook: options.hook ?? 'writeBundle',
  environment: options.environment ?? 'client',
})
