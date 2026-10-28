import { defineConfig, type ViteUserConfig } from 'vitest/config'

const config: ViteUserConfig = defineConfig({
  test: {
    onConsoleLog(log) {
      if (log.includes('Generated an empty chunk')) {
        return false
      }
      return undefined
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,js}'],
          benchmark: {
            include: ['src/**/*.bench.{ts,js}'],
          },
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/**/*.test.{ts,js}'],
          benchmark: { include: [] },
        },
      },
    ],
  },
})

export default config
