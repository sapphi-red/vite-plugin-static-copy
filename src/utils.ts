import { glob } from 'tinyglobby'
import path from 'node:path'
import fs from 'node:fs/promises'
import pc from 'picocolors'
import type {
  RenameFunc,
  Target,
  TransformOption,
  TransformOptionObject,
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
 * Note: Uses case-insensitive comparison regardless of filesystem behavior
 *
 * @param a absolute path
 * @param b absolute path
 */
export const isSubdirectoryOrEqual = (a: string, b: string) => {
  const normalizedA = a.toLowerCase()
  const normalizedB = b.toLowerCase()
  return (
    normalizedA.startsWith(normalizedB + path.sep) ||
    normalizedA === normalizedB
  )
}

type DirectoryTrieNode<T> = {
  children: Map<string, DirectoryTrieNode<T>>
  targets: T[]
}

const createTrieNode = <T>(): DirectoryTrieNode<T> => ({
  children: new Map<string, DirectoryTrieNode<T>>(),
  targets: [],
})

const createPathNormalizer = (): ((filePath: string) => string) => {
  const pathCache = new Map<string, string>()
  return (filePath) => {
    if (!pathCache.has(filePath)) {
      const normalizedPath = path
        .normalize(filePath)
        .toLowerCase()
        .replace(/\\/g, '/')
      pathCache.set(filePath, normalizedPath)
    }
    return pathCache.get(filePath)!
  }
}

const splitPath = function* (
  normalizedPath: string,
): Generator<string, void, unknown> {
  const cleaned = normalizedPath.replace(/^\/+|\/+$/g, '')
  if (cleaned === '') {
    return
  }

  let start = 0
  while (start < cleaned.length) {
    const idx = cleaned.indexOf('/', start)
    if (idx === -1) {
      yield cleaned.slice(start)
      break
    }
    yield cleaned.slice(start, idx)
    start = idx + 1
  }
}

export const groupTargetsByDirectoryTree = <T extends { resolvedDest: string }>(
  targets: T[],
): T[][] => {
  if (targets.length === 0) {
    return []
  }
  if (targets.length === 1) {
    return [targets]
  }

  const targetsWithOrder = targets.map((target, order) => ({
    ...target,
    order,
  }))

  type TWithOrder = T & { order: number }
  const getNormalizedPath = createPathNormalizer()

  // build trie
  const root = createTrieNode<TWithOrder>()
  for (const target of targetsWithOrder) {
    const normalizedPath = getNormalizedPath(target.resolvedDest)
    const segments = splitPath(normalizedPath)

    let currentNode = root
    for (const segment of segments) {
      if (!currentNode.children.has(segment)) {
        currentNode.children.set(segment, createTrieNode())
      }
      currentNode = currentNode.children.get(segment)!
    }

    currentNode.targets.push(target)
  }

  const groups: TWithOrder[][] = []

  const collectGroups = (node: DirectoryTrieNode<TWithOrder>): TWithOrder[] => {
    if (node.children.size === 0) {
      return node.targets
    }

    // If this node has targets, collect all child targets into this group
    if (node.targets.length > 0) {
      const allTargets: TWithOrder[] = [...node.targets]

      for (const child of node.children.values()) {
        const childTargets = collectTargets(child)
        if (childTargets.length > 0) {
          allTargets.push(...childTargets)
        }
      }
      return allTargets
    }

    // If this node has no targets, process children separately
    for (const child of node.children.values()) {
      const childTargets = collectGroups(child)
      if (childTargets.length > 0) {
        groups.push(childTargets)
      }
    }

    return []
  }

  const collectTargets = (
    node: DirectoryTrieNode<TWithOrder>,
  ): TWithOrder[] => {
    if (node.children.size === 0) {
      return node.targets
    }

    const allTargets: TWithOrder[] = [...node.targets]
    for (const child of node.children.values()) {
      const childTargets = collectTargets(child)
      if (childTargets.length > 0) {
        allTargets.push(...childTargets)
      }
    }
    return allTargets
  }

  const rootTargets = collectGroups(root)
  if (rootTargets.length > 0) {
    groups.push(rootTargets)
  }

  // Sort targets within each group by original order
  for (const group of groups) {
    group.sort((a, b) => a.order - b.order)
  }
  return groups
}

async function renameTarget(
  target: string,
  rename: string | RenameFunc,
  src: string,
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
  silent: boolean,
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
      overwrite,
    } = target

    const matchedPaths = await glob(src, {
      onlyFiles: false,
      dot: true,
      expandDirectories: false,
      cwd: root,
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
            `"transform" option only supports a file: '${relativeMatchedPath}' is not a file`,
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
          rename ? await renameTarget(base, rename, absoluteMatchedPath) : base,
        ),
        transform,
        preserveTimestamps: preserveTimestamps ?? false,
        dereference: dereference ?? true,
        overwrite: overwrite ?? true,
      })
    }
  }
  return copyTargets
}

export async function getTransformedContent(
  file: string,
  transform: TransformOptionObject,
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
  overwrite: boolean | 'error',
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
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, transformedContent)
  return { copied: true }
}

export const copyAll = async (
  rootSrc: string,
  rootDest: string,
  targets: Target[],
  structured: boolean,
  silent: boolean,
) => {
  const copyTargets = await collectCopyTargets(
    rootSrc,
    targets,
    structured,
    silent,
  )

  const resolvedTargets: ResolvedTarget[] = copyTargets.map((target) => ({
    ...target,
    // use `path.resolve` because rootSrc/rootDest maybe absolute path
    resolvedSrc: path.resolve(rootSrc, target.src),
    resolvedDest: path.resolve(rootSrc, rootDest, target.dest),
  }))
  // group targets to avoid race condition in #14
  const groups = groupTargetsByDirectoryTree(resolvedTargets)

  let copiedCount = 0
  await pMap(
    groups,
    async (targetGroup) => {
      for (const resolvedTarget of targetGroup) {
        const {
          resolvedSrc,
          resolvedDest,
          transform,
          preserveTimestamps,
          dereference,
          overwrite,
        } = resolvedTarget

        const transformOption = resolveTransformOption(transform)

        if (transformOption) {
          const result = await transformCopy(
            transformOption,
            resolvedSrc,
            resolvedDest,
            overwrite,
          )
          if (result.copied) {
            copiedCount++
          }
        } else {
          await fs.cp(resolvedSrc, resolvedDest, {
            recursive: true,
            preserveTimestamps,
            dereference,
            force: overwrite === true,
            errorOnExist: overwrite === 'error',
          })
          copiedCount++
        }
      }
    },
    { concurrency: 5 },
  )

  return { targets: copyTargets.length, copied: copiedCount }
}

export const updateFileMapFromTargets = (
  targets: SimpleTarget[],
  fileMap: FileMap,
  absoluteBuildOutDir: string,
) => {
  fileMap.clear()
  for (const target of [...targets].reverse()) {
    let dest = path.isAbsolute(target.dest)
      ? path.relative(absoluteBuildOutDir, target.dest)
      : target.dest
    dest = dest.replace(/\\/g, '/')
    if (path.isAbsolute(dest) || dest.startsWith('../')) {
      // outside buildOutDir
      continue
    }
    if (dest.startsWith('./')) {
      dest = dest.slice(1)
    } else if (!dest.startsWith('/')) {
      dest = `/${dest}`
    }

    if (!fileMap.has(dest)) {
      fileMap.set(dest, [])
    }
    fileMap.get(dest)!.push({
      src: target.src,
      dest: target.dest,
      overwrite: target.overwrite,
      transform: target.transform,
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
      formatConsole(pc.green(`Collected ${collectedMap.size} items.`)),
    )
    if (process.env.DEBUG === 'vite:plugin-static-copy') {
      for (const [key, vals] of collectedMap) {
        for (const val of vals) {
          logger.info(
            formatConsole(
              `  - '${key}' -> '${val.src}'${
                val.transform ? ' (with content transform)' : ''
              }`,
            ),
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
  result: { targets: number; copied: number },
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
  transformOption: TransformOption | undefined,
): TransformOptionObject | undefined {
  if (typeof transformOption === 'function') {
    return {
      handler: transformOption,
      encoding: 'utf8',
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
