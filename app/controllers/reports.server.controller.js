'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Report = mongoose.model('Report'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Typecast = mongoose.model('Typecast'),
	fs = require('fs'),
	config = require('../../config/config'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	nodemailer = require('nodemailer'),
	archiver = require('archiver'),
	json2csv = require('json2csv'),
	dateFormat = require('dateformat'),
	// set date and timezone
	moment = require('moment-timezone'),
	now = new Date();

// methods for missing auditions report
exports.findMissingAuds = function(req, res){
	var callTalents = {}, talentId, missingCnt = 0;
	// var searchCriteria = {'talent': { 
	// 								$not: {
	// 									$elemMatch: { 
	// 										'status': ['Out', 'Posted', 'Not Posted (Bad Read)']
	// 									}
	// 								} 
	// 							}
	// 					};

	var yesterday = new Date(req.body.dateFilter);
	yesterday.setDate(yesterday.getDate() - 1);
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
									return res.json(400, err);
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
					res.jsonp({count: missingCnt, results:callTalents});
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
	console.log();
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

						res.header("Content-Disposition", "attachment;filename=Auditions-Booked.csv"); 
						res.type("text/csv");
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
var yesterday = new Date(req.body.dateFilterStart);
	yesterday.setDate(yesterday.getDate() - 1);
	var tomorrow = new Date(req.body.dateFilterEnd);
	tomorrow.setDate(tomorrow.getDate() + 1);

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

					// generate project data
					projectData = {
						id: project._id,
						name: project.title,
						client: project.client,
						dueDate: project.estimatedCompletionDate,
						projectCoordinator: user.displayName,
						status: new String(project.status),
						talentChosen: project.talent
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
						if(pCStats[i].id == String(user._id)){
							// xfer to variable
							pCStatsData = pCStats[i];
							// remove from array
							pCStats.splice(i, 1);
						}
					};

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
					};

					// update auditions count
					++pCStatsData.totalAuditions;

					// set booked percentage
					pCStatsData.totalBookedPercent = (pCStatsData.totalBooked / pCStatsData.totalAuditions) * 100;

					pCStatsData.totalBookedPercent = pCStatsData.totalBookedPercent.toFixed(2);

					pCStats.push(pCStatsData);

				}

				projectCallback();

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
 * Create a Report
 */
exports.create = function(req, res) {
	var report = new Report(req.body);
	report.user = req.user;

	report.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(report);
		}
	});
};

/**
 * Show the current Report
 */
exports.read = function(req, res) {
	res.jsonp(req.report);
};

/**
 * Update a Report
 */
exports.update = function(req, res) {
	var report = req.report ;

	report = _.extend(report , req.body);

	report.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(report);
		}
	});
};

/**
 * Delete an Report
 */
exports.delete = function(req, res) {
	var report = req.report ;

	report.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(report);
		}
	});
};

/**
 * List of Reports
 */
exports.list = function(req, res) { Report.find().sort('-created').populate('user', 'displayName').exec(function(err, reports) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reports);
		}
	});
};

/**
 * Report middleware
 */
exports.reportByID = function(req, res, next, id) { Report.findById(id).populate('user', 'displayName').exec(function(err, report) {
		if (err) return next(err);
		if (! report) return next(new Error('Failed to load Report ' + id));
		req.report = report ;
		next();
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