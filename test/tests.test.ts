import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import { build, createServer, ViteDevServer } from 'vite'
import fetch from 'node-fetch'
import { testcases } from './testcases'
import { getConfig, loadFileContent } from './utils'
import { join } from 'node:path'

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

      const fetchTextContent = async (path: string) => {
        const url = `http://localhost:${server.config.server.port}${path}`
        const res = await fetch(url)
        const content = await res.text()
        return content
      }

      for (const { name, src, dest, transformedContent } of tests) {
        test.concurrent(name, async () => {
          const actual = await fetchTextContent(dest)
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
      beforeAll(async () => {
        await build(getConfig(configFile))
      })

      for (const { name, src, dest, transformedContent } of tests) {
        test.concurrent(name, async () => {
          const actual = await loadFileContent(join('./dist', `.${dest}`))
          const expected = await loadFileContent(src)
          expect(actual).toBe(transformedContent ?? expected)
        })
      }
    })
  }
})
