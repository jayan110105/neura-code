import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import nextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      '.next/',
      'node_modules/',
      'drizzle/',
      'supabase/migrations/',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...compat.extends('next/core-web-vitals'),
]

export default eslintConfig
