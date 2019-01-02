'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Project = mongoose.model('Project'),
    Audition = mongoose.model('Audition'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Typecast = mongoose.model('Typecast'),
	Log = mongoose.model('Log'),
	fs = require('fs'),
	config = require('../../config/config'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	archiver = require('archiver'),
	json2csv = require('json2csv'),
	dateFormat = require('dateformat'),
	// set date and timezone
	moment = require('moment-timezone'),
	os = require('os'),
	njds = require('nodejs-disks');

exports.emailMissingAuds = function(req, res){

	var callTalents = {}, talentId, missingCnt = 0;

	var yesterday = new Date();
	yesterday.setHours(0,0,0,0);
	//yesterday.setDate(yesterday.getDate() - 1);
	var tomorrow = new Date(yesterday);
	tomorrow.setDate(tomorrow.getDate() + 1);

	var searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			async.waterfall([
				function(done) {
					User.find({'roles':'admin'}).sort('-created').exec(function(err, admins) {
						done(err, admins);
					});
				},
				function(admins, done) {
					User.find({'roles':{ $in: ['producer/auditions director', 'audio intern']}}).sort('-created').exec(function(err, directors) {
						done(err, admins, directors);
					});
				},
				function(admins, directors, done) {
					User.find({'roles':'production coordinator'}).sort('-created').exec(function(err, coordinators) {
						done(err, admins, directors, coordinators);
					});
				},
				function(admins, directors, coordinators, done) {
					User.find({'roles':'talent director'}).sort('-created').exec(function(err, talentdirectors) {
						done(err, admins, directors, coordinators, talentdirectors);
					});
				},
				function(admins, directors, coordinators, talentdirectors, done) {

					// add previously queried roles to email list
					var i, to = [];
					for(i = 0; i < admins.length; ++i){
						to.push(admins[i].email);
					}
					for(i = 0; i < directors.length; ++i){
						to.push(directors[i].email);
					}
					for(i = 0; i < coordinators.length; ++i){
						to.push(coordinators[i].email);
					}
					for(i = 0; i < talentdirectors.length; ++i){
						to.push(talentdirectors[i].email);
					}

					done('', to);
				},
				function(to, done) {

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

							// walk through project found talent
							async.forEach(project.talent, function (talent, talentCallback) {

								if(typeof talent !== 'undefined'){

									async.waterfall([
										// gather info for selected talent
										function(done) {
											Talent.findOne({'_id':talent.talentId}).sort('-created').exec(function(err, talentInfo) {
												done(err, talentInfo);
											});
										},
										function(talentInfo, done){

											if(talent.status !== 'Out' && talent.status !== 'Posted' && talent.status !== 'Not Posted (Bad Read)'){
												callTalents[project._id].talents.push(talent);
												talentId = callTalents[project._id].talents.length - 1;
												callTalents[project._id].talents[talentId].data = talentInfo;
												++callTalents[project._id].missingAudsCnt;
												++missingCnt;
											}
											done('');
										}
										], function(err) {
										if (err) {
											return res.status(400).json(err);
										} else {
											talentCallback();
										}
									});

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
							done(err, missingAudsEmailHTML, to);
						});

		           	});

				},
				// generate email
				function(missingAudsEmailHTML, to, done) {

					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
					var newDate = new Date();

					// assign email subject line
					var emailSubject = ' Missing Auditions Report - ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

					var mailOptions = {
						to: to,
						from: config.mailer.from,
						replyTo: config.mailer.from,
						cc: config.mailer.notifications,
						subject: emailSubject,
						html: missingAudsEmailHTML
					};

					transporter.sendMail(mailOptions, function(err){

						// log event
						var log = {
							type: 'system',
							sharedKey: 'N/A',
							description: 'missing auditions email sent'
						};
						log = new Log(log);
						log.save();

						done(err);
					});

				}
			], function(err) {
				if (err) {
					return console.log(err);
				} else {
					return res.status(200).send();
				}
			});

		}
	});

};

// methods for missing auditions report
exports.findMissingAuds = function(req, res){

	var callTalents = {}, talentId, missingCnt = 0;

	var yesterday = new Date(req.body.dateFilter);
	//yesterday.setDate(yesterday.getDate() - 1);
	var tomorrow = new Date(req.body.dateFilter);
	tomorrow.setDate(tomorrow.getDate() + 1);

	var searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

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

					// walk through project found talent
					async.forEach(project.talent, function (talent, talentCallback) {

						if(typeof talent !== 'undefined'){

							async.waterfall([
								// gather info for selected talent
								function(done) {
									Talent.findOne({'_id':talent.talentId}).sort('-created').exec(function(err, talentInfo) {
										done(err, talentInfo);
									});
								},
								function(talentInfo, done){

									if(talent.status !== 'Out' && talent.status !== 'Posted' && talent.status !== 'Not Posted (Bad Read)'){
										callTalents[project._id].talents.push(talent);
										talentId = callTalents[project._id].talents.length - 1;
										callTalents[project._id].talents[talentId].data = talentInfo;
										++callTalents[project._id].missingAudsCnt;
										++missingCnt;
									}
									done('');
								}
								], function(err) {
								if (err) {
									return res.status(400).json(err);
								} else {
									talentCallback();
								}
							});

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

		}
	});
};

exports.convertToCSV = function(req, res){

	var projects = req.body.jsonDoc.projects;
	var clients = [], talents = [];
	var fields = [
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

// method vars
var statusOpts = [
					'In Progress',
					'On Hold',
					'Booked',
					'Canceled',
					'ReAuditioned',
					'Dead',
					'Closed - Pending Client Decision',
					'Complete'
				];
// projects
var projectsStats = [];
var projectData = {
	id: '',
	name: '',
	client: [],
	dueDate: '',
	projectCoordinator: '',
	status: '',
	talentChosen: []
};
// stats
var pCStats = [];
var pCStatsData = {
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
//var yesterday = new Date(req.body.dateFilterStart);
//	yesterday.setDate(yesterday.getDate() - 1);
//	var tomorrow = new Date(req.body.dateFilterEnd);
//	tomorrow.setDate(tomorrow.getDate() + 1);
var yesterday = new Date(req.body.dateFilterStart);
	yesterday.setDate(yesterday.getDate());
    yesterday.setHours(0, 0, 0);
	var tomorrow = new Date(req.body.dateFilterEnd);
	tomorrow.setDate(tomorrow.getDate());
    tomorrow.setHours(23, 59, 59);
    
	// assign filter criteria
	var searchCriteria = {'estimatedCompletionDate': {$gte: yesterday, $lt: tomorrow}};

	// walk found projects
	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {

		async.eachSeries(projects, function (project, projectCallback) {

			// assign owner data
			// gather project owner data
			var ownerId;
			if(!project.owner){
				ownerId = project.user;
			} else{
				ownerId = project.owner;
			}

			User.findOne({'_id':ownerId}).sort('-created').exec(function(err, user) {
				if(user){
					var talentBooked = [];

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
						for(var i = 0; i < pCStats.length; ++i){
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

	var stats = {
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
    
//    // generate start dates
//	var yesterday = new Date(req.body.dateFilter);
//	//yesterday.setDate(yesterday.getDate() - 1);
//	var tomorrow = new Date(req.body.dateFilter);
//	tomorrow.setDate(tomorrow.getDate() + 1);
// generate start dates
var yesterday = new Date(req.body.dateFilterStart);
	yesterday.setDate(yesterday.getDate());
    yesterday.setHours(0, 0, 0);
	var tomorrow = new Date(req.body.dateFilterEnd);
	tomorrow.setDate(tomorrow.getDate());
    tomorrow.setHours(23, 59, 59);
    
    var audsResult = {};

	// assign filter criteria
	var searchCriteria = {'created': {$gte: yesterday, $lt: tomorrow}};

    // walk found auditions
	Audition.find(searchCriteria).sort('-created').exec(function(err, auditions) {
        if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// walk through found projects
			async.eachSeries(auditions, function (audition, callback) {
                
                // load project auditions
                if(typeof audition.approved.by.userId !== 'undefined'){
                    User.findOne({'_id':audition.approved.by.userId}).sort('-created').exec(function(err, user) {
                        if (err) {
                        } else if(typeof user !== 'undefined'){
                            if(typeof audsResult[audition.approved.by.userId] == 'undefined'){
                                //console.log(audition.approved);
                                audsResult[audition.approved.by.userId] = {};
                                audsResult[audition.approved.by.userId].name = user.firstName + ' ' + user.lastName;
                                audsResult[audition.approved.by.userId].email = user.email;
                                audsResult[audition.approved.by.userId].username = user.username;
                                audsResult[audition.approved.by.userId].projects = {};
                                audsResult[audition.approved.by.userId].projects[audition.project] = {};
                                audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
                                Project.findOne({'_id':audition.project}).sort('-created').exec(function(err, project) {
                                    if (err) {
                                        audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
                                    } else if(typeof project != 'undefined'){
                                        audsResult[audition.approved.by.userId].projects[audition.project].title = project.title;
                                    }
                                });
                                
                                audsResult[audition.approved.by.userId].projects[audition.project].count = 1;

                                audsResult[audition.approved.by.userId].count = 1;
                            } else {
                                
                                if(typeof audsResult[audition.approved.by.userId].projects[audition.project] == 'undefined'){
                                    audsResult[audition.approved.by.userId].projects[audition.project] = {};
                                    
                                    audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
                                    Project.findOne({'_id':audition.project}).sort('-created').exec(function(err, project) {
                                        if (err) {
                                            audsResult[audition.approved.by.userId].projects[audition.project].title = audition.project;
                                        } else if(typeof project != 'undefined'){
                                            audsResult[audition.approved.by.userId].projects[audition.project].title = project.title;
                                        }
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
        }
    });

};
