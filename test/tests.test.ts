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

const fetchTextContent = async (
  server: ViteDevServer | PreviewServer,
  path: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const port = (server.httpServer!.address() as AddressInfo).port
  const url = `http://localhost:${port}${path}`
  const res = await fetch(url)
  const content = await res.text()
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

      for (const { name, src, dest, transformedContent } of tests) {
        test.concurrent(name, async () => {
          const actual = await fetchTextContent(server, dest)
          const expected = await loadFileContent(src)
          expect(actual).toBe(transformedContent ?? expected)
        })
      }
    })
  }
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

      for (const { name, src, dest, transformedContent } of tests) {
        test.concurrent(name, async () => {
          const actual = await fetchTextContent(server, dest)
          const expected = await loadFileContent(src)
          expect(actual).toBe(transformedContent ?? expected)
        })
      }
    })
  }
})
