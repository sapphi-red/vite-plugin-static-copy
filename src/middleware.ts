// based on https://github.com/vitejs/vite/blob/7edabb46de3ce63e078e0cda7cd3ed9e5cdd0f2a/packages/vite/src/node/server/middlewares/static.ts#L19-L46
// MIT License
// Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors
// https://github.com/vitejs/vite/blob/7edabb46de3ce63e078e0cda7cd3ed9e5cdd0f2a/LICENSE

// based on https://github.com/lukeed/sirv/blob/886cc962a345780cd78f8910cdcf218db2a8d955/packages/sirv/index.js
// MIT License
// Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (https://lukeed.com)
// https://github.com/lukeed/sirv/blob/886cc962a345780cd78f8910cdcf218db2a8d955/license

import { parse } from '@polka/url'
import { lookup } from 'mrmime'
import { statSync, createReadStream, Stats } from 'node:fs'
import type { Connect } from 'vite'
import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse
} from 'node:http'
import { resolve } from 'node:path'

const FS_PREFIX = `/@fs/`
const VALID_ID_PREFIX = `/@id/`
const CLIENT_PUBLIC_PATH = `/@vite/client`
const ENV_PUBLIC_PATH = `/@vite/env`
const importQueryRE = /(\?|&)import=?(?:&|$)/
const internalPrefixes = [
  FS_PREFIX,
  VALID_ID_PREFIX,
  CLIENT_PUBLIC_PATH,
  ENV_PUBLIC_PATH
]
const InternalPrefixRE = new RegExp(`^(?:${internalPrefixes.join('|')})`)
const isImportRequest = (url: string): boolean => importQueryRE.test(url)
const isInternalRequest = (url: string): boolean => InternalPrefixRE.test(url)

function viaLocal(root: string, fileMap: Map<string, string>, uri: string) {
  if (uri.endsWith('/')) {
    uri = uri.slice(-1)
  }
  const file = fileMap.get(uri)
  if (file) {
    const filepath = resolve(root, file)
    const stats = statSync(filepath)
    const headers = toHeaders(filepath, stats)
    return { filepath, stats, headers }
  }
  return undefined
}

function toHeaders(name: string, stats: Stats) {
  let ctype = lookup(name) || ''
  if (ctype === 'text/html') ctype += ';charset=utf-8'

  const headers: OutgoingHttpHeaders = {
    'Content-Length': stats.size,
    'Content-Type': ctype,
    'Last-Modified': stats.mtime.toUTCString(),
    ETag: `W/"${stats.size}-${stats.mtime.getTime()}"`,
    'Cache-Control': 'no-cache'
  }

  return headers
}

function send(
  req: IncomingMessage,
  res: ServerResponse,
  file: string,
  stats: Stats,
  headers: OutgoingHttpHeaders
) {
  let code = 200
  const opts: { start?: number; end?: number } = {}
  headers = { ...headers }

  for (const key in headers) {
    const tmp = res.getHeader(key)
    if (tmp) headers[key] = tmp
  }

  const contentTypeHeader = res.getHeader('content-type')
  if (contentTypeHeader) {
    headers['Content-Type'] = contentTypeHeader
  }

  if (req.headers.range) {
    code = 206
    const [x, y] = req.headers.range.replace('bytes=', '').split('-')
    const end = (y ? parseInt(y, 10) : 0) || stats.size - 1
    const start = (x ? parseInt(x, 10) : 0) || 0
    opts.end = end
    opts.start = start

    if (start >= stats.size || end >= stats.size) {
      res.setHeader('Content-Range', `bytes */${stats.size}`)
      res.statusCode = 416
      return res.end()
    }

    headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`
    headers['Content-Length'] = end - start + 1
    headers['Accept-Ranges'] = 'bytes'
  }

  res.writeHead(code, headers)
  createReadStream(file, opts).pipe(res)
}

export function serveStaticCopyMiddleware(
  root: string,
  fileMap: Map<string, string>
): Connect.NextHandleFunction {
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  return function viteServeStaticCopyMiddleware(req, res, next) {
    // skip import request and internal requests `/@fs/ /@vite-client` etc...
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (isImportRequest(req.url!) || isInternalRequest(req.url!)) {
      return next()
    }

    let pathname = parse(req).pathname
    if (pathname.includes('%')) {
      try {
        pathname = decodeURIComponent(pathname)
      } catch (err) {
        /* malform uri */
      }
    }

    const data = viaLocal(root, fileMap, pathname)
    if (!data) {
      if (next) {
        next()
        return
      }
      res.statusCode = 404
      res.end()
      return
    }

    if (req.headers['if-none-match'] === data.headers['ETag']) {
      res.writeHead(304)
      res.end()
      return
    }

    // Matches js, jsx, ts, tsx.
    // The reason this is done, is that the .ts file extension is reserved
    // for the MIME type video/mp2t. In almost all cases, we can expect
    // these files to be TypeScript files, and for Vite to serve them with
    // this Content-Type.
    if (/\.[tj]sx?$/.test(pathname)) {
      res.setHeader('Content-Type', 'application/javascript')
    }

    send(req, res, data.filepath, data.stats, data.headers)
  }
}
