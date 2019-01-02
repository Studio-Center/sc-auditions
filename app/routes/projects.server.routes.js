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

	// load projects using a set collection count limit
	app.route('/projects/loadProject')
		.post(users.requiresLogin, projects.loadProject);

	// load projects audition files
	app.route('/projects/loadAuditions')
		.post(users.requiresLogin, projects.loadAuditions);

	// save projects audition files
	app.route('/projects/saveAudition')
		.post(users.requiresLogin, projects.saveAudition);

	// delete projects audition files
	app.route('/projects/deleteAudition')
		.post(users.requiresLogin, projects.deleteAudition);

	// load projects using a set collection count limit
	app.route('/projects/findLimit')
		.post(users.requiresLogin, projects.findLimit);

	// filter project list based on user assigned filter values
	app.route('/projects/findLimitWithFilter')
		.post(users.requiresLogin, projects.findLimitWithFilter);

	// new methods for filtering projects based on user entry
	app.route('/projects/getProjectsCnt')
		.post(users.requiresLogin, projects.getProjectsCnt);

	// list projects for clients
	app.route('/projects-client')
		.get(users.jwtauth, users.requiresLogin, projects.list);

	app.route('/projects/:projectId')
		.get(users.jwtauth, projects.read)
		.put(users.jwtauth, users.requiresLogin, projects.update)
		.delete(users.requiresLogin, projects.hasAuthorization, projects.delete);

	// custom delete method for delete tool
	app.route('/projects/getproject')
		.post(users.requiresLogin, projects.hasAuthorization, projects.getproject);

	app.route('/projects/updateNoRefresh')
		.post(users.requiresLogin, projects.updateNoRefresh);

	// custom delete method for delete tool
	app.route('/projects/deleteProjectById')
		.post(users.requiresLogin, projects.hasAuthorization, projects.deleteById);

	// backup projects by id in a group
	app.route('/projects/backupProjectsById')
		.post(users.requiresLogin, projects.hasAuthorization, projects.backupProjectsById);

	app.route('/projects/uploadBackup')
		.post(users.requiresLogin, projects.hasAuthorization, multipartyMiddleware, projects.uploadBackup);

	app.route('/projects/create')
		.get(users.requiresLogin, projects.hasAuthorization);

	// download all auditions for selected project
	app.route('/projects/downloadallauditions')
		.post(users.requiresLogin, projects.downloadAllAuditions);
	app.route('/projects/downloadBookedAuditions')
		.post(users.requiresLogin, projects.downloadBookedAuditions);
	app.route('/projects/downloadSelectedAuditions')
		.post(users.requiresLogin, projects.downloadSelectedAuditions);

	// book all selected auditions
	app.route('/projects/bookAuditions')
		.post(users.requiresLogin, projects.bookAuditions);

	// gather filtered list of projects by selected talent id
	app.route('/projects/filterByTalent')
		.post(users.requiresLogin, projects.getTalentFilteredProjects);

	// post lead via emailw
	app.route('/projects/lead')
		.post(projects.lead);

	// send non-group targetted email
	app.route('/projects/sendemail')
		.post(users.requiresLogin, projects.sendEmail);

	// send emails to assigned clients
	app.route('/projects/sendclientemail')
		.post(users.requiresLogin, projects.sendClientEmail);

	// send emails to clients
	app.route('/projects/updatetalentstatus')
		.post(users.requiresLogin, projects.updateTalentStatus);

	// update project talent status
	app.route('/projects/sendtalentemail')
		.post(users.requiresLogin, projects.sendTalentEmail);
	app.route('/projects/sendTalentDirectorsEmail')
		.post(users.requiresLogin, projects.sendTalentDirectorsEmail);
	app.route('/projects/sendTalentEmailById')
		.post(users.requiresLogin, projects.sendTalentEmailById);
	app.route('/projects/updateSingleTalentStatus')
		.post(users.requiresLogin, projects.updateSingleTalentStatus);
	app.route('/projects/updateTalentNote')
		.post(users.requiresLogin, projects.updateTalentNote);
	app.route('/projects/sendTalentCanceledEmail')
		.post(users.requiresLogin, projects.sendTalentCanceledEmail);
	app.route('/projects/sendTalentScriptUpdateEmail')
		.post(users.requiresLogin, projects.sendTalentScriptUpdateEmail);

	// check file exists
	app.route('/projects/fileExists')
		.post(users.requiresLogin, multipartyMiddleware, projects.fileExists);

	// remove selected file from file system
	app.route('/projects/deletefile')
		.post(users.requiresLogin, multipartyMiddleware, projects.deleteFileByName);

	// upload reference file
	app.route('/projects/uploads/referenceFile')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadReferenceFile);

	// upload temp reference file
	app.route('/projects/uploads/referenceFile/temp')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadTempReferenceFile);

	// upload script
	app.route('/projects/uploads/script')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadScript);

	// upload temp script file
	app.route('/projects/uploads/script/temp')
		.post(multipartyMiddleware, projects.uploadTempScript);

	// remove selected file from file system
	app.route('/projects/deleteTempScript')
		.post(multipartyMiddleware, projects.deleteTempScript);

	// upload audition file
	app.route('/projects/uploads/audition')
		.post(users.requiresLogin, multipartyMiddleware, projects.uploadAudition);

	app.route('/projects/uploads/audition/temp')
		.post(multipartyMiddleware, projects.uploadTempAudition);

	app.route('/projects/uploads/talentAuditions')
		.post(multipartyMiddleware, projects.uploadTalentAudition);

	// Finish by binding the Project middleware
	app.param('projectId', projects.projectByID);
};
