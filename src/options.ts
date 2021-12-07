export type Target = { src: string | string[]; dest: string }

export type ViteStaticCopyOptions = {
  devCopyDir?: string
  targets: Target[]
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
