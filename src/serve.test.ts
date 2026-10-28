import { describe, test, expect } from 'vitest'
import { createWatchMatcher } from './serve'

describe('createWatchMatcher', () => {
  const root = '/proj'

  test('watches the static base of a glob and filters by pattern', () => {
    const { roots, isTargetPath } = createWatchMatcher(root, ['assets/**/*.txt'])
    expect(roots).toStrictEqual(['assets'])
    expect(isTargetPath('assets/a.txt')).toBe(true)
    expect(isTargetPath('assets/nested/deep/a.txt')).toBe(true)
    expect(isTargetPath('assets/a.png')).toBe(false)
    expect(isTargetPath('other/a.txt')).toBe(false)
  })

  test('watches plain files and directories', () => {
    const { roots, isTargetPath } = createWatchMatcher(root, ['foo.txt', 'dir'])
    expect(roots.sort()).toStrictEqual(['dir', 'foo.txt'])
    expect(isTargetPath('foo.txt')).toBe(true)
    expect(isTargetPath('dir/bar.txt')).toBe(true)
    expect(isTargetPath('dir2/bar.txt')).toBe(false)
  })

  test('uses the root for a pattern without a static base', () => {
    const { roots, isTargetPath } = createWatchMatcher(root, ['foo.*'])
    expect(roots).toStrictEqual(['.'])
    expect(isTargetPath('foo.js')).toBe(true)
    expect(isTargetPath('bar.js')).toBe(false)
  })

  test('supports negated patterns', () => {
    const { roots, isTargetPath } = createWatchMatcher(root, ['assets/**', '!assets/ignored/**'])
    expect(roots).toStrictEqual(['assets'])
    expect(isTargetPath('assets/a.txt')).toBe(true)
    expect(isTargetPath('assets/ignored/a.txt')).toBe(false)
  })

  test('supports absolute patterns', () => {
    const { isTargetPath } = createWatchMatcher(root, ['/proj/assets/*.txt'])
    expect(isTargetPath('assets/a.txt')).toBe(true)
    expect(isTargetPath('assets/a.png')).toBe(false)
  })

  test('matches dotfiles', () => {
    const { isTargetPath } = createWatchMatcher(root, ['assets/**'])
    expect(isTargetPath('assets/.hidden')).toBe(true)
  })
})
