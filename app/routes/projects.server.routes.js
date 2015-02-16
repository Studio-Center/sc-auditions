'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var projects = require('../../app/controllers/projects');
	var multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty();

	// Projects Routes
	app.route('/projects')
		.get(projects.list)
		.post(users.requiresLogin, projects.create);

	app.route('/projects/:projectId')
		.get(projects.read)
		.put(users.requiresLogin, projects.hasAuthorization, projects.update)
		.delete(users.requiresLogin, projects.hasAuthorization, projects.delete);

	app.route('/projects/uploads')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadFile);

	app.route('/projects/uploads/script')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadScript);

	app.route('/projects/uploads/audition')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadAudition);

	// Finish by binding the Project middleware
	app.param('projectId', projects.projectByID);
};