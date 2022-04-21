type Testcase = {
  name: string
  src: string
  dest: string
  transformedContent?: string
}

export const testcases: Record<string, Testcase[]> = {
  'vite.config.ts': [
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
      transformedContent: 'foo\ntransform file'
    },
    {
      name: 'transform glob.*',
      src: './foo.js',
      dest: '/fixture5/foo.js',
      transformedContent: "console.log('foo')\ntransform glob"
    }
  ],
  'vite.absolute.config.ts': [
    {
      name: 'copy',
      src: './foo.txt',
      dest: '/fixture1/foo.txt'
    }
  ]
}
