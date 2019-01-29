'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Typecast = mongoose.model('Typecast'),
	Log = mongoose.model('Log'),
	Newproject = mongoose.model('Newproject'),
	fs = require('fs'),
	config = require('../../config/config'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	archiver = require('archiver'),
	dateFormat = require('dateformat'),
	// set date and timezone
	moment = require('moment-timezone'),
	now = new Date();

/* custom tools methods */
exports.sendTalentEmails = function(req, res){
	var email = req.body.email,
		emailClients = req.body.emailClients,
		log = {};

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
						async.eachSeries(talents, function (talent, callback) {

							var curTalent = talent;

							// check for talent preferred contact
							var idx = curTalent.type.indexOf('Email');
							if (idx > -1){

								// add both email addresses if talent has backup
								var talentEmails = [];
								talentEmails[0] = curTalent.email;
								if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
									talentEmails[1] = curTalent.email2;
								}

								// send email
								var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

								var mailOptions = {
													to: talentEmails,
													from: req.user.email || config.mailer.from,
													replyTo: req.user.email || config.mailer.from,
													cc: config.mailer.notifications,
													subject: email.subject,
													html: talentEmailHTML
												};

								transporter.sendMail(mailOptions, function(){

									// write change to log
									var log = {
										type: 'talent',
										sharedKey: String(talent._id),
										description: talent.name + ' ' + talent.lastName + ' sent custom email ',
										user: req.user
									};
									log = new Log(log);
									log.save();

									callback(err);
								});

							}

						}, function (err) {
							done(err);
				       	});
				}
				], function(err) {
					if(err){
						log = {
							type: 'error',
							sharedKey: 'na',
							description: 'Talent Emailer ' + String(errorHandler.getErrorMessage(err)),
							user: req.user
						};
						log = new Log(log);
						log.save();

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
						async.eachSeries(talents, function (talent, callback) {

								var curTalent = talent;

								// check for talent preferred contact
								if(curTalent.type.toLowerCase() === 'email'){

									// add both email addresses if talent has backup
									var talentEmails = [];
									talentEmails[0] = curTalent.email;
									if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
										talentEmails[1] = curTalent.email2;
									}

									// send email
									var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

									var mailOptions = {
														to: talentEmails,
														from: req.user.email || config.mailer.from,
														replyTo: req.user.email || config.mailer.from,
														cc: config.mailer.notifications,
														subject: email.subject,
														html: talentEmailHTML
													};

									transporter.sendMail(mailOptions, function(){
										callback(err);
									});

								}

						}, function (err) {
							done(err);
				       	});
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
								},
						'status': { $nin: ['Closed - Pending Client Decision','Canceled','Dead','Complete','Booked','ReAuditioned']}
						};

	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			// walk through found projects
			async.eachSeries(projects, function (project, callback) {
				// walk through found talents
				if(typeof project.talent !== 'undefined'){

					// walk through project found talent
					async.eachSeries(project.talent, function (talent, talentCallback) {

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
										callTalents[talentId].project.scripts = project.scripts;
										callTalents[talentId].project.note = '';
										if(talentInfo !== null){

											var talents = project.talent,
													limit = project.talent.length,
													i = 0;

											for(i = 0; i < limit; ++i){
												if(talents[i].talentId === String(talentInfo._id)){
													callTalents[talentId].project.note = talents[i].note;
												}
											}
										}
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
					var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
					socketio.sockets.emit('callListUpdate', {talents: callTalents, filter: filter}); // emit an event for all connected clients

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
exports.gatherEmailedTalent = function(req, res){
	gatherTalentsSearch(req, res, 'Emailed');
};

// gather and send list of pre close summary emails
exports.mainClientsCheck = function(req, res){

	// method vars
	var emailCnt = 0;

	var currentTime = new Date();
	//currentTime.setDate(currentTime.getHours() - 1);
	var inHalfHour = new Date();
	// modified 12/17/2015 for two hour intervals
	inHalfHour.setHours(inHalfHour.getHours() + 0.6);

	var searchCriteria = {
							'estimatedCompletionDate':
                                {
                                    $gte: currentTime,
                                    $lte: inHalfHour
                                },
							'preClose': false,
                            'client': {$size: 0}
						};

	// gather projects ending in the next hour
	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {
        
        // walk through all associated projects
		async.eachSeries(projects, function (project, callback) {

			// gather associated emails per project
			async.waterfall([
				// gather owner data
				function(done) {
					var ownerId;
					if(!project.owner){
						ownerId = project.user;
					} else{
						ownerId = project.owner;
					}

					User.findOne({'_id':ownerId}).sort('-created').exec(function(err, owner) {
						done(err, owner);
					});
				},
				// gather all producers and the talent directors
				function(owner, done){

					var searchGroups = [
										'admin',
										'producer/auditions director',
                                        'audio intern',
										'production coordinator',
										'talent director'
										];

					User.where('roles').in(searchGroups).sort('-created').exec(function(err, producers) {
						done(err, owner, producers);
					});
				},
				// gather producers emails
				function(owner, producers, done){

					var producersEmails = [];

					async.eachSeries(producers, function (producer, producerCallback) {

						producersEmails.push(producer.email);

						producerCallback();

					}, function (err) {
						if( err ) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							done(err, owner, producersEmails);
						}
			       	});
				},
				function(owner, producers, done){

					// generate email signature
					var newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours() - 1);
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					var emailSig = '';
					if(owner.emailSignature){
						emailSig = owner.emailSignature;
					} else {
						emailSig = '';
					}

					// convert project id from object to string for email
					project.id = String(project._id);

					res.render('templates/projects/main-clients-email', {
						project: project,
						dueDate: newDate,
						emailSignature: emailSig,
					}, function(err, summaryEmailHTML) {
						done(err, owner, producers, summaryEmailHTML);
					});

				},
				// send out project email
				function(owner, producers, summaryEmailHTML, done) {
					var log;
					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var emailSubject = project.title + ' is due in 30 minutes and still needs a client added';

					var mailOptions = {
						to: owner.email,
						cc: [producers, config.mailer.notifications],
						from: owner.email || config.mailer.from,
						replyTo: owner.email || config.mailer.from,
						subject: emailSubject,
						html: summaryEmailHTML
					};

					transporter.sendMail(mailOptions, function(err){

						// log event
						log = {
							type: 'system',
							sharedKey: 'N/A',
							description: ' project ' + project.title + ' is due in 30 minutes and still needs a client added',
							user: owner
						};
						log = new Log(log);
						log.save();

						// log event
						log = {
							type: 'project',
							sharedKey: String(project._id),
							description: ' project ' + project.title + ' is due in 30 minutes and still needs a client added.',
							user: owner
						};
						log = new Log(log);
						log.save();

						++emailCnt;
						done(err);
					});
				}
				], function(err) {
				if (err) {
					return res.status(400).json(err);
				} else {
					callback();
				}
			});

		}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp({status: 'success', sendCount: emailCnt});
			}
       	});
        
    });
    
}

// gather and send list of pre close summary emails
exports.sendPreCloseSummary = function(req, res){

	// method vars
	var emailCnt = 0;

	var currentTime = new Date();
	//currentTime.setDate(currentTime.getHours() - 1);
	var inOneHour = new Date();
	// modified 12/17/2015 for two hour intervals
	inOneHour.setHours(inOneHour.getHours() + 2);

	var searchCriteria = {
							'estimatedCompletionDate':
													{
														$gte: currentTime,
														$lte: inOneHour
													},
							'preClose': false
						};

	// gather projects ending in the next hour
	Project.find(searchCriteria).sort('-estimatedCompletionDate').populate('project', 'displayName').exec(function(err, projects) {

		// walk through all associated projects
		async.eachSeries(projects, function (project, callback) {

			// gather associated emails per project
			async.waterfall([
				// gather owner data
				function(done) {
					var ownerId;
					if(!project.owner){
						ownerId = project.user;
					} else{
						ownerId = project.owner;
					}

					User.findOne({'_id':ownerId}).sort('-created').exec(function(err, owner) {
						done(err, owner);
					});
				},
				// gather all producers and the talent directors
				function(owner, done){

					var searchGroups = [
										'admin',
										'producer/auditions director',
                                        'audio intern',
										'production coordinator',
										'talent director'
										];

					User.where('roles').in(searchGroups).sort('-created').exec(function(err, producers) {
						done(err, owner, producers);
					});
				},
				// gather producers emails
				function(owner, producers, done){

					var producersEmails = [];

					async.eachSeries(producers, function (producer, producerCallback) {

						producersEmails.push(producer.email);

						producerCallback();

					}, function (err) {
						if( err ) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							done(err, owner, producersEmails);
						}
			       	});
				},
				// gather talent info
				function(owner, producers, done){

					// walk through all current talents assigned to project then query talent data
					var talentIds = [];
					for(var i = 0; i < project.talent.length; ++i){
						talentIds[i] = project.talent[i].talentId;
					}

					Talent.where('_id').in(talentIds).sort('-created').exec(function(err, talents) {
						done(err, talents, owner, producers);
					});

				},
				// filter selected talents
				function(talents, owner, producers, done){
					var shortTblHeader = '<table><tr><th>First Name</th><th>Last Name</th></tr>';
					var longTblHeader = '<table><tr><th>Name</th><th>Parent Name</th><th>Phone #</th><th>Alt Phone #</th><th>Location</th><th>Email</th></tr>';
					var talentPosted = '<p>Talent Posted:</p>' + shortTblHeader,
						talentNotCalled = '<p>Talent Not Called:</p>' + longTblHeader,
						talentNotPosted = '<p>Talent Not Posted:</p>' + shortTblHeader,
						talentOut = '<p>Talent Out:</p>' + shortTblHeader;

					async.eachSeries(talents, function (talent, talentCallback) {

						for(var j = 0; j < project.talent.length; ++j){
							if(project.talent[j].talentId === String(talent._id)){

								// sort current talent into correct list
								switch(project.talent[j].status){
									case 'Posted':
										talentPosted += '<tr><td>' +
														talent.name +
														'</td><td>' +
														talent.lastName +
														'</td></tr>';
									break;
									case 'Cast':
										talentNotCalled += '<tr><td>' +
														talent.name + ' ' + talent.lastName +
														'</td><td>' +
														(talent.parentName || '') +
														'</td><td>' +
														talent.phone +
														'</td><td>' +
														talent.phone2 +
														'</td><td>' +
														talent.locationISDN +
														'</td><td>' +
														talent.email +
														'</td></tr>';
									break;
									case 'Cast':
									case 'Emailed':
									case 'Scheduled':
									case 'Message left':
									case 'Received needs to be posted':
										talentNotPosted += '<tr><td>' +
														talent.name +
														'</td><td>' +
														talent.lastName +
														'</td></tr>';
									break;
									case 'Out':
										talentOut += '<tr><td>' +
														talent.name +
														'</td><td>' +
														talent.lastName +
														'</td></tr>';
									break;
								}

								talentCallback();
							}
						}

					}, function (err) {
						if( err ) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							// close all tables
							talentPosted += '</table>';
							talentNotCalled += '</table>';
							talentNotPosted += '</table>';
							talentOut += '</table>';

							done(err, talentPosted, talentNotCalled, talentNotPosted, talentOut, owner, producers);
						}
			       	});
				},
				function(talentPosted, talentNotCalled, talentNotPosted, talentOut, owner, producers, done){

					// generate email signature
					var newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours() - 1);
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					var emailSig = '';
					if(owner.emailSignature){
						emailSig = owner.emailSignature;
					} else {
						emailSig = '';
					}

					// convert project id from object to string for email
					project.id = String(project._id);

					res.render('templates/projects/pre-close-summary-email', {
						talentPosted: talentPosted,
						talentNotCalled: talentNotCalled,
						talentNotPosted: talentNotPosted,
						talentOut: talentOut,
						project: project,
						dueDate: newDate,
						emailSignature: emailSig,
					}, function(err, summaryEmailHTML) {
						done(err, owner, producers, summaryEmailHTML);
					});

				},
				// send out talent project creation email
				function(owner, producers, summaryEmailHTML, done) {
					var log;
					// send email
					// generate email signature
					var newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours());
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var emailSubject = project.title + ' - Pre-Close Summary (Due in 2 hrs)' + ' - Due ' + newDate + ' EST';

					var mailOptions = {
						to: owner.email,
						cc: [producers, config.mailer.notifications],
						from: owner.email || config.mailer.from,
						replyTo: owner.email || config.mailer.from,
						subject: emailSubject,
						html: summaryEmailHTML
					};

					transporter.sendMail(mailOptions, function(err){

						// log event
						log = {
							type: 'system',
							sharedKey: 'N/A',
							description: ' project ' + project.title + ' preclose summary sent',
							user: owner
						};
						log = new Log(log);
						log.save();

						// log event
						log = {
							type: 'project',
							sharedKey: String(project._id),
							description: ' project ' + project.title + ' preclose summary sent',
							user: owner
						};
						log = new Log(log);
						log.save();

						++emailCnt;
						done(err);
					});
				},
				// update project to prevent resending of email
				function(done){

					Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
						req.project = project ;

						// update preclose status
						project.preClose = true;

						project = _.extend(req.project, project);

						project.save(function(err) {

							// update connected clients
							var socketio = req.app.get('socketio');
							socketio.sockets.emit('projectUpdate', {id: project._id});
							socketio.sockets.emit('callListUpdate', {filter: ''});

							done(err);
						});
					});
				}
				], function(err) {
				if (err) {
					return res.status(400).json(err);
				} else {
					callback();
				}
			});

		}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp({status: 'success', sendCount: emailCnt});
			}
       	});

	});

};

// upload new talents
exports.uploadTalentCSV = function(req, res){

	// import counts
	var newTalents = 0;
	var updatedTalents = 0;
	var failedImports = [];

	// parse uploaded CSV
	var file = req.files.file;
	var tempPath = file.path;

	var Converter = require('csvtojson').Converter;
	var fileStream = fs.createReadStream(tempPath);

	var converter = new Converter({constructResult:true});
	//end_parsed will be emitted once parsing finished
	converter.on('end_parsed', function (jsonObj) {

	   async.eachSeries(jsonObj, function (talent, talentCallback) {

	   		var unionStatus = (talent.US === '' ? '' : (talent.US === 'U' ? ['union'] : ['union','non-union']));

	   		// cerate new talent
	   		var talentData = {
				name: talent['first name'],
				lastName: talent['last name'],
				email: talent.email,
				email2: talent['email alt'],
				phone: talent.phone,
				phone2: talent['phone alt'],
				type: talent.type,
				gender: talent.gender,
				ageRange: talent.ageRange,
				unionStatus: unionStatus,
				lastNameCode: talent.lastNameCode,
				locationISDN: talent.locationISDN
			};
	   		var newTalent = new Talent(talentData);

			talent.user = req.user;

			// check for missing import data
			var failed = 0;
			var failedReason = {
				name: 0,
				lastName: 0,
				type: 0,
				gender: 0,
				ageRange: 0,
				unionStatus: 0,
				lastNameCode: 0,
				locationISDN: 0
			};
			if(newTalent.name === ''){
				++failed;
				failedReason.name = 1;
			}
			if(newTalent.lastName === ''){
				++failed;
				failedReason.lastName = 1;
			}
			if(newTalent.type === ''){
				++failed;
				failedReason.type = 1;
			}
			if(newTalent.gender === ''){
				++failed;
				failedReason.gender = 1;
			}
			if(newTalent.ageRange === ''){
				++failed;
				failedReason.ageRange = 1;
			}
			if(newTalent.unionStatus === ''){
				++failed;
				failedReason.unionStatus = 1;
			}
			if(newTalent.lastNameCode === ''){
				++failed;
				failedReason.lastNameCode = 1;
			}
			if(newTalent.locationISDN === ''){
				++failed;
				failedReason.locationISDN = 1;
			}

			// check for existing talent before saving new one
			if(failed === 0){
				Talent.findOne({'name': newTalent.name, lastName: newTalent.lastName}).populate('user', 'displayName').exec(function(err, talent) {

					if(talent !== null){
						++updatedTalents;
						newTalent = newTalent.toObject();
						talent = _.extend(talent, newTalent);
					} else {
						++newTalents;
						talent = newTalent;
					}

					talent.save(function(err) {

			   			talentCallback();

			   		});

				});

			} else {
				failedImports.push({name: newTalent.name + ' ' + newTalent.lastName, reason: failedReason});
				talentCallback();
			}

	   	}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp({status: 'success', updatedTalents: updatedTalents, newTalents: newTalents, failed: failedImports});
			}
	   	});
	});

	//read from file
	fileStream.pipe(converter);

};

// gather spreadsheet from Google
exports.processGoogleSheet = function(req, res){

	// add code lateer

};

// list stored new projects
exports.listNewprojects = function(req, res) {
	Newproject.find().sort('-created').exec(function(err, newprojects) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(newprojects);
		}
	});
};
exports.newprojectByID = function(req, res, next) {
	Newproject.findById(req.body.id).exec(function(err, newproject) {
		if (err) return next(err);
		if (! newproject) return next(new Error('Failed to load Newproject ' + req.body.id));
		res.jsonp(newproject);
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
