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
	dateFormat = require('dateformat'),
	// set date and timezone
	moment = require('moment-timezone'),
	now = new Date();

// methods for missing auditions report
exports.findMissingAuds = function(req, res){
	var callTalents = {}, talentId, missingCnt = 0;
	var searchCriteria = {'talent': { 
									$not: {
										$elemMatch: { 
											'status': ['Out', 'Posted', 'Not Posted (Bad Read)']
										}
									} 
								}
						};

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