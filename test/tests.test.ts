import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import {
  build,
  createServer,
  preview,
  PreviewServer,
  ViteDevServer
} from 'vite'
import fetch from 'node-fetch'
import { testcases } from './testcases'
import { getConfig, loadFileContent, loadFileETag } from './utils'
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
  return content
}

const fetchEtagHeader = async (
  server: ViteDevServer | PreviewServer,
  path: string
) => {
  const res = await fetchFromServer(server, path)
  return res.headers.get('ETag')
}

describe('serve', () => {
  for (const [configFile, tests] of Object.entries(testcases)) {
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
        test.concurrent(name, async () => {
          // If we are testing a binary file we want to use the Etag header to
          // check if the file is identitcal.
          if (encoding === 'binary') {
            const actualETag = await fetchEtagHeader(server, dest)
            const expectedETag =
              src === null ? null : await loadFileETag(src, 'binary')
            expect(actualETag).toBe(expectedETag)
          } else {
            const actual = await fetchTextContent(server, dest)
            const expected = src === null ? null : await loadFileContent(src)
            expect(actual).toBe(transformedContent ?? expected)
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
  })
})

describe('build', () => {
  for (const [configFile, tests] of Object.entries(testcases)) {
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
        test.concurrent(name, async () => {
          if (encoding === 'binary') {
            const actualETag = await fetchEtagHeader(server, dest)
            const expectedETag =
              src === null ? null : await loadFileETag(src, 'binary')
            expect(actualETag).toBe(expectedETag)
          } else {
            const actual = await fetchTextContent(server, dest)
            const expected = src === null ? null : await loadFileContent(src)
            expect(actual).toBe(transformedContent ?? expected)
          }
        })
      }
    })
  }
})
