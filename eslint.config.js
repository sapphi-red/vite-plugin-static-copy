// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import vitest from 'eslint-plugin-vitest'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    languageOptions: {
      sourceType: 'module'
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type']
    }
  },
  {
    files: ['test/**'],
    ...vitest.configs.recommended,
  },
  eslintConfigPrettier,
  {
    ignores: ['dist/**', 'test/fixtures/**']
  }
)
