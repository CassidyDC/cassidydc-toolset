/**
 * Stylelint configuration.
 *
 * @file Manages the configuration settings for Stylelint. Based on the `@wordpress/stylelint-config` package.
 * @author Jacob Cassidy <jacob@cassidydc.com>
 * @see https://stylelint.io/user-guide/configure/
 * @type {import('stylelint').Config}
 * @version 1.0.0
 */

'use strict';

export default {
	extends: [
		'@cassidydc/stylelint-config-w3c-order',
		'@stylistic/stylelint-config',
		'stylelint-config-standard',
		'stylelint-config-standard-scss',
	],
	plugins: [
		'stylelint-declaration-block-no-ignored-properties',
		'stylelint-high-performance-animation',
		'stylelint-no-indistinguishable-colors',
		'stylelint-plugin-logical-css',
		'stylelint-use-nesting',
	],
	ignoreFiles: [ '**/*.min.css', '**/build/**', '**/vendor/**' ],
	rules: {
		'@stylistic/at-rule-name-space-after': 'always',
		'@stylistic/block-closing-brace-newline-before': 'always',
		'@stylistic/block-opening-brace-newline-after': 'always',
		'@stylistic/block-opening-brace-space-before': 'always',
		'@stylistic/declaration-block-semicolon-newline-after': 'always',
		'@stylistic/indentation': [
			'tab',
			{
				ignore: [
					'inside-parens',
				],
			},
		],
		'alpha-value-notation': 'number',
		'color-named': 'never',
		'csstools/use-nesting': 'always',
		'custom-property-pattern': [
			'^([a-z][a-z0-9]*)(--?[a-z0-9]+)*$',
			{
				message: 'Expected custom property name to be kebab-case (double dashes are allowed)',
			},
		],
		'declaration-property-value-keyword-no-deprecated': true,
		'font-family-no-missing-generic-family-keyword': [
			true,
			{
				ignoreFontFamilies: [
					'dashicons',
					'FontAwesome',
				],
			},
		],
		'font-weight-notation': 'numeric',
		'function-linear-gradient-no-nonstandard-direction': true,
		// Uncomment the following line to turn OFF `no-descending-specificity` (when using CSS nesting, since it doesn't play well with nesting)...
		// 'no-descending-specificity': null,
		// Uncomment the following lines to turn ON `no-descending-specificity` (when NOT using CSS nesting)...
		'no-descending-specificity': [
			true,
			{
				ignore: [
					'selectors-within-list',
				],
			},
		],
		'number-max-precision': 5,
		'plugin/declaration-block-no-ignored-properties': true,
		'plugin/no-low-performance-animation-properties': [
			true,
			{
				ignoreProperties: [
					'background-color',
					'border-color',
					'color',
				],
			},
		],
		'plugin/stylelint-no-indistinguishable-colors': [
			true,
			{
				threshold: 10,
			},
		],
		'plugin/use-logical-properties-and-values': [
			true,
			{
				severity: 'warning',
			},
		],
		'plugin/use-logical-units': [
			true,
			{
				severity: 'warning',
			},
		],
		'scss/selector-no-redundant-nesting-selector': true,
		'selector-class-pattern': [
			'^[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}$',
			{
				message: 'Expected BEM naming convention for class selector.',
			},
		],

		// TURN OFF RULES
		'@stylistic/declaration-colon-newline-after': null,
		'@stylistic/max-line-length': null,
		'scss/operator-no-newline-after': null,
	},
	reportDescriptionlessDisables: true,
	reportInvalidScopeDisables: true,
	reportNeedlessDisables: true,
};
