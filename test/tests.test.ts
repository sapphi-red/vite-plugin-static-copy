import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import type { PreviewServer, ViteDevServer } from 'vite'
import { build, createServer, preview } from 'vite'
import fetch from 'node-fetch'
import { testcases } from './testcases'
import { getConfig, loadFileContent, normalizeLineBreak } from './utils'
import type { AddressInfo } from 'node:net'

const fetchFromServer = async (
  server: ViteDevServer | PreviewServer,
  path: string
) => {
  const port = (server.httpServer!.address() as AddressInfo).port
  const url = `http://localhost:${port}${path}`
  const res = await fetch(url)
  return res
}

const fetchContent = async (
  server: ViteDevServer | PreviewServer,
  path: string,
  encoding?: BufferEncoding | 'buffer'
) => {
  const res = await fetchFromServer(server, path)
  let content: string | ArrayBuffer | null = null

  if (res.status === 200) {
    content =
      encoding === 'buffer'
        ? await res.arrayBuffer()
        : normalizeLineBreak(await res.text())
  }

  const contentType = res.headers.get('content-type')
  return { content, contentType }
}

describe('serve', () => {
  for (const [configFile, tests] of Object.entries(testcases)) {
    // eslint-disable-next-line vitest/valid-title
    describe(configFile, () => {
      let server: ViteDevServer
      beforeAll(async () => {
        server = await createServer(getConfig(configFile))
        server = await server.listen()
      })
      afterAll(async () => {
        await server.close()
      })

      for (const {
        name,
        src,
        dest,
        transformedContent,
        encoding,
        contentType
      } of tests) {
        // eslint-disable-next-line vitest/valid-title
        test.concurrent(name, async () => {
          const expected =
            src === null ? null : await loadFileContent(src, encoding)
          const actual = await fetchContent(server, dest, encoding)
          expect(actual.content).toStrictEqual(transformedContent ?? expected)

          if (contentType !== undefined) {
            expect(actual.contentType).toStrictEqual(contentType)
          }
        })
      }
    })
  }

  describe('vite.other.config.ts', () => {
    let server: ViteDevServer
    beforeAll(async () => {
      server = await createServer(getConfig('vite.other.config.ts'))
      server = await server.listen()
    })
    afterAll(async () => {
      await server.close()
    })

    test.concurrent('cors', async () => {
      const res = await fetchFromServer(server, '/fixture1/foo.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    test.concurrent('headers', async () => {
      const res = await fetchFromServer(server, '/fixture1/foo.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe(
        'require-corp'
      )
      expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin')
    })
  })
})

describe('build', () => {
  for (const [configFile, tests] of Object.entries(testcases)) {
    // eslint-disable-next-line vitest/valid-title
    describe(configFile, () => {
      let server: PreviewServer
      beforeAll(async () => {
        await build(getConfig(configFile))
        server = await preview(getConfig(configFile))
      })
      afterAll(async () => {
        await new Promise<void>(resolve => {
          server.httpServer.close(() => {
            resolve()
          })
        })
      })

      for (const { name, src, dest, transformedContent, encoding } of tests) {
        // eslint-disable-next-line vitest/valid-title
        test.concurrent(name, async () => {
          const expected =
            src === null ? null : await loadFileContent(src, encoding)
          const actual = await fetchContent(server, dest, encoding)
          expect(actual.content).toStrictEqual(transformedContent ?? expected)
        })
      }
    })
  }
})
