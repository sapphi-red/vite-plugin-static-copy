import { glob } from 'tinyglobby'
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
import pMap from 'p-map'

export type SimpleTarget = {
  src: string
  dest: string
  transform?: TransformOption
  preserveTimestamps: boolean
  dereference: boolean
  overwrite: boolean | 'error'
}

type ResolvedTarget = SimpleTarget & {
  resolvedDest: string
  resolvedSrc: string
}

/**
 * Whether a is a subdirectory of b or equal to b
 *
 * @param a absolute path
 * @param b absolute path
 */
export const isSubdirectoryOrEqual = (a: string, b: string) => {
  return a.startsWith(b + path.sep) || a === b
}

export const groupTargetsByDirectoryTree = <T extends { resolvedDest: string }>(
  targets: T[]
): T[][] => {
  const targetsWithOrder = targets
    .map((target, order) => ({ ...target, order }))
    .sort((a, b) =>
      a.resolvedDest === b.resolvedDest
        ? 0
        : a.resolvedDest > b.resolvedDest
          ? 1
          : -1
    )

  const groups: Record<string, (T & { order: number })[]> = {}
  for (const target of targetsWithOrder) {
    const { resolvedDest } = target
    const parent = Object.keys(groups).find(key =>
      isSubdirectoryOrEqual(key, resolvedDest)
    )
    if (parent) {
      groups[parent]!.push(target)
      continue
    }
    const child = Object.keys(groups).find(key =>
      isSubdirectoryOrEqual(resolvedDest, key)
    )
    if (child) {
      groups[resolvedDest] = [target, ...groups[child]!]
      delete groups[child]
      continue
    }

    groups[resolvedDest] = [target]
  }
  const groupList = Object.values(groups)
  for (const g of groupList) {
    g.sort((a, b) => a.order - b.order)
  }

  return groupList
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
  structured: boolean,
  silent: boolean
) => {
  const copyTargets: SimpleTarget[] = []

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

    const matchedPaths = await glob(src, {
      onlyFiles: false,
      dot: true,
      expandDirectories: false,
      cwd: root
    })

    if (matchedPaths.length === 0 && !silent) {
      throw new Error(`No file was found to copy on ${src} src.`)
    }
    for (const matchedPath of matchedPaths) {
      const relativeMatchedPath = path.isAbsolute(matchedPath)
        ? path.relative(root, matchedPath)
        : matchedPath
      const absoluteMatchedPath = path.resolve(root, matchedPath)

      if (transform) {
        const srcStat = await fs.stat(absoluteMatchedPath)
        if (!srcStat.isFile()) {
          throw new Error(
            `"transform" option only supports a file: '${relativeMatchedPath}' is not a file`
          )
        }
      }

      const { base, dir } = path.parse(relativeMatchedPath)

      let destDir: string
      if (!structured || !dir) {
        destDir = dest
      } else {
        const dirClean = dir.replace(/^(?:\.\.\/)+/, '')
        const destClean = `${dest}/${dirClean}`.replace(/^\/+|\/+$/g, '')
        destDir = destClean
      }

      copyTargets.push({
        src: relativeMatchedPath,
        dest: path.join(
          destDir,
          rename ? await renameTarget(base, rename, absoluteMatchedPath) : base
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
  dest: string,
  overwrite: boolean | 'error'
): Promise<{ copied: boolean }> {
  if (overwrite === false || overwrite === 'error') {
    const exists = await fsExists(dest)
    if (exists) {
      if (overwrite === false) {
        // skip copy
        return { copied: false }
      }
      if (overwrite === 'error') {
        throw new Error(`File ${dest} already exists`)
      }
    }
  }

  const transformedContent = await getTransformedContent(src, transform)
  if (transformedContent === null) {
    return { copied: false }
  }
  await fs.outputFile(dest, transformedContent)
  return { copied: true }
}

export const copyAll = async (
  rootSrc: string,
  rootDest: string,
  targets: Target[],
  structured: boolean,
  silent: boolean
) => {
  const copyTargets = await collectCopyTargets(
    rootSrc,
    targets,
    structured,
    silent
  )

  const resolvedTargets: ResolvedTarget[] = copyTargets.map(target => ({
    ...target,
    // use `path.resolve` because rootSrc/rootDest maybe absolute path
    resolvedSrc: path.resolve(rootSrc, target.src),
    resolvedDest: path.resolve(rootSrc, rootDest, target.dest)
  }))
  // group targets to avoid race condition in #14
  const groups = groupTargetsByDirectoryTree(resolvedTargets)

  let copiedCount = 0
  await pMap(
    groups,
    async targetGroup => {
      for (const resolvedTarget of targetGroup) {
        const {
          resolvedSrc,
          resolvedDest,
          transform,
          preserveTimestamps,
          dereference,
          overwrite
        } = resolvedTarget

        const transformOption = resolveTransformOption(transform)

        if (transformOption) {
          const result = await transformCopy(
            transformOption,
            resolvedSrc,
            resolvedDest,
            overwrite
          )
          if (result.copied) {
            copiedCount++
          }
        } else {
          await fs.copy(resolvedSrc, resolvedDest, {
            preserveTimestamps,
            dereference,
            overwrite: overwrite === true,
            errorOnExist: overwrite === 'error'
          })
          copiedCount++
        }
      }
    },
    { concurrency: 5 }
  )

  return { targets: copyTargets.length, copied: copiedCount }
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
  result: { targets: number; copied: number }
) => {
  if (result.targets > 0) {
    const copiedMessage = pc.green(`Copied ${result.copied} items.`)
    const skipped = result.targets - result.copied
    const skippedMessage =
      skipped > 0 ? ` ${pc.gray(`(Skipped ${skipped} items.)`)}` : ''
    logger.info(formatConsole(`${copiedMessage}${skippedMessage}`))
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

async function fsExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p)
  } catch (e) {
    if ((e as { code: string }).code === 'ENOENT') {
      return false
    }
    throw e
  }
  return true
}
