'use strict';

/**
 * Module dependencies.
 */

/**
 * Extend user's controller
 */
module.exports = Object.assign(
	require('./users/users.authentication'),
	require('./users/users.authorization'),
	require('./users/users.password'),
	require('./users/users.profile')
);