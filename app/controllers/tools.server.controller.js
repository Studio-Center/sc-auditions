'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	Newproject = mongoose.model('Newproject'),
	fs = require('fs'),
	config = require('../../config/config'),
	async = require('async'),
	radash = require('radash'),
	sgMail = require('@sendgrid/mail'),
	dateFormat = require('dateformat');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

/* custom tools methods */
exports.sendTalentEmails = function(req, res){
	let email = req.body.email,
		emailClients = req.body.emailClients,
		log = {};

	// email all talents if email all is set to true
	if(email.all === true){

		Talent.find({'type':'Email'}).sort({'locationISDN': 1,'lastName': 1,'-created': -1}).then(function (talents) {

				async.waterfall([
					function(done) {

						// generate email signature
						let emailSig = '';
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

							let curTalent = talent;

							// check for talent preferred contact
							let idx = curTalent.type.indexOf('Email');
							if (idx > -1){

								// add both email addresses if talent has backup
								let talentEmails = [];
								talentEmails[0] = curTalent.email;
								if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
									talentEmails[1] = curTalent.email2;
								}

								// send email
								// clear dup emails
								talentEmails = talentEmails.map(v => v.toLowerCase());
								talentEmails = radash.unique(talentEmails);
								talentEmails = radash.diff(talentEmails, [req.user.email]);

								let mailOptions = {
													to: talentEmails,
													from: req.user.email || config.mailer.from,
													cc: config.mailer.notifications,
													subject: email.subject,
													html: talentEmailHTML
												};
								
								sgMail
								.send(mailOptions)
								.then(() => {

									// write change to log
									let log = {
										type: 'talent',
										sharedKey: String(talent._id),
										description: talent.name + ' ' + talent.lastName + ' sent custom email ',
										user: req.user
									};
									log = new Log(log);
									log.save();

									callback(null);
								}, error => {
									callback(error);
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

		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	// email only selected clients
	} else {

		Talent.where('_id').in(emailClients).sort({'locationISDN': 1,'lastName': 1,'-created': -1}).then(function (talents) {

				async.waterfall([
					function(done) {

						// generate email signature
						let emailSig = '';
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

								let curTalent = talent;

								// check for talent preferred contact
								if(curTalent.type.toLowerCase() === 'email'){

									// add both email addresses if talent has backup
									let talentEmails = [];
									talentEmails[0] = curTalent.email;
									if(typeof curTalent.email2 !== 'undefined' && curTalent.email2.length > 0){
										talentEmails[1] = curTalent.email2;
									}

									// send email
									// clear dup emails
									talentEmails = talentEmails.map(v => v.toLowerCase());
									talentEmails = radash.unique(talentEmails);
									talentEmails = radash.diff(talentEmails, [req.user.email]);

									let mailOptions = {
														to: talentEmails,
														from: req.user.email || config.mailer.from,
														cc: config.mailer.notifications,
														subject: email.subject,
														html: talentEmailHTML
													};
									
									sgMail
									.send(mailOptions)
									.then(() => {
										callback(null);
									}, error => {
										callback(error);
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

		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	}

};

// call list methods
var gatherTalentsSearch = function(req, res, filter){

	let callTalents = [], talentId;
	let searchCriteria = {'talent': {
									$elemMatch: {
										'status': filter
									}
								},
						'status': { $nin: [
							'Closed - Pending Client Decision',
							'Canceled',
							'Dead',
							'Complete',
							'Booked',
							'ReAuditioned',
							'On Hold',
							'Not started'
							]}
						};

	Project.find(searchCriteria).sort('-estimatedCompletionDate').then(function (projects) {

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
									Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
										done(null, talentInfo);
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

											let talents = project.talent,
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
					res.jsonp(callTalents);
				}
           	});

	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
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
	let emailCnt = 0,
		currentTime = new Date();
	//currentTime.setDate(currentTime.getHours() - 1);
	let inHalfHour = new Date();
	// modified 12/17/2015 for two hour intervals
	inHalfHour.setHours(inHalfHour.getHours() + 0.6);

	let searchCriteria = {
							'estimatedCompletionDate':
                                {
                                    $gte: currentTime,
                                    $lte: inHalfHour
                                },
							'preClose': false,
                            'client': {$size: 0}
						};

	// gather projects ending in the next hour
	Project.find(searchCriteria).sort('-estimatedCompletionDate').then(function (projects) {
        
        // walk through all associated projects
		async.eachSeries(projects, function (project, callback) {

			// gather associated emails per project
			async.waterfall([
				// gather owner data
				function(done) {
					let ownerId;
					if(!project.owner){
						ownerId = project.user;
					} else{
						ownerId = project.owner;
					}

					User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
						done(null, owner);
					});
				},
				function(owner, done){

					// generate email signature
					let newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours() - 1);
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					let emailSig = '';
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
						done(err, owner, summaryEmailHTML);
					});

				},
				// send out project email
				function(owner, summaryEmailHTML, done) {
					let log,
						emailSubject = project.title + ' is due in 30 minutes and still needs a client added',
						mailOptions = {
							to: owner.email,
							cc: [config.mailer.notifications],
							from: owner.email || config.mailer.from,
							subject: emailSubject,
							html: summaryEmailHTML
						};

					sgMail
					.send(mailOptions)
					.then(() => {
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
						done();
					}, error => {
						done(error);
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
	let emailCnt = 0,
		currentTime = new Date();
	//currentTime.setDate(currentTime.getHours() - 1);
	let inOneHour = new Date();
	// modified 12/17/2015 for two hour intervals
	inOneHour.setHours(inOneHour.getHours() + 2);

	let searchCriteria = {
							'estimatedCompletionDate':
													{
														$gte: currentTime,
														$lte: inOneHour
													},
							'preClose': false
						};

	// gather projects ending in the next hour
	Project.find(searchCriteria).sort('-estimatedCompletionDate').then(function (projects) {

		// walk through all associated projects
		async.eachSeries(projects, function (project, callback) {

			// gather associated emails per project
			async.waterfall([
				// gather owner data
				function(done) {
					let ownerId;
					if(!project.owner){
						ownerId = project.user;
					} else{
						ownerId = project.owner;
					}

					User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
						done(null, owner);
					});
				},
				// gather talent info
				function(owner, done){

					// walk through all current talents assigned to project then query talent data
					let talentIds = [];
					for(var i = 0; i < project.talent.length; ++i){
						talentIds[i] = project.talent[i].talentId;
					}

					Talent.where('_id').in(talentIds).sort('-created').then(function (talents) {
						done(null, talents, owner);
					});

				},
				// filter selected talents
				function(talents, owner, done){
					let shortTblHeader = '<table><tr><th>First Name</th><th>Last Name</th></tr>',
						longTblHeader = '<table><tr><th>Name</th><th>Parent Name</th><th>Phone #</th><th>Alt Phone #</th><th>Location</th><th>Email</th></tr>',
						talentPosted = '<p>Talent Posted:</p>' + shortTblHeader,
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

							done(err, talentPosted, talentNotCalled, talentNotPosted, talentOut, owner);
						}
			       	});
				},
				function(talentPosted, talentNotCalled, talentNotPosted, talentOut, owner, done){

					// generate email signature
					let newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours() - 1);
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					let emailSig = '';
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
						done(err, owner, summaryEmailHTML);
					});

				},
				// send out talent project creation email
				function(owner, summaryEmailHTML, done) {
					let log;
					// send email
					// generate email signature
					let newDate = new Date(project.estimatedCompletionDate);
					newDate = newDate.setHours(newDate.getHours());
					newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

					let emailSubject = project.title + ' - Pre-Close Summary (Due in 2 hrs)' + ' - Due ' + newDate + ' EST',
						mailOptions = {
							to: owner.email,
							cc: [config.mailer.notifications],
							from: owner.email || config.mailer.from,
							subject: emailSubject,
							html: summaryEmailHTML
						};

					sgMail
					.send(mailOptions)
					.then(() => {
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
						done();
					}, error => {
						done(error);
					});

				},
				// update project to prevent resending of email
				function(done){

					Project.findById(project._id).then(function (project) {
						req.project = project ;

						// update preclose status
						project.preClose = true;

						project = Object.assign(req.project, project);

						project.save().then(function () {
							done(null);
						}).catch(function (err) {
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
	let newTalents = 0,
		updatedTalents = 0,
		failedImports = [];

	// parse uploaded CSV
	let file = req.files.file,
		tempPath = file.path;

	let Converter = require('csvtojson').Converter,
		fileStream = fs.createReadStream(tempPath),
		converter = new Converter({constructResult:true});

	//end_parsed will be emitted once parsing finished
	converter.on('end_parsed', function (jsonObj) {

	   async.eachSeries(jsonObj, function (talent, talentCallback) {

	   		let unionStatus = (talent.US === '' ? '' : (talent.US === 'U' ? ['union'] : ['union','non-union']));

	   		// cerate new talent
	   		let talentData = {
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
				},
				newTalent = new Talent(talentData);

			talent.user = req.user;

			// check for missing import data
			let failed = 0,
				failedReason = {
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
				Talent.findOne({'name': newTalent.name, lastName: newTalent.lastName}).then(function (talent) {

					if(talent !== null){
						++updatedTalents;
						newTalent = newTalent.toObject();
						talent = Object.assign(talent, newTalent);
					} else {
						++newTalents;
						talent = newTalent;
					}

					talent.save().then(function () {

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
	Newproject.find().sort('-created').then(function (newprojects) {
		res.jsonp(newprojects);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};
exports.newprojectByID = function(req, res, next) {
	Newproject.findById(req.body.id).then(function (newproject) {
		if (! newproject) return next(new Error('Failed to load Newproject ' + req.body.id));
		res.jsonp(newproject);
	}).catch(function (err) {
		return next(err);
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
