/**
 * ESLint configuration.
 *
 * @file Manages the flat configuration settings for ESLint
 * @author Jacob Cassidy <jacob@cassidydc.com>
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @type {import("eslint").Linter.Config[]}
 * @version 1.0.0
 */

'use strict';

import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import wordpress from '@cassidydc/eslint-plugin-wordpress';
import { defineConfig, globalIgnores } from 'eslint/config';
import { fileURLToPath } from 'node:url';
import { importX } from 'eslint-plugin-import-x';
import { includeIgnoreFile } from '@eslint/compat';

const gitignorePath = fileURLToPath( new URL( '.gitignore', import.meta.url ) );

export default defineConfig( [
	globalIgnores( [ '**/*.min.js' ] ),
	includeIgnoreFile( gitignorePath, 'Imported .gitignore patterns' ),
	{
		plugins: {
			'import-x': importX,
			js,
			tseslint,
			wordpress,
		},
		extends: [
			'import-x/recommended',
			'js/recommended',
			'tseslint/recommended',
			'wordpress/recommended',
		],
		files: [ '**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}' ],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
		linterOptions: {
			reportUnusedInlineConfigs: 'warn',
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'no-console': 'warn',
			'no-unused-vars': 'warn',
			'prettier/prettier': [ 'warn', { printWidth: 120 } ],
			yoda: [ 'warn', 'never' ],
		},
		settings: {
			jsdoc: {
				tagNamePreference: {
					return: 'return',
					returns: 'returns',
					yield: 'yield',
					yields: 'yields',
				},
			},
		},
	},
] );
