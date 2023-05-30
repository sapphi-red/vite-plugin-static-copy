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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const port = (server.httpServer!.address() as AddressInfo).port
  const url = `http://localhost:${port}${path}`
  const res = await fetch(url)
  return res
}

const fetchTextContent = async (
  server: ViteDevServer | PreviewServer,
  path: string
) => {
  const res = await fetchFromServer(server, path)
  const content = res.status === 200 ? await res.text() : null
  return content ? normalizeLineBreak(content) : null
}

const fetchBufferContent = async (
  server: ViteDevServer | PreviewServer,
  path: string
) => {
  const res = await fetchFromServer(server, path)
  const content = res.status === 200 ? await res.arrayBuffer() : null
  return content
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

      for (const { name, src, dest, transformedContent, encoding } of tests) {
        // eslint-disable-next-line vitest/valid-title
        test.concurrent(name, async () => {
          const expected =
            src === null ? null : await loadFileContent(src, encoding)
          const actual =
            encoding === 'buffer'
              ? await fetchBufferContent(server, dest)
              : await fetchTextContent(server, dest)
          expect(actual).toStrictEqual(transformedContent ?? expected)
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
        server.printUrls
      })
      afterAll(() => {
        server.httpServer.close()
      })

      for (const { name, src, dest, transformedContent, encoding } of tests) {
        // eslint-disable-next-line vitest/valid-title
        test.concurrent(name, async () => {
          const expected =
            src === null ? null : await loadFileContent(src, encoding)
          const actual =
            encoding === 'buffer'
              ? await fetchBufferContent(server, dest)
              : await fetchTextContent(server, dest)
          expect(actual).toStrictEqual(transformedContent ?? expected)
        })
      }
    })
  }
})
