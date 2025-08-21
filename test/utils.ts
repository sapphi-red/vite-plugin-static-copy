import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { InlineConfig } from 'vite'
import { normalizePath } from 'vite'
import net from 'node:net'

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
): Promise<string | ArrayBufferLike> => {
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

export const sendRawRequest = async (
  baseUrl: string,
  requestTarget: string
) => {
  return new Promise<string>((resolve, reject) => {
    const parsedUrl = new URL(baseUrl)

    const buf: Buffer[] = []
    const client = net.createConnection(
      { port: +parsedUrl.port, host: parsedUrl.hostname },
      () => {
        client.write(
          [
            `GET ${encodeURI(requestTarget)} HTTP/1.1`,
            `Host: ${parsedUrl.host}`,
            'Connection: Close',
            '\r\n'
          ].join('\r\n')
        )
      }
    )
    client.on('data', data => {
      buf.push(data)
    })
    client.on('end', (hadError: unknown) => {
      if (!hadError) {
        resolve(Buffer.concat(buf).toString())
      }
    })
    client.on('error', err => {
      reject(err)
    })
  })
}
