'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var talents = require('../../app/controllers/talents');

	// Talents Routes
	app.route('/talents')
		.get(users.requiresLogin, talents.list)
		.post(users.requiresLogin, talents.hasAuthorization, talents.create);

	app.route('/talents/:talentId')
		.get(talents.read)
		.put(users.requiresLogin, talents.hasAuthorization, talents.update)
		.delete(users.requiresLogin, talents.hasAuthorization, talents.delete);

	// gather filtered list of talents
	app.route('/talents/findLimitWithFilter')
		.post(users.requiresLogin, talents.findLimitWithFilter);

	// get records count
	app.route('/talents/recCount')
		.post(users.requiresLogin, talents.getTalentsCnt);

	// Finish by binding the Talent middleware
	app.param('talentId', talents.talentByID);
};
