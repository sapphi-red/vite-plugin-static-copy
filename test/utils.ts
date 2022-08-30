import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { InlineConfig, normalizePath } from 'vite'

export const root = new URL('./fixtures/', import.meta.url)

const fileURLToNormalizedPath = (url: URL) => normalizePath(fileURLToPath(url))

export const getConfig = (filename: string): InlineConfig => ({
  logLevel: 'silent',
  root: fileURLToNormalizedPath(root),
  configFile: fileURLToNormalizedPath(new URL(`./${filename}`, root))
})

export const loadFileContent = async (
  path: string,
  encoding: BufferEncoding = 'utf8'
) => {
  const absolutePath = new URL(path, root)
  const content = await readFile(absolutePath, encoding)
  return content
}
