# vite-plugin-static-copy

## 3.1.1

### Patch Changes

- [#186](https://github.com/sapphi-red/vite-plugin-static-copy/pull/186) [`fc84156`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/fc84156418cd06f599a196c1d681f243c65c4f95) Thanks [@sapphi-red](https://github.com/sapphi-red)! - fix a bug that the content was not sent when multiple vite-plugin-static-copy instance was used

## 3.1.0

### Minor Changes

- [#171](https://github.com/sapphi-red/vite-plugin-static-copy/pull/171) [`9c7cf2e`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/9c7cf2e9831e52c00d9789ee11c8f0db0ea1c330) Thanks [@MrRefactoring](https://github.com/MrRefactoring)! - add Vite 7 to peer dep range

## 3.0.2

### Patch Changes

- [#167](https://github.com/sapphi-red/vite-plugin-static-copy/pull/167) [`89458b2`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/89458b2134a5aae93ce0322f3b2c0b7af4bc1be9) Thanks [@sapphi-red](https://github.com/sapphi-red)! - improved file grouping algorithm for better performance

## 3.0.1

### Patch Changes

- [#166](https://github.com/sapphi-red/vite-plugin-static-copy/pull/166) [`60409c5`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/60409c55237399f5d37a417eaa124e8dfc1dfec7) Thanks [@sapphi-red](https://github.com/sapphi-red)! - fix absolute destination paths in copy targets incorrectly returning contents in dev

- [#164](https://github.com/sapphi-red/vite-plugin-static-copy/pull/164) [`337f976`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/337f976af1eb089cb0296c661dccceb717b3383f) Thanks [@sapphi-red](https://github.com/sapphi-red)! - fixes case-insensitive path conflicts causing copy failures (EEXIST error)

## 3.0.0

### Major Changes

- [#150](https://github.com/sapphi-red/vite-plugin-static-copy/pull/150) [`71f4f5b`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/71f4f5b5318e1a1c937e141c848f2ef1b0e79e5b) Thanks [@sapphi-red](https://github.com/sapphi-red)! - migrate `fast-glob` to `tinyglobby` to reduce the package size and to align with Vite. This breaking change should not affect most users. Check [Vite's migration guide](<https://v6.vite.dev/guide/migration.html#migration-from-v4:~:text=Range%20braces%20(%7B01..03%7D%20%E2%87%92%20%5B%2701%27%2C%20%2702%27%2C%20%2703%27%5D)%20and%20incremental%20braces%20(%7B2..8..2%7D%20%E2%87%92%20%5B%272%27%2C%20%274%27%2C%20%276%27%2C%20%278%27%5D)%20are%20no%20longer%20supported%20in%20globs.>) for more details.

## 2.3.1

### Patch Changes

- [#152](https://github.com/sapphi-red/vite-plugin-static-copy/pull/152) [`6aee6a3`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/6aee6a3d8caf6d08bedeb4c97fb7580fd904b895) Thanks [@sapphi-red](https://github.com/sapphi-red)! - improve performance of internal `isSubdirectoryOrEqual` function

## 2.3.0

### Minor Changes

- [`281f5b2`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/281f5b22aaa23a055af93553da8c84932ef31c41) Thanks [@sapphi-red](https://github.com/sapphi-red)! - improve performance by coping files concurrently when possible

### Patch Changes

- [#149](https://github.com/sapphi-red/vite-plugin-static-copy/pull/149) [`a9f35c9`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/a9f35c9557b0ab710006c83418c3c982c2eb746e) Thanks [@sapphi-red](https://github.com/sapphi-red)! - ensure `.[cm]?[tj]sx?` static assets are JS mime to align with Vite. https://github.com/vitejs/vite/pull/19453

## 2.2.0

### Minor Changes

- [#141](https://github.com/sapphi-red/vite-plugin-static-copy/pull/141) [`88e513d`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/88e513d37e7be5bc35c4f75737f1eabb230510a8) Thanks [@sapphi-red](https://github.com/sapphi-red)! - add Vite 6 to peer dep

## 2.1.0

### Minor Changes

- [#133](https://github.com/sapphi-red/vite-plugin-static-copy/pull/133) [`b9c09bd`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/b9c09bd80d6706113bd4715c3cd68e6819e19f58) Thanks [@rschristian](https://github.com/rschristian)! - Allows user to optionally configure when the plugin is ran by passing in a Rollup hook name

## 2.0.0

### Major Changes

- [#127](https://github.com/sapphi-red/vite-plugin-static-copy/pull/127) [`21304df`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/21304df03f6ad668d316653ee9d48c4fbc633bde) Thanks [@tassioFront](https://github.com/tassioFront)! - feat: throw an error when does not find file

## 1.0.6

### Patch Changes

- [#121](https://github.com/sapphi-red/vite-plugin-static-copy/pull/121) [`d68aec9`](https://github.com/sapphi-red/vite-plugin-static-copy/commit/d68aec950e58b16bac0f5621bf5d9636340109c8) Thanks [@tobz1000](https://github.com/tobz1000)! - The value of `Content-Type` header was inferred and set from the src file extension. It is now infered from the dest file extension.

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
