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
import { getConfig, loadFileContent } from './utils'
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
      const renameRes = await fetchFromServer(server, '/fixture2/foo2.txt')
      const renameFuncRes1 = await fetchFromServer(
        server,
        '/fixture3/v1/foo.txt'
      )
      // without renaming
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
      // with simple renaming
      expect(renameRes.status).toBe(200)
      // with renaming as a function
      expect(renameFuncRes1.status).toBe(200)
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
