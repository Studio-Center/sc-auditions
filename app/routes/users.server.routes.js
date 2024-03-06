'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users');

	// Setting up the users profile api
	app.route('/users/me').get(users.jwtauth, users.me);

	app.route('/users/:userId')
		.put(users.update);

	app.route('/usersfind/:userLevel')
		.get(users.hasAuthorization, users.getListLevel);

	app.route('/usersedit')
		.get(users.requiresLogin, users.list, users.hasAuthorization)
		.put(users.requiresLogin, users.update, users.hasAuthorization);

	app.route('/usersedit/:userIdEdit')
		.get(users.readAdmin, users.hasAuthorization)
		.put(users.requiresLogin, users.hasAuthorization, users.updateAdmin)
		.delete(users.requiresLogin, users.hasAuthorization, users.delete);

	app.route('/usersedit/create')
		.get(users.requiresLogin, users.hasAuthorization)
		.post(users.requiresLogin, users.hasAuthorization, users.create);

	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// gather filtered list of users
	app.route('/users/findLimitWithFilter')
		.post(users.requiresLogin, users.findLimitWithFilter);

	// get records count
	app.route('/users/recCount')
		.post(users.requiresLogin, users.getUsersCnt);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/appsignin').post(users.appsignin);
	app.route('/auth/token').get(users.token);
	app.route('/auth/signout').get(users.signout);

	// Finish by binding the user middleware
	app.param('userLevel', users.getListLevel);
	app.param('userIdEdit', users.userByIDEdit);
	app.param('userId', users.userByID);
};
