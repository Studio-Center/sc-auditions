'use strict';

/**
 * Module dependencies.
 */
const glob = require('glob'),
	radash = require('radash');
	// set application widen timezone
	process.env.TZ = 'America/New_York';

/**
 * Load app configurations
 */
// check for hidden config files
module.exports = Object.assign(
	require('./env/all'),
	require('./env/' + process.env.NODE_ENV) || {}
);
/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
	if (radash.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = [...new Set([...output, ..._this.getGlobbedFiles(globPattern, removeRoot)])];
		});
	} else if (radash.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			var files = glob.globSync(globPatterns);

			if (removeRoot) {
				files = files.map(function(file) {
					return file.replace(removeRoot, '');
				});
			}

			output = [...new Set([...output, ...files])];
		}
	}

	return output;
};

/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function(includeTests) {
	var output = this.getGlobbedFiles(this.assets.lib.js.concat(this.assets.js), 'public/');

	// To include tests
	if (includeTests) {
		output = [...new Set([...output, ...this.getGlobbedFiles(this.assets.tests)])];
	}

	return output;
};

/**
 * Get the modules CSS files
 */
module.exports.getCSSAssets = function() {
	var output = this.getGlobbedFiles(this.assets.lib.css.concat(this.assets.css), 'public/');
	return output;
};
