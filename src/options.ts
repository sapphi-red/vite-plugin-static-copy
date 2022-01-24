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
}

export type ResolvedViteStaticCopyOptions = {
  devCopyDir: string
  targets: Target[]
  flatten: boolean
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  devCopyDir: options.devCopyDir ?? 'node_modules/.vite-static-copy',
  targets: options.targets,
  flatten: options.flatten ?? true
})
