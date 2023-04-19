import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { InlineConfig } from 'vite'
import { normalizePath } from 'vite'

export const root = new URL('./fixtures/', import.meta.url)

const fileURLToNormalizedPath = (url: URL) => normalizePath(fileURLToPath(url))

export const getConfig = (filename: string): InlineConfig => ({
  logLevel: 'silent',
  root: fileURLToNormalizedPath(root),
  configFile: fileURLToNormalizedPath(new URL(`./${filename}`, root))
})

export const loadFileContent = async (
  path: string,
  encoding: BufferEncoding | 'buffer' = 'utf8'
): Promise<string | ArrayBuffer> => {
  const absolutePath = new URL(path, root)
  const content = await readFile(
    absolutePath,
    encoding === 'buffer' ? null : encoding
  )

  if (typeof content !== 'string') {
    return content.buffer
  }
  return normalizeLineBreak(content)
}

export const normalizeLineBreak = (input: string) =>
  input.replace(/\r\n/g, '\n')
