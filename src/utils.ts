import fastglob from 'fast-glob'
import path from 'path'
import fs from 'fs-extra'
import pc from 'picocolors'
import { Target } from './options'

type SimpleTarget = { src: string; dest: string }

export const collectCopyTargets = async (
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets: Array<SimpleTarget> = []

  for (const { src, dest, rename } of targets) {
    const matchedPaths = await fastglob(src, {
      onlyFiles: false,
      dot: true
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
  rootDest: string,
  targets: Target[],
  flatten: boolean
) => {
  const copyTargets = await collectCopyTargets(targets, flatten)
  await Promise.all(
    copyTargets.map(({ src, dest }) => fs.copy(src, path.join(rootDest, dest)))
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

export const outputCollectedLog = (collectCount: number) => {
  if (collectCount > 0) {
    console.log(
      pc.green(`[vite-plugin-static-copy] Collected ${collectCount} items.`)
    )
  } else {
    console.log(pc.yellow('[vite-plugin-static-copy] No items found.'))
  }
}

export const outputCopyLog = (copyCount: number | undefined) => {
  if (copyCount === undefined) {
    console.log(pc.yellow('[vite-plugin-static-copy] Copy count was not set.'))
  } else if (copyCount > 0) {
    console.log(
      pc.green(`[vite-plugin-static-copy] Copied ${copyCount} items.`)
    )
  } else {
    console.log(pc.yellow('[vite-plugin-static-copy] No items to copy.'))
  }
}
