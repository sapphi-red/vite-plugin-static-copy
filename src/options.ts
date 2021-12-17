export type Target = {
  /**
   * path or glob
   */
  src: string | string[]
  /**
   * destination
   */
  dest: string
}

export type ViteStaticCopyOptions = {
  /**
   * Directory to save cache files.
   * @default 'node_modules/.vite-static-copy'
   */
  devCopyDir?: string
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
   * Cleanup devCopyDir
   */
  cleanup?: boolean
}

export type ResolvedViteStaticCopyOptions = {
  devCopyDir: string
  targets: Target[]
  flatten: boolean
  cleanup: boolean
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  devCopyDir: options.devCopyDir ?? 'node_modules/.vite-static-copy',
  targets: options.targets,
  flatten: options.flatten ?? true,
  cleanup: options.cleanup ?? true
})
