---
'vite-plugin-static-copy': patch
---

Fix absolute `dest` paths being nested under the output directory

When `dest` was an absolute path and the source file had a directory component (structured output), the path was incorrectly converted to a relative path, causing files to be nested under the build output directory instead of being copied to the specified absolute path.

```js
{ src: 'foo/foo.txt', dest: '/home/user/my-repo/bar' }
```

**Before**: `/home/user/my-repo/dist/home/user/my-repo/bar/foo/foo.txt`
**After**: `/home/user/my-repo/bar/foo/foo.txt`
