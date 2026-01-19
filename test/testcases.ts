type Testcase = {
  name: string
  src: string | null
  dest: string
  transformedContent?: string
  encoding?: BufferEncoding | 'buffer'
  contentType?: string
}

export const testcases: Record<string, Testcase[]> = {
  'vite.config.ts': [
    {
      name: 'file copy',
      src: './foo.txt',
      dest: '/fixture1/foo.txt',
    },
    {
      name: 'noext file copy',
      src: './noext',
      dest: '/fixture1/noext',
    },

    {
      name: 'dir copy (1)',
      src: './dir/bar.txt',
      dest: '/fixture3/dir/bar.txt',
    },
    {
      name: 'dir copy (2)',
      src: './dir/deep/bar.txt',
      dest: '/fixture3/dir/deep/bar.txt',
    },

    {
      name: 'glob copy (1)',
      src: './foo.txt',
      dest: '/fixture2/foo.txt',
    },
    {
      name: 'glob copy (2)',
      src: './foo.js',
      dest: '/fixture2/foo.js',
    },

    {
      name: 'transform file',
      src: './foo.txt',
      dest: '/fixture4/foo.txt',
      transformedContent: 'foo\ntransform file',
    },
    {
      name: 'async transform file',
      src: './foo.txt',
      dest: '/fixture4/foo.js',
      transformedContent: "console.log('foo')\ntransform file",
    },
    {
      name: 'transform glob.*',
      src: './foo.js',
      dest: '/fixture5/foo.js',
      transformedContent: "console.log('foo')\ntransform glob",
    },
    {
      name: 'override with later entry',
      src: './dir/deep/bar.txt',
      dest: '/fixture6/bar.txt',
    },
    {
      name: 'merge with later entry (1)',
      src: './dir/bar.txt',
      dest: '/fixture7/dir/bar.txt',
    },
    {
      name: 'merge with later entry (2)',
      src: './dir2/dir/foo.txt',
      dest: '/fixture7/dir/foo.txt',
    },
    {
      name: 'drop file',
      src: null,
      dest: '/fixture8/foo.txt',
    },
    {
      name: 'binary file read as buffer',
      src: './global.wasm',
      dest: '/fixture9/global.wasm',
      encoding: 'buffer',
    },

    {
      name: 'rename string',
      src: './foo.txt',
      dest: '/fixture10/foo2.txt',
    },
    {
      name: 'rename function',
      src: './foo.txt',
      dest: '/fixture10/v1/foo.txt',
    },
    {
      name: 'async rename function',
      src: './foo.txt',
      dest: '/fixture10/v2/foo.txt',
    },
    {
      name: 'overwrite=true',
      src: './foo.txt',
      dest: '/fixture11/overwriteDir/foo.txt',
    },
    {
      name: 'overwrite=false',
      src: './public/fixture11/notOverwriteDir/foo.txt',
      dest: '/fixture11/notOverwriteDir/foo.txt',
    },
    {
      name: 'overwrite=false with transform',
      src: './public/fixture11/notOverwriteDir/bar.txt',
      dest: '/fixture11/notOverwriteDir/bar.txt',
    },
    {
      name: 'modified extension, known content-type',
      src: 'foo.js',
      dest: '/fixture12/foo.txt',
      contentType: 'text/plain',
    },
    {
      name: 'modified extension, transformed, known content-type',
      src: null,
      dest: '/fixture12/foo.json',
      transformedContent: '{"value":"foo"}',
      contentType: 'application/json',
    },
    {
      name: 'modified extension, unknown content-type',
      src: 'foo.txt',
      dest: '/fixture12/foo.foo',
      contentType: '',
    },
    {
      name: 'absolute path dest',
      src: './foo.txt',
      dest: '/fixture13/foo.txt',
    },
    {
      name: 'parallel copy to same dir (1)',
      src: './eexist/a/1.txt',
      dest: '/eexist/a/1.txt',
    },
    {
      name: 'parallel copy to same dir (2)',
      src: './eexist/b/1.txt',
      dest: '/eexist/b/1.txt',
    },
    {
      name: 'multiple plugin instance',
      src: './foo.txt',
      dest: '/fixture1-1/foo.txt',
    },
  ],
  'vite.absolute.config.ts': [
    {
      name: 'copy',
      src: './foo.txt',
      dest: '/fixture1/foo.txt',
    },
  ],
  'vite.base.config.ts': [
    {
      name: 'copy',
      src: './foo.txt',
      dest: '/base/fixture1/foo.txt',
    },
  ],
  'vite.structured.config.ts': [
    {
      name: 'glob without dir',
      src: './foo.txt',
      dest: '/fixture1/foo.txt',
    },
    {
      name: 'glob with dir',
      src: './dir/bar.txt',
      dest: '/fixture2/dir/bar.txt',
    },
    {
      name: 'glob with parent dir',
      src: '../fixtures2/baz.txt',
      dest: '/fixture3/fixtures2/baz.txt',
    },
    {
      name: 'empty dest',
      src: './foo.js',
      dest: '/foo.js',
    },
    {
      name: 'dot dest',
      src: './noext',
      dest: '/noext',
    },
    {
      name: 'dir to empty dest',
      src: './dir/bar.txt',
      dest: '/dir/bar.txt',
    },
    {
      name: 'absolute path',
      src: './dir/bar.txt',
      dest: '/fixture4/dir/bar.txt',
    },
  ],
  'vite.envs.config.ts': [
    {
      name: 'multi-environment build copy',
      src: './foo.txt',
      dest: '/fixture/foo.txt',
    },
  ],
}
