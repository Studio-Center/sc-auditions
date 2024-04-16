'use strict';

/**
 * Module dependencies.
 */

module.exports = Object.assign(
	require('./projects/projects.files'),
	require('./projects/projects.crud'),
	require('./projects/projects.talent'),
	require('./projects/projects.email'),
	require('./projects/projects.lists'),
	require('./projects/projects.downloads'),
	require('./projects/projects.uploads'),
	require('./projects/projects.etc')
);
