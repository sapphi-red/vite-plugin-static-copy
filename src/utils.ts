import fastglob from 'fast-glob'
import path from 'node:path'
import fs from 'fs-extra'
import pc from 'picocolors'
import type { Target, TransformFunc } from './options'
import type { Logger } from 'vite'
import type { FileMap } from './serve'
import { createHash } from 'node:crypto'

export type SimpleTarget = {
  src: string
  dest: string
  transform?: TransformFunc
  preserveTimestamps: boolean
}

export const collectCopyTargets = async (
  root: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets: Array<SimpleTarget> = []

  for (const { src, dest, rename, transform, preserveTimestamps } of targets) {
    const matchedPaths = await fastglob(src, {
      onlyFiles: false,
      dot: true,
      cwd: root
    })

    for (const matchedPath of matchedPaths) {
      if (transform) {
        const srcStat = await fs.stat(path.resolve(root, matchedPath))
        if (!srcStat.isFile()) {
          throw new Error(
            `"transform" option only supports a file: '${matchedPath}' is not a file`
          )
        }
      }

      // https://github.com/vladshcherbin/rollup-plugin-copy/blob/507bf5e99aa2c6d0d858821e627cb7617a1d9a6d/src/index.js#L32-L35
      const { base, dir } = path.parse(matchedPath)
      const destDir =
        flatten || (!flatten && !dir)
          ? dest
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            dir.replace(dir.split('/')[0]!, dest)

      copyTargets.push({
        src: matchedPath,
        dest: path.join(destDir, rename ?? base),
        transform,
        preserveTimestamps: preserveTimestamps ?? false
      })
    }
  }
  return copyTargets
}

async function transformCopy(
  transform: (content: string, filepath: string) => string,
  src: string,
  dest: string
) {
  const content = await fs.readFile(src, 'utf8')
  const transformedContent = transform(content, src)
  if (transformedContent != null) {
    await fs.outputFile(dest, transformedContent)
  }
}

export const copyAll = async (
  rootSrc: string,
  rootDest: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets = await collectCopyTargets(rootSrc, targets, flatten)
  for (const { src, dest, transform, preserveTimestamps } of copyTargets) {
    // use `path.resolve` because rootSrc/rootDest maybe absolute path
    const resolvedSrc = path.resolve(rootSrc, src)
    const resolvedDest = path.resolve(rootSrc, rootDest, dest)
    if (transform) {
      await transformCopy(transform, resolvedSrc, resolvedDest)
    } else {
      await fs.copy(resolvedSrc, resolvedDest, { preserveTimestamps })
    }
  }

  return copyTargets.length
}

export const updateFileMapFromTargets = (
  targets: SimpleTarget[],
  fileMap: FileMap
) => {
  fileMap.clear()
  for (const target of [...targets].reverse()) {
    let dest = target.dest.replace(/\\/g, '/')
    if (!dest.startsWith('/')) {
      dest = `/${dest}`
    }

    if (!fileMap.has(dest)) {
      fileMap.set(dest, [])
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fileMap.get(dest)!.push({
      src: target.src,
      transform: target.transform
    })
  }
}

export const calculateMd5Base64 = (content: string) =>
  createHash('md5').update(content).digest('base64')

export const formatConsole = (msg: string) =>
  `${pc.cyan('[vite-plugin-static-copy]')} ${msg}`

export const outputCollectedLog = (logger: Logger, collectedMap: FileMap) => {
  if (collectedMap.size > 0) {
    logger.info(
      formatConsole(pc.green(`Collected ${collectedMap.size} items.`))
    )
    if (process.env.DEBUG === 'vite:plugin-static-copy') {
      for (const [key, vals] of collectedMap) {
        for (const val of vals) {
          logger.info(
            formatConsole(
              `  - '${key}' -> '${val.src}'${
                val.transform ? ' (with content transform)' : ''
              }`
            )
          )
        }
      }
    }
  } else {
    logger.warn(formatConsole(pc.yellow('No items found.')))
  }
}

export const outputCopyLog = (
  logger: Logger,
  copyCount: number | undefined
) => {
  if (copyCount === undefined) {
    logger.error(formatConsole(pc.yellow('Copy count was not set.')))
  } else if (copyCount > 0) {
    logger.info(formatConsole(pc.green(`Copied ${copyCount} items.`)))
  } else {
    logger.warn(formatConsole(pc.yellow('No items to copy.')))
  }
}
