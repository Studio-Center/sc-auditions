'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Tool = mongoose.model('Tool'),
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
	now = new Date();;

/* custom tools methods */
exports.sendTalentEmails = function(req, res){
	var email = req.body.email;
	var emailClients = req.body.emailClients;

	// email all talents if email all is set to true
	if(email.all === true){

		Talent.find().sort({'locationISDN': 1,'lastName': 1,'-created': -1}).populate('user', 'displayName').exec(function(err, talents) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				async.waterfall([
					function(done) {

						// generate email signature
						var emailSig = '';
						if(req.user.emailSignature){
							emailSig = req.user.emailSignature.replace(/\r?\n/g, '<br>');
						} else {
							emailSig = '';
						}

						res.render('templates/custom-talent-email', {
							email: email,
							emailSignature: emailSig
						}, function(err, talentEmailHTML) {
							done(err, talentEmailHTML);
						});

					},
					function(talentEmailHTML, done) {
						// walk through all available telent and send emails
						for(var i = 0; i < talents.length; ++i){

							// anon func to capture state variables
							(function(){

								var curTalent = talents[i];

								// check for talent preferred contact
								var idx = curTalent.type.indexOf('Email');
								if (idx > -1){

									// add both email addresses if talent has backup
									var talentEmails = [];
									talentEmails[0] = curTalent.email;
									if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
										talentEmails[1] = curTalent.email2
									}

									// send email
									var transporter = nodemailer.createTransport(config.mailer.options);

									var mailOptions = {
														to: talentEmails,
														from: req.user.email || config.mailer.from,
														replyTo: req.user.email || config.mailer.from,
														subject: email.subject,
														html: talentEmailHTML
													};

									transporter.sendMail(mailOptions, function(){
										//done(err);
									});
										
								}

						})();
					}
					done('');
				}
				], function(err) {
					if(err){
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						return res.status(200).send();
					}
				});
			}
		});

	// email only selected clients
	} else {

		Talent.where('_id').in(emailClients).sort({'locationISDN': 1,'lastName': 1,'-created': -1}).populate('user', 'displayName').exec(function(err, talents) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				async.waterfall([
					function(done) {

						// generate email signature
						var emailSig = '';
						if(req.user.emailSignature){
							emailSig = req.user.emailSignature.replace(/\r?\n/g, '<br>');
						} else {
							emailSig = '';
						}

						res.render('templates/custom-talent-email', {
							email: email,
							emailSignature: emailSig
						}, function(err, talentEmailHTML) {
							done(err, talentEmailHTML);
						});

					},
					function(talentEmailHTML, done) {
						// walk through all available telent and send emails
						for(var i = 0; i < talents.length; ++i){

							// anon func to capture state variables
							(function(){

								var curTalent = talents[i];

								// check for talent preferred contact
								var idx = curTalent.type.indexOf('Email');
								if (idx > -1){

									// add both email addresses if talent has backup
									var talentEmails = [];
									talentEmails[0] = curTalent.email;
									if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
										talentEmails[1] = curTalent.email2
									}

									// send email
									var transporter = nodemailer.createTransport(config.mailer.options);

									var mailOptions = {
														to: talentEmails,
														from: req.user.email || config.mailer.from,
														replyTo: req.user.email || config.mailer.from,
														subject: email.subject,
														html: talentEmailHTML
													};

									transporter.sendMail(mailOptions, function(){
										//done(err);
									});
										
								}

						})();
					}
					done('');
				}
				], function(err) {
					if(err){
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						return res.status(200).send();
					}
				});
			}
		});
	}
	
};

// call list methods
var gatherTalentsSearch = function(req, res, filter){
	var callTalents = [], talentId;
	var searchCriteria = {'talent': { 
									$elemMatch: { 
										'status': filter
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
				if(typeof project.talent !== 'undefined'){

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
									if(talent.status === filter){
										callTalents.push(talent);
										talentId = callTalents.length - 1;
										callTalents[talentId].data = talentInfo;
										callTalents[talentId].project = {};
										callTalents[talentId].project._id = project._id;
										callTalents[talentId].project.title = project.title;
										callTalents[talentId].project.estimatedCompletionDate = project.estimatedCompletionDate;
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
					res.jsonp(callTalents);
				}
           	});
			
		}
	});
};
exports.gatherTalentsToCall = function(req, res){

	gatherTalentsSearch(req, res, 'Cast');

};
exports.gatherTalentsMessagesLeft = function(req, res){

	gatherTalentsSearch(req, res, 'Message left');

};
exports.gatherTalentsAlreadyScheduled = function(req, res){

	gatherTalentsSearch(req, res, 'Scheduled');

};

/**
 * Create a Tool
 */
exports.create = function(req, res) {
	var tool = new Tool(req.body);
	tool.user = req.user;

	tool.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tool);
		}
	});
};

/**
 * Show the current Tool
 */
exports.read = function(req, res) {
	res.jsonp(req.tool);
};

/**
 * Update a Tool
 */
exports.update = function(req, res) {
	var tool = req.tool ;

	tool = _.extend(tool , req.body);

	tool.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tool);
		}
	});
};

/**
 * Delete an Tool
 */
exports.delete = function(req, res) {
	var tool = req.tool ;

	tool.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tool);
		}
	});
};

/**
 * List of Tools
 */
exports.list = function(req, res) { Tool.find().sort('-created').populate('user', 'displayName').exec(function(err, tools) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tools);
		}
	});
};

/**
 * Tool middleware
 */
exports.toolByID = function(req, res, next, id) { Tool.findById(id).populate('user', 'displayName').exec(function(err, tool) {
		if (err) return next(err);
		if (! tool) return next(new Error('Failed to load Tool ' + id));
		req.tool = tool ;
		next();
	});
};

/**
 * Tool authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.tool.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};