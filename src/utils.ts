import fastglob from 'fast-glob'
import path from 'path'
import fs from 'fs-extra'
import pc from 'picocolors'
import type { Target } from './options'
import type { Logger } from 'vite'

type SimpleTarget = { src: string; dest: string }

export const collectCopyTargets = async (
  root: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets: Array<SimpleTarget> = []

  for (const { src, dest, rename } of targets) {
    const matchedPaths = await fastglob(src, {
      onlyFiles: false,
      dot: true,
      cwd: root
    })

    for (const matchedPath of matchedPaths) {
      // https://github.com/vladshcherbin/rollup-plugin-copy/blob/507bf5e99aa2c6d0d858821e627cb7617a1d9a6d/src/index.js#L32-L35
      const { base, dir } = path.parse(matchedPath)
      const destDir =
        flatten || (!flatten && !dir)
          ? dest
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            dir.replace(dir.split('/')[0]!, dest)

      copyTargets.push({
        src: matchedPath,
        dest: path.join(destDir, rename ?? base)
      })
    }
  }
  return copyTargets
}

export const copyAll = async (
  rootSrc: string,
  rootDest: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets = await collectCopyTargets(rootSrc, targets, flatten)
  await Promise.all(
    copyTargets.map(({ src, dest }) =>
      // use `path.resolve` because rootDest maybe absolute path
      fs.copy(path.resolve(rootSrc, src), path.resolve(rootSrc, rootDest, dest))
    )
  )
  return copyTargets.length
}

export const updateFileMapFromTargets = (
  targets: SimpleTarget[],
  fileMap: Map<string, string>
) => {
  fileMap.clear()
  for (const target of [...targets].reverse()) {
    let dest = target.dest.replace(/\\/g, '/')
    if (!dest.startsWith('/')) {
      dest = `/${dest}`
    }
    fileMap.set(dest, target.src)
  }
}

export const formatConsole = (msg: string) =>
  `${pc.cyan('[vite-plugin-static-copy]')} ${msg}`

export const outputCollectedLog = (
  logger: Logger,
  collectedMap: Map<string, string>
) => {
  if (collectedMap.size > 0) {
    logger.info(
      formatConsole(pc.green(`Collected ${collectedMap.size} items.`))
    )
    if (process.env.DEBUG === 'vite:plugin-static-copy') {
      for (const [key, val] of collectedMap) {
        logger.info(formatConsole(`  - '${key}' -> '${val}'`))
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
