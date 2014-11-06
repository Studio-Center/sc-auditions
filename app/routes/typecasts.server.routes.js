'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var typecasts = require('../../app/controllers/typecasts');

	// Typecasts Routes
	app.route('/typecasts')
		.get(typecasts.list)
		.post(users.requiresLogin, typecasts.create);

	app.route('/typecasts/:typecastId')
		.get(typecasts.read)
		.put(users.requiresLogin, typecasts.hasAuthorization, typecasts.update)
		.delete(users.requiresLogin, typecasts.hasAuthorization, typecasts.delete);

	// Finish by binding the Typecast middleware
	app.param('typecastId', typecasts.typecastByID);
};