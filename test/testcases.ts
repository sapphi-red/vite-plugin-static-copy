export const testcases = [
  {
    name: 'file copy',
    src: './foo.txt',
    dest: '/fixture1/foo.txt'
  },

  {
    name: 'dir copy (1)',
    src: './dir/bar.txt',
    dest: '/fixture3/dir/bar.txt'
  },
  {
    name: 'dir copy (2)',
    src: './dir/deep/bar.txt',
    dest: '/fixture3/dir/deep/bar.txt'
  },
  {
    name: 'glob copy (1)',
    src: './foo.txt',
    dest: '/fixture2/foo.txt'
  },
  {
    name: 'glob copy (2)',
    src: './foo.js',
    dest: '/fixture2/foo.js'
  },
  {
    name: 'transform file',
    src: './foo.txt',
    dest: '/fixture4/foo.txt',
    transform: (contents: string) => contents + 'transform file'
  },
  {
    name: 'transform dir',
    src: './dir/deep/bar.txt',
    dest: '/fixture5/dir/deep/bar.txt',
    transform: (contents: string) => contents + 'transform dir'
  }

  // {
  //   name: 'file copy transform',
  //   src: './foo.js',
  //   dest: '/fixture4/foo.js',
  //   transform: (contents: string, filename: string) =>
  //     'transform' + contents.toString()
  // }
]
