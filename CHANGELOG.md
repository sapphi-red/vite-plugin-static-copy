# vite-plugin-static-copy

## 1.0.5

### Patch Changes

- [`311ce4d`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/311ce4d0c253402820d1fccb8d59a9e8a71ce967) Thanks [@sapphi-red](https://github.com/sapphi-red)! - generate provenance statements for the package

## 1.0.4

### Patch Changes

- [#107](https://github.com/sapphi-red/vite-plugin-static-copy/pull/107) [`5206534`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/520653429a0aa2122feee9edbacc2195fd2624e4) Thanks [@sverben](https://github.com/sverben)! - send headers set by `server.headers` in dev

## 1.0.3

### Patch Changes

- [#105](https://github.com/sapphi-red/vite-plugin-static-copy/pull/105) [`32115f0`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/32115f01abc98b9f128c427d1ffb4363860c5a95) Thanks [@daihuabin](https://github.com/daihuabin)! - don't crash when the requested path is mapped to a directory

## 1.0.2

### Patch Changes

- [`db73fb5`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/db73fb50ed471b53cf6fd365443edd163a695e58) Thanks [@sapphi-red](https://github.com/sapphi-red)! - udpate mrmime to v2. align the used mime values with Vite 5.1. See https://github.com/lukeed/mrmime/releases/tag/v2.0.0 for the difference.

## 1.0.1

### Patch Changes

- [#79](https://github.com/sapphi-red/vite-plugin-static-copy/pull/79) [`19b9fca`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/19b9fcade3a3a6b3249f27397a834d5a4c0321cb) Thanks [@sapphi-red](https://github.com/sapphi-red)! - using absolute path src with `structured: true` was not working. The `fullPath` argument in the `rename` option will now always be an absolute path, instead of sometimes being a relative path.

## 1.0.0

### Major Changes

- [`252f62c`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/252f62ce6c3371367b4593b5c940371a88292021) Thanks [@sapphi-red](https://github.com/sapphi-red)! - drop support for Vite 3 and 4

- [`252f62c`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/252f62ce6c3371367b4593b5c940371a88292021) Thanks [@sapphi-red](https://github.com/sapphi-red)! - drop CJS build. See https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only for how to migrate from CJS to ESM.

- [`252f62c`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/252f62ce6c3371367b4593b5c940371a88292021) Thanks [@sapphi-red](https://github.com/sapphi-red)! - drop node 14.18/16/17/19 support

### Patch Changes

- [#67](https://github.com/sapphi-red/vite-plugin-static-copy/pull/67) [`8707d84`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/8707d84d478c3b183cf8639d27158aba9318a0c6) Thanks [@sapphi-red](https://github.com/sapphi-red)! - copy only once even if multiple bundles are generated
