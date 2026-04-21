import { describe, test, expect } from 'vitest'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildPlugin } from './build'
import type { ResolvedConfig } from 'vite'

const makeConfig = (root: string, outDir: string): ResolvedConfig =>
  ({
    root,
    build: { outDir },
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  }) as unknown as ResolvedConfig

describe('buildPlugin', () => {
  test('uses environment-specific outDir when configResolved is called for multiple environments', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vite-static-copy-'))
    const clientOutDir = join(root, 'dist-client')
    const ssrOutDir = join(root, 'dist-ssr')
    await mkdir(clientOutDir, { recursive: true })
    await mkdir(ssrOutDir, { recursive: true })
    await writeFile(join(root, 'foo.txt'), 'foo\n')

    const plugin = buildPlugin({
      targets: [{ src: 'foo.txt', dest: 'out' }],
      silent: true,
      hook: 'writeBundle',
      environment: 'client',
      watch: { options: {}, reloadPageOnChange: false },
    })

    const clientConfig = makeConfig(root, clientOutDir)
    const ssrConfig = makeConfig(root, ssrOutDir)

    // Simulate Vite 6: configResolved fires for all environments during
    // builder setup, before any builds start. SSR is last, overwriting config.
    ;(plugin.configResolved as Function).call({}, clientConfig)
    ;(plugin.configResolved as Function).call({}, ssrConfig)

    // writeBundle fires for the client environment
    await (plugin as any).writeBundle.call({
      environment: { name: 'client', config: clientConfig },
    })

    // without fix: ssrOutDir used (config.build.outDir = ssrOutDir, last resolved)
    // with fix: clientOutDir used (this.environment.config.build.outDir)
    await expect(readFile(join(clientOutDir, 'out', 'foo.txt'), 'utf8')).resolves.toBe('foo\n')
    await expect(readFile(join(ssrOutDir, 'out', 'foo.txt'), 'utf8')).rejects.toThrow()
  })
})
