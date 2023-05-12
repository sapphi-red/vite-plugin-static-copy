import fastglob from 'fast-glob'
import path from 'node:path'
import fs from 'fs-extra'
import pc from 'picocolors'
import type {
  RenameFunc,
  Target,
  TransformOption,
  TransformOptionObject
} from './options'
import type { Logger } from 'vite'
import type { FileMap } from './serve'
import { createHash } from 'node:crypto'

export type SimpleTarget = {
  src: string
  dest: string
  transform?: TransformOption
  preserveTimestamps: boolean
  dereference: boolean
  overwrite: boolean | 'error'
}

async function renameTarget(
  target: string,
  rename: string | RenameFunc,
  src: string
): Promise<string> {
  const parsedPath = path.parse(target)

  if (typeof rename === 'string') {
    return rename
  }

  return rename(parsedPath.name, parsedPath.ext.replace('.', ''), src)
}

export const collectCopyTargets = async (
  root: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets: Array<SimpleTarget> = []

  for (const target of targets) {
    const {
      src,
      dest,
      rename,
      transform,
      preserveTimestamps,
      dereference,
      overwrite
    } = target

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
        dest: path.join(
          destDir,
          rename ? await renameTarget(base, rename, matchedPath) : base
        ),
        transform,
        preserveTimestamps: preserveTimestamps ?? false,
        dereference: dereference ?? true,
        overwrite: overwrite ?? true
      })
    }
  }
  return copyTargets
}

export async function getTransformedContent(
  file: string,
  transform: TransformOptionObject
) {
  if (transform.encoding === 'buffer') {
    const content = await fs.readFile(file)
    return transform.handler(content, file)
  }

  const content = await fs.readFile(file, transform.encoding)
  return transform.handler(content, file)
}

async function transformCopy(
  transform: TransformOptionObject,
  src: string,
  dest: string
) {
  const transformedContent = await getTransformedContent(src, transform)
  if (transformedContent !== null) {
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
  for (const copyTarget of copyTargets) {
    const {
      src,
      dest,
      transform,
      preserveTimestamps,
      dereference,
      overwrite
    } = copyTarget

    // use `path.resolve` because rootSrc/rootDest maybe absolute path
    const resolvedSrc = path.resolve(rootSrc, src)
    const resolvedDest = path.resolve(rootSrc, rootDest, dest)
    const transformOption = resolveTransformOption(transform)
    if (transformOption) {
      await transformCopy(transformOption, resolvedSrc, resolvedDest)
    } else {
      await fs.copy(resolvedSrc, resolvedDest, {
        preserveTimestamps,
        dereference,
        overwrite: overwrite === true,
        errorOnExist: overwrite === 'error'
      })
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
      dest: target.dest,
      overwrite: target.overwrite,
      transform: target.transform
    })
  }
}

export const calculateMd5Base64 = (content: string | Buffer) =>
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

export function resolveTransformOption(
  transformOption: TransformOption | undefined
): TransformOptionObject | undefined {
  if (typeof transformOption === 'function') {
    return {
      handler: transformOption,
      encoding: 'utf8'
    }
  }
  return transformOption
}
