'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var projects = require('../../app/controllers/projects');
	var multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty();

	// Projects Routes
	app.route('/projects')
		.get(users.requiresLogin, projects.list)
		.post(users.requiresLogin, projects.create);

	app.route('/projects/:projectId')
		.get(users.requiresLogin, projects.read)
		.put(users.requiresLogin, projects.update)
		.delete(users.requiresLogin, projects.hasAuthorization, projects.delete);

	app.route('/projects/create')
		.get(users.requiresLogin, projects.hasAuthorization);

	app.route('/projects/lead')
		.post(users.requiresLogin, projects.lead);

	app.route('/projects/uploads')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadFile);

	app.route('/projects/deletefile')
		.post(users.requiresLogin, multipartyMiddleware, projects.deleteFileByName);

	app.route('/projects/uploads/referenceFile')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadReferenceFile);

	app.route('/projects/uploads/referenceFile/temp')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadTempReferenceFile);

	app.route('/projects/uploads/script')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadScript);

	app.route('/projects/uploads/script/temp')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadTempScript);

	app.route('/projects/uploads/audition')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadAudition);

	// Finish by binding the Project middleware
	app.param('projectId', projects.projectByID);
};