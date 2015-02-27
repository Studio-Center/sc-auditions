'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var agencies = require('../../app/controllers/agencies');

	// Agencies Routes
	app.route('/agencies')
		.get(users.requiresLogin, agencies.list)
		.post(users.requiresLogin, agencies.create);

	app.route('/agencies/:agencyId')
		.get(users.requiresLogin, agencies.read)
		.put(users.requiresLogin, agencies.hasAuthorization, agencies.update)
		.delete(users.requiresLogin, agencies.hasAuthorization, agencies.delete);

	// Finish by binding the Agency middleware
	app.param('agencyId', agencies.agencyByID);
};