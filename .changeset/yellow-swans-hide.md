---
'vite-plugin-static-copy': major
---

migrate `fast-glob` to `tinyglobby` to reduce the package size and to align with Vite. This breaking change should not affect most users. Check [Vite's migration guide](<https://v6.vite.dev/guide/migration.html#migration-from-v4:~:text=Range%20braces%20(%7B01..03%7D%20%E2%87%92%20%5B%2701%27%2C%20%2702%27%2C%20%2703%27%5D)%20and%20incremental%20braces%20(%7B2..8..2%7D%20%E2%87%92%20%5B%272%27%2C%20%274%27%2C%20%276%27%2C%20%278%27%5D)%20are%20no%20longer%20supported%20in%20globs.>) for more details.
