import { describe, expect, test } from 'vitest'
import { isSubdirectoryOrEqual, groupTargetsByDirectoryTree } from './utils'
import path from 'node:path'
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
