'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var talents = require('../../app/controllers/talents');

	// Talents Routes
	app.route('/talents')
		.get(talents.list)
		.post(users.requiresLogin, talents.create);

	app.route('/talents/:talentId')
		.get(talents.read)
		.put(users.requiresLogin, talents.hasAuthorization, talents.update)
		.delete(users.requiresLogin, talents.hasAuthorization, talents.delete);

	// Finish by binding the Talent middleware
	app.param('talentId', talents.talentByID);
};