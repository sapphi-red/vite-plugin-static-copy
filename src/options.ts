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
}

export type ResolvedViteStaticCopyOptions = {
  targets: Target[]
  flatten: boolean
}

export const resolveOptions = (
  options: ViteStaticCopyOptions
): ResolvedViteStaticCopyOptions => ({
  targets: options.targets,
  flatten: options.flatten ?? true
})
