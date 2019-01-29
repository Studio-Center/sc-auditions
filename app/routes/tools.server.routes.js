'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var tools = require('../../app/controllers/tools');
	var multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty();

	// Tools Routes
	app.route('/tools');

	// custom tools routes
	app.route('/tools/sendtalentemails')
		.post(users.requiresLogin, tools.sendTalentEmails);

	app.route('/tools/sendPreCloseSummary')
		.get(tools.sendPreCloseSummary);

	app.route('/tools/mainClientsCheck')
		.get(tools.mainClientsCheck);

	// call list routes
	app.route('/tools/gatherTalentsToCall')
		.post(users.requiresLogin, tools.gatherTalentsToCall);

	app.route('/tools/gatherTalentsMessagesLeft')
		.post(users.requiresLogin, tools.gatherTalentsMessagesLeft);

	app.route('/tools/gatherTalentsAlreadyScheduled')
		.post(users.requiresLogin, tools.gatherTalentsAlreadyScheduled);

	app.route('/tools/gatherEmailedTalent')
		.post(users.requiresLogin, tools.gatherEmailedTalent);

	app.route('/tools/uploadTalentCSV')
		.post(users.requiresLogin, multipartyMiddleware, tools.uploadTalentCSV);

	app.route('/tools/processGoogleSheet')
		.post(users.requiresLogin, tools.processGoogleSheet);

	// added to display new project form submissions
	app.route('/tools/listNewprojects')
		.post(users.requiresLogin, tools.listNewprojects);
    
	app.route('/tools/newprojectByID')
		.post(users.requiresLogin, tools.newprojectByID);

};
