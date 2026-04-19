import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { viteStaticCopy } from '../src'

const fetchFrom = async (server: ViteDevServer, urlPath: string) => {
  const port = (server.httpServer!.address() as AddressInfo).port
  const res = await fetch(`http://localhost:${port}${urlPath}`)
  return {
    status: res.status,
    body: res.status === 200 ? await res.text() : null,
  }
}

const waitFor = async <T>(
  fn: () => Promise<T>,
  predicate: (v: T) => boolean,
  timeoutMs = 5000,
  intervalMs = 50,
): Promise<T> => {
  const deadline = Date.now() + timeoutMs
  while (true) {
    const last = await fn()
    if (predicate(last)) return last
    if (Date.now() >= deadline) {
      throw new Error('waitFor timed out')
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

describe('dev-server watcher', () => {
  let root: string
  let server: ViteDevServer

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vps-watch-'))
    await mkdir(path.join(root, 'assets'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'initial.txt'), 'initial')
    await writeFile(path.join(root, 'direct.txt'), 'direct')

    server = await createServer({
      root,
      logLevel: 'silent',
      appType: 'custom',
      plugins: [
        viteStaticCopy({
          targets: [
            { src: 'assets/**/*.txt', dest: 'copied' },
            { src: 'direct.txt', dest: 'copied' },
          ],
        }),
      ],
    })
    await server.listen()
    // give chokidar's initial scan time to finish so subsequent writes
    // are reported as real `add` events rather than initial-scan entries
    await new Promise((r) => setTimeout(r, 300))
  })

  afterAll(async () => {
    await server.close()
    await rm(root, { recursive: true, force: true })
  })

  test('serves glob-matched file that existed at startup', async () => {
    const { status, body } = await fetchFrom(
      server,
      '/copied/assets/initial.txt',
    )
    expect(status).toBe(200)
    expect(body).toBe('initial')
  })

  test('serves literal-path file that existed at startup', async () => {
    const { status, body } = await fetchFrom(server, '/copied/direct.txt')
    expect(status).toBe(200)
    expect(body).toBe('direct')
  })

  test('detects new file added under a glob source', async () => {
    await writeFile(path.join(root, 'assets', 'new.txt'), 'new-content')
    const result = await waitFor(
      () => fetchFrom(server, '/copied/assets/new.txt'),
      (r) => r.status === 200,
    )
    expect(result.body).toBe('new-content')
  })

  test('detects new file in a subdirectory matched by **', async () => {
    await mkdir(path.join(root, 'assets', 'nested'), { recursive: true })
    await writeFile(
      path.join(root, 'assets', 'nested', 'deep.txt'),
      'deep-content',
    )
    const result = await waitFor(
      () => fetchFrom(server, '/copied/assets/nested/deep.txt'),
      (r) => r.status === 200,
    )
    expect(result.body).toBe('deep-content')
  })

  test('ignores new file that does not match any glob', async () => {
    await writeFile(path.join(root, 'assets', 'ignored.md'), 'ignored')
    // give the watcher time to observe the write and (correctly) skip it
    await new Promise((r) => setTimeout(r, 500))
    const { status } = await fetchFrom(server, '/copied/assets/ignored.md')
    expect(status).toBe(404)
  })
})

describe('dev-server watcher — shallow-glob only config', () => {
  // All-shallow config exercises the depth-bounded watcher path: no `**`,
  // no literal paths that could be a directory, so chokidar should be run
  // with a bounded `depth` rather than recursing unbounded.
  let root: string
  let server: ViteDevServer

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vps-watch-shallow-'))
    await mkdir(path.join(root, 'shallow'), { recursive: true })
    await writeFile(path.join(root, 'shallow', 'initial.txt'), 'initial')

    server = await createServer({
      root,
      logLevel: 'silent',
      appType: 'custom',
      plugins: [
        viteStaticCopy({
          targets: [{ src: 'shallow/*.txt', dest: 'copied' }],
        }),
      ],
    })
    await server.listen()
    await new Promise((r) => setTimeout(r, 300))
  })

  afterAll(async () => {
    await server.close()
    await rm(root, { recursive: true, force: true })
  })

  test('serves files directly in the base directory', async () => {
    const { status, body } = await fetchFrom(
      server,
      '/copied/shallow/initial.txt',
    )
    expect(status).toBe(200)
    expect(body).toBe('initial')
  })

  test('detects a new file directly in the base directory', async () => {
    await writeFile(path.join(root, 'shallow', 'new.txt'), 'new-shallow')
    const result = await waitFor(
      () => fetchFrom(server, '/copied/shallow/new.txt'),
      (r) => r.status === 200,
    )
    expect(result.body).toBe('new-shallow')
  })
})
