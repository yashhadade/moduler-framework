import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, boundaries },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'feature-service',
          pattern: 'src/app/feature-modules/*/*.services.ts',
          capture: ['module'],
        },
        {
          type: 'feature-other',
          pattern: 'src/app/feature-modules/*/*.{js,mjs,cjs,ts,mts,cts}',
          capture: ['module'],
        },
      ],
    },
  },
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // .services.ts files can import:
            // 1) anything inside their own module
            // 2) only .services.ts from other modules
            {
              from: 'feature-service',
              allow: [
                'feature-service',
                ['feature-service', { module: '${from.module}' }],
                ['feature-other', { module: '${from.module}' }],
              ],
            },

            // Non-service files can import only within their own module
            {
              from: 'feature-other',
              allow: [
                ['feature-service', { module: '${from.module}' }],
                ['feature-other', { module: '${from.module}' }],
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/feature-modules/*/*.services.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ImportDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\/(?!.*\\.services\\.(?:ts|js)$).+/]',
          message:
            'Cross-module imports from .services.ts files are allowed only to *.services.ts files.',
        },
        {
          selector:
            'ExportNamedDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\/(?!.*\\.services\\.(?:ts|js)$).+/]',
          message:
            'Cross-module re-exports from .services.ts files are allowed only to *.services.ts files.',
        },
        {
          selector:
            'ExportAllDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\/(?!.*\\.services\\.(?:ts|js)$).+/]',
          message:
            'Cross-module re-exports from .services.ts files are allowed only to *.services.ts files.',
        },
      ],
    },
  },
  {
    files: ['src/app/feature-modules/*/*.{ts,js,mts,cts,mjs,cjs}'],
    ignores: ['src/app/feature-modules/*/*.services.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\//]',
          message:
            'Cross-module communication is allowed only in *.services.ts files (service-to-service only).',
        },
        {
          selector: 'ExportNamedDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\//]',
          message:
            'Cross-module communication is allowed only in *.services.ts files (service-to-service only).',
        },
        {
          selector: 'ExportAllDeclaration[source.value=/^\\.\\.\\/(?!\\.)[^/]+\\//]',
          message:
            'Cross-module communication is allowed only in *.services.ts files (service-to-service only).',
        },
      ],
    },
  },
]);
