/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import GithubActionsReporter from 'vitest-github-actions-reporter'

export default defineConfig({
  test: {
    reporters: process.env.CI ? new GithubActionsReporter() : 'default',
    onConsoleLog(log) {
      if (log.includes('Generated an empty chunk')) {
        return false
      }
      return undefined
    }
  }
})
