'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var logs = require('../../app/controllers/logs');

	// Logs Routes
	app.route('/logs')
		.get(logs.list)
		.post(users.requiresLogin, logs.create);

	app.route('/logs/:logId')
		.get(logs.read)
		.put(users.requiresLogin, logs.hasAuthorization, logs.update)
		.delete(users.requiresLogin, logs.hasAuthorization, logs.delete);

	// gather filtered list of logs
	app.route('/logs/listFilter')
		.post(users.requiresLogin, logs.listFilter);
	app.route('/logs/listTypeFilter')
		.post(users.requiresLogin, logs.listTypeFilter);

	// get records count
	app.route('/logs/recCount')
		.post(users.requiresLogin, logs.recCount);

	// Finish by binding the Log middleware
	app.param('logId', logs.logByID);
};
