type Testcase = {
  name: string
  src: string | null
  dest: string
  transformedContent?: string
  encoding?: BufferEncoding | 'buffer'
}

export const testcases: Record<string, Testcase[]> = {
  'vite.config.ts': [
    {
      name: 'file copy',
      src: './foo.txt',
      dest: '/fixture1/foo.txt'
    },
    {
      name: 'noext file copy',
      src: './noext',
      dest: '/fixture1/noext'
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
      name: 'async transform file',
      src: './foo.txt',
      dest: '/fixture4/foo.js',
      transformedContent: "console.log('foo')\ntransform file"
    },
    {
      name: 'transform glob.*',
      src: './foo.js',
      dest: '/fixture5/foo.js',
      transformedContent: "console.log('foo')\ntransform glob"
    },
    {
      name: 'override with later entry',
      src: './dir/deep/bar.txt',
      dest: '/fixture6/bar.txt'
    },
    {
      name: 'merge with later entry (1)',
      src: './dir/bar.txt',
      dest: '/fixture7/dir/bar.txt'
    },
    {
      name: 'merge with later entry (2)',
      src: './dir2/dir/foo.txt',
      dest: '/fixture7/dir/foo.txt'
    },
    {
      name: 'drop file',
      src: null,
      dest: '/fixture8/foo.txt'
    },
    {
      name: 'binary file read as buffer',
      src: './global.wasm',
      dest: '/fixture9/global.wasm',
      encoding: 'buffer'
    },

    {
      name: 'rename string',
      src: './foo.txt',
      dest: '/fixture10/foo2.txt'
    },
    {
      name: 'rename function',
      src: './foo.txt',
      dest: '/fixture10/v1/foo.txt'
    },
    {
      name: 'overwrite=true',
      src: './foo.txt',
      dest: '/fixture11/overwriteDir/foo.txt'
    },
    {
      name: 'overwrite=false',
      src: './public/fixture11/notOverwriteDir/foo.txt',
      dest: '/fixture11/notOverwriteDir/foo.txt'
    },
    {
      name: 'overwrite=false with transform',
      src: './public/fixture11/notOverwriteDir/bar.txt',
      dest: '/fixture11/notOverwriteDir/bar.txt'
    }
  ],
  'vite.absolute.config.ts': [
    {
      name: 'copy',
      src: './foo.txt',
      dest: '/fixture1/foo.txt'
    }
  ],
  'vite.base.config.ts': [
    {
      name: 'copy',
      src: './foo.txt',
      dest: '/base/fixture1/foo.txt'
    }
  ]
}
