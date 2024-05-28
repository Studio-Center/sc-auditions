'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Project = mongoose.model('Project'),
    Audition = mongoose.model('Audition'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	config = require('../../config/config'),
	radash = require('radash'),
	async = require('async'),
	sgMail = require('@sendgrid/mail'),
	json2csv = require('json2csv'),
	dateFormat = require('dateformat'),
	os = require('os'),
	njds = require('nodejs-disks');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

exports.emailMissingAuds = function(req, res){

	let callTalents = {}, talentId, missingCnt = 0,
		yesterday = new Date();

	yesterday.setHours(0,0,0,0);

	//yesterday.setDate(yesterday.getDate() - 1);
	let tomorrow = new Date(yesterday);
	tomorrow.setDate(tomorrow.getDate() + 1);

	let searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	Project.find(searchCriteria).populate('user', 'displayName').sort('-estimatedCompletionDate').then(function (projects) {

		async.waterfall([
				function(done) {

					// walk through found projects
					async.forEach(projects, function (project, callback) {
						// walk through found talents
						if(typeof project.talent !== 'undefined' && project.talent.length > 0){

							// create project object
							callTalents[project._id] = {
														project: {
																	_id: '',
																	title: '',
																	estimatedCompletionDate: ''
																},
														missingAudsCnt: 0,
														talents: []
														};
							callTalents[project._id].project._id = String(project._id);
							callTalents[project._id].project.title = project.title;
							callTalents[project._id].project.estimatedCompletionDate = project.estimatedCompletionDate;
							callTalents[project._id].talents = [];
							callTalents[project._id].missingAudsCnt = 0;

							// walk through project found talent
							async.forEach(project.talent, function (talent, talentCallback) {

								if(typeof talent !== 'undefined'){

									Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
										
										if(talent.status !== 'Out' && talent.status !== 'Posted' && talent.status !== 'Not Posted (Bad Read)'){
											callTalents[project._id].talents.push(talent);
											talentId = callTalents[project._id].talents.length - 1;
											callTalents[project._id].talents[talentId].data = talentInfo;
											++callTalents[project._id].missingAudsCnt;
											++missingCnt;
										}
										talentCallback();
									}).catch(function (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									});

								} else {
									talentCallback();
								}

							}, function (err) {
								if( err ) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
					            	callback();
								}
				           	});

						} else {

							callback();

						}

					}, function (err) {

						res.render('templates/missing-auds-email', {
							count: missingCnt,
							results:callTalents
						}, function(err, missingAudsEmailHTML) {
							done(err, missingAudsEmailHTML);
						});

		           	});

				},
				// generate email
				function(missingAudsEmailHTML, done) {

					// send email
					let newDate = new Date();

					// assign email subject line
					let emailSubject = ' Missing Auditions Report - ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

					let mailOptions = {
						to: config.mailer.notifications,
						from: config.mailer.from,
						subject: emailSubject,
						html: missingAudsEmailHTML
					};

					sgMail
					.send(mailOptions)
					.then(() => {

						// log event
						let log = {
							type: 'system',
							sharedKey: 'N/A',
							description: 'missing auditions email sent'
						};
						log = new Log(log);
						log.save();

						done();
					}, error => {
						done(error);
					});

				}
			], function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});	
				} else {
					return res.status(200).send();
				}
			});

	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});	
	});

};

// methods for missing auditions report
exports.findMissingAuds = function(req, res){

	let callTalents = {}, talentId, missingCnt = 0,
		yesterday = new Date(req.body.dateFilter);
	//yesterday.setDate(yesterday.getDate() - 1);
	let tomorrow = new Date(req.body.dateFilter);
	tomorrow.setDate(tomorrow.getDate() + 1);

	let searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	Project.find(searchCriteria).populate('user', 'displayName').sort('-estimatedCompletionDate').then(function (projects) {

		// walk through found projects
		async.forEach(projects, function (project, callback) {
			// walk through found talents
			if(typeof project.talent !== 'undefined' && project.talent.length > 0){

				// create project object
				callTalents[project._id] = {
											project: {
														_id: '',
														title: '',
														estimatedCompletionDate: ''
													},
											missingAudsCnt: 0,
											talents: []
											};
				callTalents[project._id].project._id = project._id;
				callTalents[project._id].project.title = project.title;
				callTalents[project._id].project.estimatedCompletionDate = project.estimatedCompletionDate;
				callTalents[project._id].talents = [];
				callTalents[project._id].missingAudsCnt = 0;

				// walk through project found talent
				async.forEach(project.talent, function (talent, talentCallback) {

					if(typeof talent !== 'undefined'){

						Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
							
							if(talent.status !== 'Out' && talent.status !== 'Posted' && talent.status !== 'Not Posted (Bad Read)'){
								callTalents[project._id].talents.push(talent);
								talentId = callTalents[project._id].talents.length - 1;
								callTalents[project._id].talents[talentId].data = talentInfo;
								++callTalents[project._id].missingAudsCnt;
								++missingCnt;
							}
							talentCallback();

						}).catch(function (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						});

					} else {
						talentCallback();
					}

				}, function (err) {
					if( err ) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						callback();
					}
				});

			} else {

				callback();

			}

		}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp({count: missingCnt, results:callTalents});
			}
		});

	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

exports.convertToCSV = function(req, res){

	let projects = req.body.jsonDoc.projects,
		clients = [], talents = [],
		fields = [
					'name',
					'client',
					'dueDate',
					'projectCoordinator',
					'status',
					'talentChosen'
				];

	// cleanup client and talent lists
	async.eachSeries(projects, function (project, clientsCallback) {

		clients = [];

		async.eachSeries(project.client, function (client, clientCallback) {

			clients.push(client.name);

			clientCallback();

		}, function (err) {
			if( err && err !== '') {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				project.client = clients.join(' : ');
				clientsCallback();
			}
		});

	}, function (err) {
		if( err && err !== '') {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			async.eachSeries(projects, function (project, talentsCallback) {

				talents = [];

				async.eachSeries(project.talentChosen, function (talent, talentCallback) {

					talents.push(talent.name);

					talentCallback();

				}, function (err) {
					if( err && err !== '') {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						project.talentChosen = talents.join(' : ');
						talentsCallback();
					}

				});

			}, function (err) {
				if( err && err !== '') {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {

					json2csv({ data: projects, fields: fields }, function(err, csv) {
					if (err) console.log(err);

						res.header('Content-Disposition', 'attachment;filename=Auditions-Booked.csv');
						res.type('text/csv');
						res.send(csv);
					});

				}

			});

		}

	});

};

exports.findAuditionsBooked = function(req, res){

	// projects
	let projectsStats = [],
		projectData = {
			id: '',
			name: '',
			client: [],
			dueDate: '',
			projectCoordinator: '',
			status: '',
			talentChosen: []
		},
		pCStats = [],
		pCStatsData = {
			id: '',
			name: '',
			totalInProgress: 0,
			totalOnHold: 0,
			totalBooked: 0,
			totalCanceled: 0,
			totalPending: 0,
			totalReAuditioned: 0,
			totalDead: 0,
			totalClosed: 0,
			totalAuditions: 0,
			totalBookedPercent: 0
		};

	// generate start dates
	let yesterday = new Date(req.body.dateFilterStart);
	yesterday.setDate(yesterday.getDate());
	yesterday.setHours(0, 0, 0);
	let tomorrow = new Date(req.body.dateFilterEnd);
	tomorrow.setDate(tomorrow.getDate());
	tomorrow.setHours(23, 59, 59);

	// assign filter criteria
	let searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	// walk found projects
	Project.find(searchCriteria).populate('user', 'displayName').sort('-estimatedCompletionDate').then(function (projects) {

		async.eachSeries(projects, function (project, projectCallback) {

			// assign owner data
			// gather project owner data
			let ownerId;
			if(!project.owner){
				ownerId = project.user;
			} else{
				ownerId = project.owner;
			}

			User.findOne({'_id':ownerId}).sort('-created').then(function (user) {
				if(user){
					let talentBooked = [];

					async.eachSeries(project.talent, function (talent, talentCallback) {

						if(talent.booked === true){
							talentBooked.push(talent);
						}

						talentCallback();

					}, function (err) {

						// generate project data
						projectData = {
							id: project._id,
							name: project.title,
							client: project.client,
							dueDate: project.estimatedCompletionDate,
							projectCoordinator: user.displayName,
							status: String(project.status),
							talentChosen: talentBooked
						};
						projectsStats.push(projectData);

						// generate or update production coordinators stats

						// setup default object
						pCStatsData = {
							id: user._id,
							name: user.displayName,
							totalInProgress: 0,
							totalOnHold: 0,
							totalBooked: 0,
							totalCanceled: 0,
							totalPending: 0,
							totalReAuditioned: 0,
							totalDead: 0,
							totalClosed: 0,
							totalComplete: 0,
							totalAuditions: 0,
							totalBookedPercent: 0
						};

						// check for PC within stats array
						for(const i in pCStats) {
							// find existing instance of PC stats
							if(String(pCStats[i].id) === String(user._id)){
								// xfer to variable
								pCStatsData = pCStats[i];
								// remove from array
								pCStats.splice(i, 1);
							}
						}

						switch(String(projectData.status)){
							case 'In Progress':
								++pCStatsData.totalInProgress;
							break;
							case 'On Hold':
								++pCStatsData.totalOnHold;
							break;
							case 'Booked':
								++pCStatsData.totalBooked;
							break;
							case 'Canceled':
								++pCStatsData.totalBooked;
							break;
							case 'ReAuditioned':
								++pCStatsData.totalCanceled;
							break;
							case 'Dead':
								++pCStatsData.totalDead;
							break;
							case 'Closed - Pending Client Decision':
								++pCStatsData.totalClosed;
							break;
						}

						// update auditions count
						++pCStatsData.totalAuditions;

						// set booked percentage
						pCStatsData.totalBookedPercent = (pCStatsData.totalBooked / pCStatsData.totalAuditions) * 100;

						pCStatsData.totalBookedPercent = pCStatsData.totalBookedPercent.toFixed(2);

						pCStats.push(pCStatsData);

					projectCallback();

				});

				} else {
					projectCallback();
				}


			});

		}, function (err) {
			if( err && err !== '') {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				res.jsonp({pCs: pCStats, projects: projectsStats});

			}

		});
	});
};

/**
 * Report authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.report.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

// gather system stats
exports.systemStats = function(req, res, next){

	let stats = {
		arch: os.arch(),
		cpus: os.cpus(),
		totalmem: os.totalmem(),
		freemem: os.freemem(),
		platform: os.platform(),
		uptime: os.uptime(),
		loadavg: os.loadavg(),
		nodev: process.version,
		mongov: mongoose.version,
		disks: ''
	};

	njds.drives(
		function (err, drives) {
			njds.drivesDetail(
				drives,
				function (err, data) {
					stats.disks = data;
					res.jsonp(stats);
				}
			);
		}
	);

};

exports.findAudsPerProducer = function(req, res, next){
    
	// generate start dates
	if(req.body.dateFilterStart && req.body.dateFilterEnd){
		let yesterday = new Date(req.body.dateFilterStart);
			yesterday.setDate(yesterday.getDate());
			yesterday.setHours(0, 0, 0);
		let tomorrow = new Date(req.body.dateFilterEnd);
			tomorrow.setDate(tomorrow.getDate());
			tomorrow.setHours(23, 59, 59);
		
		let audsResult = {};

		// assign filter criteria
		let searchCriteria = {'created': {$gte: yesterday, $lt: tomorrow}};

		// walk found auditions
		Audition.find(searchCriteria).sort('-created').then(function (auditions) {
			// walk through found projects
			async.eachSeries(auditions, function (audition, callback) {
				
				// load project auditions
				if(typeof audition.approved.by.userId !== 'undefined'){
					User.findOne({'_id':audition.approved.by.userId}).sort('-created').then(function (user) {
						if(typeof user !== 'undefined'){
							if(typeof audsResult[audition.approved.by.userId] == 'undefined' && user != null){
								//console.log(audition.approved);
								audsResult[audition.approved.by.userId] = {};
								audsResult[audition.approved.by.userId].name = user.firstName + ' ' + user.lastName;
								audsResult[audition.approved.by.userId].email = user.email;
								audsResult[audition.approved.by.userId].username = user.username;
								audsResult[audition.approved.by.userId].projects = {};
								audsResult[audition.approved.by.userId].projects[audition.project] = {};
								audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
								Project.findOne({'_id':audition.project}).sort('-created').then(function (project) {
									audsResult[audition.approved.by.userId].projects[audition.project].title = project.title;
								}).catch(function (err) {
									audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
								});
								
								audsResult[audition.approved.by.userId].projects[audition.project].count = 1;

								audsResult[audition.approved.by.userId].count = 1;
							} else {
								
								if(typeof audsResult[audition.approved.by.userId].projects[audition.project] == 'undefined'){
									audsResult[audition.approved.by.userId].projects[audition.project] = {};
									
									audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
									Project.findOne({'_id':audition.project}).sort('-created').then(function (project) {
										audsResult[audition.approved.by.userId].projects[audition.project].title = project.title;
									}).catch(function (err) {
										audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
									});
									
									audsResult[audition.approved.by.userId].projects[audition.project].count = 1;
								} else {
									audsResult[audition.approved.by.userId].projects[audition.project].count += 1;
								}
								
								audsResult[audition.approved.by.userId].count += 1;

							}
						}
						
						callback();
					});
				} else {
					callback();
				}
				
			}, function (err) {
				if( err ) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					return res.jsonp(audsResult);
				}
			});
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else {
		return res.status(400).send({
			message: errorHandler.getErrorMessage('Please select a start and end date.')
		});
	}
};
