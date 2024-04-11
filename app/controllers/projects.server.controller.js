'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash');

module.exports = _.extend(
	require('./projects/projects.files'),
	require('./projects/projects.crud'),
	require('./projects/projects.talent'),
	require('./projects/projects.email'),
	require('./projects/projects.lists'),
	require('./projects/projects.downloads'),
	require('./projects/projects.uploads'),
	require('./projects/projects.etc')
);
