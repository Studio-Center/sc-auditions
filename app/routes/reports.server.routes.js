'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var reports = require('../../app/controllers/reports');

	// Reports Routes
	app.route('/reports');

	// app.route('/reports/:reportId')
	// 	.get(reports.read)
	// 	.put(users.requiresLogin, reports.hasAuthorization, reports.update)
	// 	.delete(users.requiresLogin, reports.hasAuthorization, reports.delete);

	app.route('/reports/findMissingAuds')
		.post(users.requiresLogin, reports.findMissingAuds);

	app.route('/reports/findAuditionsBooked')
		.post(users.requiresLogin, reports.findAuditionsBooked);

	// automated missing reports email
	app.route('/reports/emailMissingAuds')
		.get(reports.emailMissingAuds);

	app.route('/reports/convertToCSV')
		.post(users.requiresLogin, reports.convertToCSV);

	app.route('/reports/systemStats')
		.post(users.requiresLogin, reports.systemStats);
    
	app.route('/reports/findAudsPerProducer')
		.post(users.requiresLogin, reports.findAudsPerProducer);

};
