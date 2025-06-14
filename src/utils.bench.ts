import { bench, describe } from 'vitest'
import { groupTargetsByDirectoryTree } from './utils'

type TestTarget = {
  resolvedDest: string
  id: string
}

function generateTestTargets(count: number): TestTarget[] {
  const targets: TestTarget[] = []
  const basePaths = [
    '/home/user/project/dist',
    '/home/user/project/dist/assets',
    '/home/user/project/dist/assets/images',
    '/home/user/project/dist/assets/css',
    '/home/user/project/dist/components',
    '/home/user/project/dist/components/ui',
    '/home/user/project/dist/pages',
    '/home/user/project/public',
    '/home/user/project/public/static',
    '/tmp/build',
  ]

  for (let i = 0; i < count; i++) {
    const basePath = basePaths[i % basePaths.length]
    const suffix = Math.floor(i / basePaths.length)
    targets.push({
      resolvedDest:
        suffix > 0 ? `${basePath}/file${suffix}` : `${basePath}/file`,
      id: `target-${i}`,
    })
  }

  return targets
}

describe('groupTargetsByDirectoryTree benchmark', () => {
  bench('small dataset (10 targets)', () => {
    const targets = generateTestTargets(10)
    groupTargetsByDirectoryTree(targets)
  })

  bench('medium dataset (100 targets)', () => {
    const targets = generateTestTargets(100)
    groupTargetsByDirectoryTree(targets)
  })

  bench('large dataset (1000 targets)', () => {
    const targets = generateTestTargets(1000)
    groupTargetsByDirectoryTree(targets)
  })

  bench('nested directory structure (deep)', () => {
    const targets: TestTarget[] = []
    const baseDepth = 10

    for (let depth = 0; depth < baseDepth; depth++) {
      const pathParts = ['/home', 'user', 'project']
      for (let i = 0; i <= depth; i++) {
        pathParts.push(`level${i}`)
      }
      targets.push({
        resolvedDest: pathParts.join('/'),
        id: `nested-${depth}`,
      })
    }

    groupTargetsByDirectoryTree(targets)
  })

  bench('mixed path scenarios', () => {
    const targets: TestTarget[] = [
      { resolvedDest: '/home/user/project/dist/index.html', id: 'html1' },
      { resolvedDest: '/home/user/project/dist/main.js', id: 'js1' },
      { resolvedDest: '/home/user/project/dist/style.css', id: 'css1' },

      { resolvedDest: '/home/user/project/dist', id: 'parent' },
      { resolvedDest: '/home/user/project/dist/assets', id: 'child1' },
      {
        resolvedDest: '/home/user/project/dist/assets/images',
        id: 'grandchild1',
      },

      { resolvedDest: '/tmp/build/output.txt', id: 'independent1' },
      { resolvedDest: '/var/backup/files/data.json', id: 'independent2' },

      { resolvedDest: '/home/user/Project/Dist/File.txt', id: 'case1' },
      { resolvedDest: '/home/user/project/dist/file.txt', id: 'case2' },
    ]

    groupTargetsByDirectoryTree(targets)
  })

  bench('duplicate paths', () => {
    const targets: TestTarget[] = []
    for (let i = 0; i < 50; i++) {
      targets.push({
        resolvedDest: '/home/user/project/dist/output',
        id: `duplicate-${i}`,
      })
    }
    groupTargetsByDirectoryTree(targets)
  })
})
