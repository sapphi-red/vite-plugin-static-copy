# vite-plugin-static-copy

[![npm version](https://badge.fury.io/js/vite-plugin-static-copy.svg)](https://badge.fury.io/js/vite-plugin-static-copy) ![CI](https://github.com/sapphi-red/vite-plugin-static-copy/workflows/CI/badge.svg) ![automatic deploy](https://github.com/sapphi-red/vite-plugin-static-copy/workflows/automatic%20deploy/badge.svg) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)  

`rollup-plugin-copy` for vite with dev server support.

## Install
```shell
npm i -D vite-plugin-static-copy # yarn add -D vite-plugin-static-copy
```

Add plugin in `vite.config.js`.
```js
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
  plugins: [
    viteStaticCopy()
  ]
}
```

### Options
See [options.ts](https://github.com/sapphi-red/vite-plugin-static-copy/blob/main/src/options.ts).
