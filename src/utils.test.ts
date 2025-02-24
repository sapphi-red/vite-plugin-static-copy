import { describe, expect, test } from 'vitest'
import { groupTargetsByDirectoryTree } from './utils'
import path from 'node:path'

describe('groupTargetsByDirectoryTree', () => {
  const defineCase = (input: string[], expected: string[][]) => ({
    name: input.join(', '),
    input: input.map(s => ({ resolvedDest: path.resolve(s) })),
    expected: expected.map(s =>
      s.map(s => expect.objectContaining({ resolvedDest: path.resolve(s) }))
    )
  })

  const cases = [
    defineCase(['a/b/c'], [['a/b/c']]),
    defineCase(['a/b/c', 'b/c'], [['a/b/c'], ['b/c']]),
    defineCase(['a', 'a/b/c'], [['a', 'a/b/c']]),
    defineCase(['a/b', 'a/b/c'], [['a/b', 'a/b/c']]),
    defineCase(['a/b/c', 'a/b'], [['a/b/c', 'a/b']]),
    defineCase(['a', 'a/b/d'], [['a', 'a/b/d']])
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
