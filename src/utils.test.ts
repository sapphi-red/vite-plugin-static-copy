import { describe, expect, test } from 'vitest'
import {
  isSubdirectoryOrEqual,
  groupTargetsByDirectoryTree,
  collectCopyTargets,
} from './utils'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const _dirname = path.dirname(fileURLToPath(import.meta.url))
const isWindows = os.platform() === 'win32'

describe('isSubdirectoryOrEqual', () => {
  const cases: readonly [a: string, b: string, expected: boolean][] = [
    ['./', '.', true],
    ['./', './', true],
    ['.', './', true],
    ['./index.ts', './', true],
    ['./foo/', './', true],
    ['./foo/bar', './', true],
    ['./foo/bar.js', './', true],
    ['..', './', false],
    ['../', './', false],
    ['../test', './', false],
    ['../test/', './', false],
    // case-insensitive
    ['./foo/bar', './FOO/BAR', true],
    ['./FOO/BAR', './foo/bar', true],
    ['./foo/bar', './foo/BAR', true],
    ['./foo/bar', './foo/baz', false],
    ...(isWindows
      ? ([
          ['C:/', 'C:/', true],
          ['C:\\', 'C:/', true],
          ['C:/', 'D:/', false],
          ['C:\\', 'D:/', false],
        ] satisfies readonly [string, string, boolean][])
      : []),
  ]

  const resolve = (p: string) => path.resolve(_dirname, p)

  for (const [a, b, expected] of cases) {
    test(`isSubdirectoryOrEqual(${a}, ${b})`, () => {
      expect(isSubdirectoryOrEqual(resolve(a), resolve(b))).toBe(expected)
    })
  }
})

describe('groupTargetsByDirectoryTree', () => {
  const defineCase = (input: string[], expected: string[][]) => ({
    name: input.join(', '),
    input: input.map((s) => ({ resolvedDest: path.resolve(s) })),
    expected: expected.map((s) =>
      s.map((s) => expect.objectContaining({ resolvedDest: path.resolve(s) })),
    ),
  })

  const cases = [
    defineCase(['a/b/c'], [['a/b/c']]),
    defineCase(['a/b/c', 'b/c'], [['a/b/c'], ['b/c']]),
    defineCase(['a', 'a/b/c'], [['a', 'a/b/c']]),
    defineCase(['a/b', 'a/b/c'], [['a/b', 'a/b/c']]),
    defineCase(['a/b/c', 'a/b'], [['a/b/c', 'a/b']]),
    defineCase(['a', 'a/b/d'], [['a', 'a/b/d']]),
    defineCase(['foo/bar', 'FOO/BAR'], [['foo/bar', 'FOO/BAR']]),
  ] satisfies {
    name: string
    input: { resolvedDest: string }[]
    expected: { resolvedDest: string }[][]
  }[]

  for (const { name, input, expected } of cases) {
    test(`groupTargetsByDirectoryTree(${name})`, () => {
      expect(groupTargetsByDirectoryTree(input)).toStrictEqual(expected)
    })
  }
})

describe('collectCopyTargets', () => {
  // eslint-disable-next-line no-empty-pattern
  const collectTest = test.extend('tmpDir', async ({}, { onCleanup }) => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'vite-static-copy-test-'),
    )
    fs.writeFileSync(path.join(tmpDir, 'foo.js'), '')
    fs.writeFileSync(path.join(tmpDir, 'foo.txt'), '')
    fs.mkdirSync(path.join(tmpDir, 'dir/deep'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'dir/bar.txt'), '')
    fs.writeFileSync(path.join(tmpDir, 'dir/deep/bar.txt'), '')
    onCleanup(() => {
      fs.rmSync(tmpDir, { recursive: true })
    })
    return tmpDir
  })

  collectTest(
    'negated glob patterns exclude matched files',
    async ({ tmpDir }) => {
      const targets = await collectCopyTargets(
        tmpDir,
        [
          {
            src: ['foo.*', '!**/foo.js'],
            dest: 'out',
          },
        ],
        false,
      )
      const srcs = targets.map((t) =>
        path.relative(process.cwd(), t.src).replaceAll('\\', '/'),
      )
      expect(srcs).toMatchInlineSnapshot(`
        [
          "foo.txt",
        ]
      `)
    },
  )

  collectTest(
    'negated glob patterns with directory expansion',
    async ({ tmpDir }) => {
      const targets = await collectCopyTargets(
        tmpDir,
        [
          {
            src: ['dir', '!**/deep/**'],
            dest: 'out',
          },
        ],
        false,
      )
      const srcs = targets.map((t) =>
        path.relative(process.cwd(), t.src).replaceAll('\\', '/'),
      )
      expect(srcs).toMatchInlineSnapshot(`
        [
          "dir/bar.txt",
        ]
      `)
    },
  )
})
