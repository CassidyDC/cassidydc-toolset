// WordPress webpack config.
import defaultConfig from '@wordpress/scripts/config/webpack.config.js';

// Plugins.
import CopyWebpackPlugin from 'copy-webpack-plugin';

// Utilities.
import path from 'path';
import fastGlob from 'fast-glob';
const globSync = fastGlob.sync;

// Directories.
const sourceDir = './src/';

// Entry points.
const entriesObj = createEntriesObj();

// Minified files to copy.
const minFiles = globSync( `${ sourceDir }/**/*.min.js` );

// Creates entries object automatically from the source files.
function createEntriesObj() {
	const entries = {};
	const sourceFilePaths = globSync( `${ sourceDir }**/*.{js,css,sass,scss}`, {
		ignore: [
			'**/modules/*.js',
			'**/*.min.js',
			'**/_*.{sass,scss}',
		],
	} );

	sourceFilePaths.forEach( ( filePath ) => {
		const outputPath = path
			.relative( sourceDir, filePath ) // Gets the relative path without the sourceDir.
			.split( '.' )[ 0 ] // Removes the file extension.
			.replace( /(sass|scss)/, 'css' ); // Replaces sass/scss directories with css directories.
		const entryPath = path.resolve( process.cwd(), filePath );

		entries[ outputPath ] = entryPath;
	} );

	return entries;
}

export default {
	...defaultConfig,
	...{
		entry: entriesObj,
		plugins: [
			// Include WP's plugin config.
			...defaultConfig.plugins,

			// Copies already minified JS files to the build directory without reprocessing them.
			...( minFiles.length > 0
				? [
						new CopyWebpackPlugin( {
							patterns: globSync( `${ sourceDir }/**/*.min.js` ).map( ( filePath ) => ( {
								from: filePath,
								to: path.join( path.relative( sourceDir, filePath ) ),
								info: { minimized: true }, // Copies without running through Terser minimization
							} ) ),
						} ),
				  ]
				: [] ),
		],
	},
};
