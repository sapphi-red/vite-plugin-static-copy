# vite-plugin-static-copy

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
