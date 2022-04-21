import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import { build, createServer, ViteDevServer } from 'vite'
import fetch from 'node-fetch'
import { testcases } from './testcases'
import { config, loadFileContent } from './utils'
import { join } from 'node:path'

describe('serve', () => {
  let server: ViteDevServer

  beforeAll(async () => {
    server = await createServer(config)
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

  for (const { name, src, dest, transform } of testcases) {
    test.concurrent(name, async () => {
      const actual = await fetchTextContent(dest)
      const expected = await loadFileContent(src)
      expect(actual).toBe(transform ? transform(expected) : expected)
    })
  }
})

describe('build', () => {
  beforeAll(async () => {
    await build(config)
  })

  for (const { name, src, dest, transform } of testcases) {
    test.concurrent(name, async () => {
      const actual = await loadFileContent(join('./dist', `.${dest}`))
      const expected = await loadFileContent(src)
      expect(actual).toBe(transform ? transform(expected) : expected)
    })
  }
})
