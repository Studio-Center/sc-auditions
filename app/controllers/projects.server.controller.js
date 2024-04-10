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
	Typecast = mongoose.model('Typecast'),
	Log = mongoose.model('Log'),
	Newproject = mongoose.model('Newproject'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	config = require('../../config/config'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	unzip = require('unzip-wrapper'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	archiver = require('archiver'),
	dateFormat = require('dateformat'),
	sanitize = require("sanitize-filename"),
	// set date and timezone
	moment = require('moment-timezone');

exports.sendEmail = function(req, res){

	// ensure email body is not blank
	if(typeof req.body.email !== 'undefined'){

		// gather admin and producers emails to include in send
		async.waterfall([
			function(done) {
				User.find({'roles':'admin','noemail':{ $ne: true }}).sort('-created').then(function (admins) {
					done(null, admins);
				});
			},
			function(admins, done) {
				User.find({'roles':{ $in: ['producer/auditions director', 'auditions director', 'audio intern']},'noemail':{ $ne: true }}).sort('-created').then(function (directors) {
					done(null, admins, directors);
				});
			},
			function(admins, directors, done) {
				User.find({'roles':'production coordinator','noemail':{ $ne: true }}).sort('-created').then(function (coordinators) {
					done(null, admins, directors, coordinators);
				});
			},
			function(admins, directors, coordinators, done) {
				User.find({'roles':'talent director','noemail':{ $ne: true }}).sort('-created').then(function (talentdirectors) {
					done(null, admins, directors, coordinators, talentdirectors);
				});
			},
			function(admins, directors, coordinators, talentdirectors, done) {
				var email = req.body.email;

				// add previously queried roles to email list
				var i, bcc = [];
				for(i = 0; i < admins.length; ++i){
					bcc.push(admins[i].email);
				}
				for(i = 0; i < directors.length; ++i){
					bcc.push(directors[i].email);
				}
				for(i = 0; i < coordinators.length; ++i){
					bcc.push(coordinators[i].email);
				}
				for(i = 0; i < talentdirectors.length; ++i){
					bcc.push(talentdirectors[i].email);
				}

				// // append default footer to email
				// email.message += '<br>' + 'The ' + config.app.title + ' Support Team' + '<br>';
				// email.message += '<br>' + 'To view your StudioCenterAuditions.com Home Page, visit:' + '<br>';
				// email.message += 'http://' + req.headers.host + '<br>';

				done('', email, bcc);
			},
			function(email, bcc, done) {
				res.render('templates/email-message', {
					email: email
				}, function(err, emailHTML) {
					done(err, emailHTML, email, bcc);
				});
			},
			function(emailHTML, email, bcc, done) {
				// send email
				var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
				var mailOptions = {
				    to: email.to,
				    cc: config.mailer.notifications,
				    bcc: bcc,
				    from: config.mailer.from,
				    subject: email.subject,
				    html: emailHTML
				};

				transporter.sendMail(mailOptions , function(err) {
					done(err);
				});
			},
			], function(err) {
				if (err) {
					return res.status(400).json(err);
				} else {
					res.status(200).jsonp();
				}
		});

	}
};

var emailTalent = function(selTalent, talentInfo, email, project, req, res, subjectAd){

	async.waterfall([
		function(done) {
			var ownerId = project.owner || project.user._id;
			User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
				owner = owner || req.user;
				done(null, owner);
			}).catch(function (err) {
				done(err, req.user);
			});
		},
		function(owner, done) {

			var emailTmpl = 'templates/projects/new-project-talent-email';
			// load language specific email templates
			if(talentInfo.prefLanguage === 'Spanish'){
				emailTmpl = 'templates/projects/new-project-talent-email-spanish';
			}

			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');
			var part = '';

			// generate email signature
			var emailSig = '';
			if(owner.emailSignature){
				emailSig = owner.emailSignature;
			} else {
				emailSig = '';
			}

			// assign part text
			if(typeof selTalent.part !== 'undefined'){
				if(talentInfo.prefLanguage !== 'Spanish'){
					if(selTalent.part !== ''){
						part = '<p>You are cast for the part of ' + selTalent.part + '</p>';
					}
				} else {
					if(selTalent.part !== ''){
						part = '<p>Usted está echado para el papel de ' + selTalent.part + '</p>';
					}
				}
			}

			// add requested text if needed
			var requestedTxt = '';
			if(selTalent.requested === true){
				requestedTxt = 'REQUESTED ';
			}

			res.render(emailTmpl, {
				email: email,
				emailSignature: emailSig,
				dueDate: newDate,
				part: part,
				requestedTxt: requestedTxt
			}, function(err, talentEmailHTML) {
				done(err, talentEmailHTML, owner);
			});

		},
		// send out talent project creation email
		function(talentEmailHTML, owner, done) {
			// send email
			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options)),
                emailSubject = '',
                newDate = new Date(project.estimatedCompletionDate),
                nameArr = [],
                talentEmails = [talentInfo.email];

			// set vars
			newDate = newDate.setHours(newDate.getHours() - 1);
			nameArr = talentInfo.name.split(' ');
			// add second email contact is available
			if(typeof talentInfo.email2 !== 'undefined'){
				talentEmails.push(talentInfo.email2);
			}

			// assign email subject line
			if(selTalent.requested === true){
				emailSubject = nameArr[0] + ' has a REQUESTED Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
			} else {
				emailSubject = nameArr[0] + ' has an Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
			}
			if(typeof subjectAd !== 'undefined'){
				emailSubject = 'NEW ' + subjectAd + ' FILE ' + emailSubject;
			}

			var mailOptions = {
				to: talentEmails,
				from: owner.email || config.mailer.from,
				replyTo: owner.email || config.mailer.from,
				subject: emailSubject,
				html: talentEmailHTML
			};

			transporter.sendMail(mailOptions, function(err){

				// write change to log
				var log = {
					type: 'talent',
					sharedKey: selTalent.talentId,
					description: 'sent new project email to talent ' + selTalent.name + ' for ' + project.title,
					user: req.user
				};
				log = new Log(log);
				log.save();

				done(err);
			});
		},
		], function(err) {
		//return res.status(400).json(err);
	});

};

var sendTalentEmail = function(req, res, project, talent, override){

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
                done(null, talentInfo);
			}).catch(function (err) {
				done(err, null);
			});
		},
		// generate email body
		function(talentInfo, done) {
			var email =  {
                            projectId: '',
                            to: [],
                            bcc: [],
                            subject: '',
                            header: '',
                            footer: '',
                            scripts: '',
                            referenceFiles: ''
                        };
			if(talentInfo.type.toLowerCase() === 'email' || override === true){
				var i;

				// add scripts and assets to email body
				email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
				if(typeof project.scripts !== 'undefined'){
					if(project.scripts.length > 0){
						for(i = 0; i < project.scripts.length; ++i){
							email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
						}
					} else {
						email.scripts += 'None';
					}
				} else {
					email.scripts += 'None';
				}
				email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
				if(typeof project.referenceFiles !== 'undefined'){
					if(project.referenceFiles.length > 0){
						for(var j = 0; j < project.referenceFiles.length; ++j){
							email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
						}
					} else {
						email.referenceFiles += 'None';
					}
				} else {
					email.referenceFiles += 'None';
				}
			}

			done('', email, talentInfo);
		},
		// update talent email status
		function(email, talentInfo, done){

			// update talent email status
			for(var i = 0; i < project.talent.length; ++i){
				if(project.talent[i].talentId === talent.talentId){
					if(talentInfo.type.toLowerCase() === 'email' || override === true){
						project.talent[i].status = 'Emailed';
					}
					done('', email, talentInfo);
				}
			}

		},
		// email selected talent
		function(email, talentInfo, done){
			// only send email to talent if that is the preferred contact method
			if(talentInfo.type.toLowerCase() === 'email' || override === true){
				emailTalent(talent, talentInfo, email, project, req, res);
			}

			var newProject = project;

			// write change to log
			if(typeof project.log !== 'undefined'){
				var log = project.log;
				log.user = req.user;

				log = new Log(log);
				log.save();

				// also send log for project if talent log attribute
				if(log.type === 'talent'){
					log = log.toObject();
					delete log._id;

					log.type = 'project';
					log.sharedKey = String(project._id);

					log = new Log(log);
					log.save();
				}
			}

			Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

				project = _.extend(project, newProject);

				req.project = project;

				project.save().then(function () {
					res.status(200).json(project);
				}).catch(function (err) {
					done(err);
				});

			});


		}
		], function(err) {
		if (err) {
			if (err) {
				return res.status(400).json(err);
			} else {
				return res.status(200);
			}
		}
	});

};

exports.sendTalentCanceledEmail = function(req, res){

	var project;
	var projectId = req.body.projectId;
	var talents = req.body.talents;
	var override = req.body.override || false;

	// reload project
	Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

		// walk through and email all selected clients
		async.eachSeries(talents, function (selTalent, callback) {

			Talent.findOne({'_id':selTalent.talentId}).sort('-created').then(function (talentInfo) {

				// check for null talent return
				if(talentInfo !== null){

					// filter based on current talent status
					if((talentInfo.type.toLowerCase() === 'email' || override === true) && selTalent.status.toLowerCase() === 'emailed'){

						async.waterfall([
							// update talent email status
							function(done){

								// update talent email status
								for(var i = 0; i < project.talent.length; ++i){
									if(project.talent[i].talentId === selTalent.talentId){

										project.talent[i].status = 'Canceled';

										done('');
									}
								}

							},
							function(done) {
								var ownerId = project.owner || project.user._id;
								User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
									owner = owner || req.user;
									done(null, owner);
								}).catch(function (err) {
									done(err, req.user);
								});
							},
							function(owner, done) {

								var newDate = new Date(project.estimatedCompletionDate);
								newDate = newDate.setHours(newDate.getHours() - 1);
								newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');
								var part = '';

								// generate email signature
								var emailSig = '';
								if(owner.emailSignature){
									emailSig = owner.emailSignature;
								} else {
									emailSig = '';
								}

								res.render('templates/cancelled-project-email', {
									emailSignature: emailSig,
									talent: talentInfo,
									project: project
								}, function(err, talentEmailHTML) {
									done(err, talentEmailHTML, owner);
								});

							},
							// send out talent project creation email
							function(talentEmailHTML, owner, done) {
								// send email
								var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
								var emailSubject = '';
								var newDate = new Date(project.estimatedCompletionDate);
								newDate = newDate.setHours(newDate.getHours() - 1);
								var nameArr = [];

								nameArr = talentInfo.name.split(' ');

								// assign email subject line
								emailSubject = 'The Audition Project ' + project.title + ' Has Been Cancelled';

								var mailOptions = {
									to: talentInfo.email,
									from: owner.email || config.mailer.from,
									replyTo: owner.email || config.mailer.from,
									cc: config.mailer.notifications,
									subject: emailSubject,
									html: talentEmailHTML
								};

								transporter.sendMail(mailOptions, function(err){

									// write change to log
									var log = {
										type: 'talent',
										sharedKey: selTalent.talentId,
										description: 'sent cancelled email for ' + project.title,
										user: req.user
									};
									log = new Log(log);
									log.save();

									done(err);
								});

							}
							], function(err) {
								callback(err);
						});

					} else {
						callback();
					}

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
				// save on finish, no error
				res.jsonp(project);

			}
       	});

	});

};

// send project assigned talent new emails if projects gets new scripts
exports.sendTalentScriptUpdateEmail = function(req, res){

	// pause execution for project save
	setTimeout(function() {

	var project, i;
	var projectId = req.body.projectId;
	var talents = req.body.talents;
	var chgMade = req.body.chgMade;

	// reload project
	Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

		var email =  {
							projectId: '',
							to: [],
							bcc: [],
							subject: '',
							header: '',
							footer: '',
							scripts: '',
							referenceFiles: ''
						};

		// add scripts and assets to email body
		email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
		if(typeof project.scripts !== 'undefined'){
			if(project.scripts.length > 0){
				for(i = 0; i < project.scripts.length; ++i){
					email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
				}
			} else {
				email.scripts += 'None';
			}
		} else {
			email.scripts += 'None';
		}
		email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
		if(typeof project.referenceFiles !== 'undefined'){
			if(project.referenceFiles.length > 0){
				for(var j = 0; j < project.referenceFiles.length; ++j){
					email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
				}
			} else {
				email.referenceFiles += 'None';
			}
		} else {
			email.referenceFiles += 'None';
		}

		// walk through and email all selected clients
		async.eachSeries(talents, function (selTalent, callback) {

			Talent.findOne({'_id':selTalent.talentId}).sort('-created').then(function (talentInfo) {

				// check for null talent return
				if(talentInfo !== null){

					// filter based on current talent status
					if(talentInfo.type.toLowerCase() === 'email'){

						emailTalent(selTalent, talentInfo, email, project, req, res, chgMade);

						callback();

					} else {
						callback();
					}

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
				res.status(200).jsonp();
			}

   	});

	});

	}, 3500);
};

// gather project data
exports.getproject = function(req, res){

	Project.findById(req.body.id).then(function (project) {
		project.populate('user', 'displayName');
		res.status(200).jsonp(project);
	}).catch(function (err) {
		return res.status(400).json(err);
	});

};

// send talent project start email
exports.sendTalentEmail = function(req, res){

	var project = req.body.project;
	var talent = req.body.talent;
	var override = req.body.override || false;

	sendTalentEmail(req, res, project, talent, override);

};

// send talent director talent add email
exports.sendTalentDirectorsEmail = function(req, res){

	var project, i;
	var projectId = req.body.projectId;
	var talent = req.body.talent;
	var chgMade = req.body.chgMade;

	// reload project
	Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

		// walk through and email all selected clients
		async.waterfall([
		function(done) {
			var ownerId = project.owner || project.user._id;
			User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
				owner = owner || req.user;
				done(null, owner);
			}).catch(function (err) {
				done(err, req.user);
			});
		},
		function(owner, done) {
			User.find({'roles':'talent director'}).sort('-created').then(function (talentdirectors) {
				done(null, owner, talentdirectors);
			});
		},
		function(owner, talentdirectors, done) {

			var i = 0,
				to = [];

			for(i = 0; i < talentdirectors.length; ++i){
				to.push(talentdirectors[i].email);
			}

			res.render('templates/added-talent-email', {
				project: project
			}, function(err, talentEmailHTML) {
				done(err, owner, to, talentEmailHTML);
			});

		},
		// send out talent project creation email
		function(owner, to, talentEmailHTML, done) {
			// send email
			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
			var emailSubject = '';
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);

			// assign email subject line
			emailSubject = project.title + ' - Additional Talent Added';

			if(to.length > 0){
				var mailOptions = {
					to: to,
					from: owner.email || config.mailer.from,
					replyTo: owner.email || config.mailer.from,
					cc: config.mailer.notifications,
					subject: emailSubject,
					html: talentEmailHTML
				};
	
				transporter.sendMail(mailOptions, function(err){
	
					// write change to log
					var log = {
						type: 'project',
						sharedKey: project._id,
						description: 'sent talent added email for ' + project.title,
						user: req.user
					};
					log = new Log(log);
					log.save();
	
					done(err);
				});
			} else {
				done();
			}
			
		}
		], function(err) {
			if (err) {
				if (err) {
					return res.status(400).json(err);
				} else {
					return res.status(200);
				}
			}
		});

	});

};

exports.sendTalentEmailById = function(req, res){

	var projectId = req.body.projectId;
	var talent = req.body.talent;
	var override = req.body.override || false;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
				done(null, project);
			}).catch(function (err) {
				done(err, null);
			});
		},
		function(project, done) {
			project = project.toObject();
			sendTalentEmail(req, res, project, talent, override);
		}
		], function(err) {
		if (err) {
			return res.status(400).json(err);
		} else {
			return res.status(200);
		}
	});

};

// update single talent single project status
exports.updateSingleTalentStatus = function (req, res){

	var projectId = req.body.projectId;
	var talentId = req.body.talentId;
	var talentStatus = req.body.talentStatus;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
				done(null, project);
			}).catch(function (err) {
				done(err, null);
			});
		},
		// update talent email status
		function(project, done){

			// update talent email status
			for(var i = 0; i < project.talent.length; ++i){
				if(project.talent[i].talentId === talentId){
					project.talent[i].status = talentStatus;

					// write change to log
					var log = {
						type: 'talent',
						sharedKey: talentId,
						description: project.title + ' status updated to ' + project.talent[i].status,
						user: req.user
					};
					log = new Log(log);
					log.save();

					done('', project);
				}
			}

		},
		// email selected talent
		function(project, done){

            project.markModified('talent');
            project.markModified('modified');

			var newProject = project.toObject();

			Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

				project = _.extend(project, newProject);

				req.project = project;

				project.save().then(function () {
				}).catch(function (err) {
					done(err);
				});

			});

		}
		], function(err) {
		if (err) {
			return res.status(400).json(err);
		} else {

			return res.status(200);
		}
	});
};

// update talent status
exports.updateTalentStatus = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (_.intersection(req.user.roles, allowedRoles).length) {

		var project = req.body.project;

        if (project._id.match(/^[0-9a-fA-F]{24}$/)) {
            Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

                project = _.extend(project, req.body.project);

                req.project = project ;

                project.markModified('talent');
                project.markModified('modified');

                project.save().then(function () {
					res.status(200);
				}).catch(function (err) {
					return res.status(400).json(err);
                });

            });
        }

	}

};

// update talent note
exports.updateTalentNote = function (req, res){

	var projectId = req.body.projectId;
	var talentId = req.body.talentId;
	var newNote = req.body.note;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
				done(null, project);
			}).catch(function (err) {
				done(err, null);
			});
		},
		// update talent email status
		function(project, done){

			// update talent email status
			for(var i = 0; i < project.talent.length; ++i){
				if(project.talent[i].talentId === talentId){
					project.talent[i].note = newNote;
					done('', project);
				}
			}

		},
		// email selected talent
		function(project, done){

			var newProject = project.toObject();

			Project.findById(project._id).then(function (projects) {
				project.populate('user', 'displayName');

				project = _.extend(project, newProject);

                project.markModified('talent');
                project.markModified('modified');

				req.project = project;

				project.save().then(function () {
				}).catch(function (err) {
					done(err);
				});

			});

		}
		], function(err) {
		if (err) {
			return res.status(400).json(err);
		} else {

			return res.status(200);
		}
	});

};

// update talent status
exports.updateNoRefresh = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'],
      	log = '',
		project = '';

    if(typeof req.body.project != 'undefined' && typeof req.body.project._id  != 'undefined'){
	// validate user interaction
        if (_.intersection(req.user.roles, allowedRoles).length && typeof req.body.project != 'undefined' && typeof req.body.project._id != 'undefined') {

            // write change to log
            if (req.body.project._id.match(/^[0-9a-fA-F]{24}$/)) {
                if(typeof req.body.project.log !== 'undefined'){
                    log = req.body.project.log;
                    log.user = req.user;

                    log = new Log(log);
                    log.save();

                    // also send log for project if talent log attribute
                    if(log.type === 'talent'){
                        log = log.toObject();
						delete log._id;

                        log.type = 'project';
                        log.sharedKey = String(req.body.project._id);

                        log = new Log(log);
                        log.save();

                    }
                }

                //project = req.body.project;

                Project.findById(req.body.project._id).then(function (project) {
					project.populate('user', 'displayName');

                    // if(typeof req.body.project.__v !== 'undefined'){
                    // 	delete req.body.project.__v;
                    // }

                    //delete project.__v;
                    //delete req.body.project.__v;

                    project = _.extend(project, req.body.project);

					if(project){
						project.markModified('talent');
						project.markModified('modified');

						req.project = project;

						//delete project.__v;

						project.save().then(function () {
							res.jsonp(project);
						}).catch(function (err) {
							log = {
								type: 'error',
								sharedKey: String(project._id),
								description: String(err) + ' Project ID: ' + String(project._id),
								user: req.user
							};
							log = new Log(log);
							log.save();

							return res.status(400).json(err);
						});
					}
                });
            }
        }
    }

};

// convert number to word
var a = ['','First ','Second ','Third ','Fourth ', 'Fifth ','Sixth ','Seventh ','Eighth ','Ninth ','Tenth ','Eleventh ','Twelfth ','Thirteenth ','Fourteenth ','Fifteenth ','Sixteenth ','Seventeenth ','Eighteenth ','Nineteenth '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    // str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) : '';
    // str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) : '';
    // str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]])  : '';
    // str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
    str += a[n[5][1]];
    return str;
}

// send client email based on user button click
exports.sendClientEmail = function(req, res){

	// determine email type
	var template;
	var type = req.body.type;
	var emlCnt = req.body.count;

	switch(type){
		case 'opening':
			template = 'templates/projects/create-project-client-email';
		break;
		case 'carryover':
			template = 'templates/projects/carryover-email';
		break;
		case 'closing':
			template = 'templates/projects/closing-email';
		break;
	}


	// gather clients ids
	var clientIds = [];
	for(var i = 0; i < req.body.clients.length; ++i){
		if(typeof req.body.clients[i] !== 'undefined' && req.body.clients[i] !== null && req.body.clients[i] !== false){
			clientIds.push(req.body.clients[i]);
		}
	}

	// query required data then email clients
	User.where('_id').in(clientIds).sort('-created').then(function (foundClients) {

		// walk through and email all selected clients
		async.eachSeries(foundClients, function (foundClient, callback) {

			// wrap in anonymous function to preserve client values per iteration
			var curClient = foundClient;

			var client = {name: curClient.displayName};

			async.waterfall([
				function(done) {
					var ownerId = req.body.project.owner || req.body.project.user._id;
					User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
						done(null, owner);
					}).catch(function (err) {
						done(err, '');
					});
				},
				function(owner, done) {
					User.find({'roles':{ $in: ['producer/auditions director', 'auditions director', 'audio intern']}}).sort('-created').then(function (directors) {
						done(null, owner, directors);
					});
				},
				function(owner, directors, done) {

					var emailSig = '';
					if(owner.emailSignature){
						emailSig = owner.emailSignature;
					} else if(req.user.emailSignature){
						emailSig = req.user.emailSignature;
					} else {
						emailSig = '';
					}

					res.render(template, {
						emailSignature: emailSig,
						project: req.body.project,
						client: client,
						clientInfo: curClient,
						audURL: 'http://' + req.headers.host + '/#!/signin',
						dueDate: dateFormat(req.body.project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT'),
						dueDateDay: dateFormat(req.body.project.estimatedCompletionDate, 'dddd')
					}, function(err, clientEmailHTML) {
						done(err, clientEmailHTML, owner, directors);
					});

				},
				function(clientEmailHTML, owner, directors, done){

					var bccList = [];
					for(i = 0; i < directors.length; ++i){
						if(req.user.email !== directors[i].email && owner.email !== directors[i].email) {
							bccList.push(directors[i].email);
						}
					}
					// inject user and owner into bcc list
					bccList.push(req.user.email);
					bccList.push(owner.email);

					var emailSubject;

					switch(type){
						case 'opening':
							emailSubject = 'Your audition project: ' + req.body.project.title + ' Due ' + dateFormat(req.body.project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
						break;
						case 'carryover':
							emailSubject = 'Your '+inWords(emlCnt)+' Batch of ' + req.body.project.title + '  Auditions - Studio Center';
						break;
						case 'closing':
							emailSubject = 'Your Audition Project ' + req.body.project.title + ' is Complete';
						break;
					}

					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var mailOptions = {
										to: curClient.email,
										from: owner.email || req.user.email || config.mailer.from,
										replyTo: owner.email || req.user.email || config.mailer.from,
										cc: config.mailer.notifications,
										bcc: bccList || config.mailer.from,
										subject: emailSubject,
										html: clientEmailHTML
									};

					transporter.sendMail(mailOptions, function(err){
						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(req.body.project._id),
							description: 'client ' + curClient.displayName + ' sent ' + type + ' email ' + req.body.project.title,
							user: req.user
						};
						log = new Log(log);
						log.save();

						done(err);
					});
				}
				], function(err) {
				callback(err);
			});
		}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.status(200).send();
			}
       	});

	});

};

// send emails from lead form
exports.lead = function(req, res){

	// if honey pot empty perform mailer, if not pretend was success anyway
	if(req.body.acomment.length == 0 && typeof req.user !== 'undefined'){

		// build email
		var emailBody = 'First Name: ' + req.body.firstName + '\n';
			emailBody += 'Last Name: ' + req.body.lastName + '\n';
			emailBody += 'Company: ' + req.body.company + '\n';
			emailBody += 'Phone: ' + req.body.phone + '\n';
			emailBody += 'Email: ' + req.body.email + '\n';
			emailBody += 'Description: ' + req.body.describe + '\n';

		//var file = req.files.file;
	var appDir = global.appRoot;

	var relativePath =  'res' + '/' + 'scripts' + '/temp/';
	var newPath = appDir + '/public/' + relativePath;

		var attachements = [];

		for(var i = 0; i < req.body.scripts.length; ++i){
			attachements[i] = {
				filename: req.body.scripts[i].file.name,
				path: newPath + req.body.scripts[i].file.name
			};
		}

		// send email
		var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
		transporter.sendMail({
			from: config.mailer.from,
			to: 'scripts@studiocenter.com, william@studiocenter.com',
			cc: config.mailer.notifications,
			subject: 'Start a new Audition Project Form Submission',
			text: emailBody,
			attachments: attachements
		});

		var uid = 'N/A';
		if(typeof req.user !== 'undefined'){
			uid = req.user._id;
		}

		// build submission object
		var sub = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			company: req.body.company,
			phone: req.body.phone,
			email: req.body.email,
			describe: req.body.describe
		};

		// save submission to db for later retrieval
		var newproject = {
			project: emailBody,
			sub: sub,
			attachements: req.body.scripts
		};
		newproject = new Newproject(newproject);
		newproject.save();

		// write change to log
		var log = {
			type: 'system',
			sharedKey: uid,
			description: 'new project lead submitted by ' + req.body.firstName + ' ' + req.body.lastName,
			user: req.user
		};
		log = new Log(log);
		log.save();

	}

	return res.status(200).send();
};

var emailClients = function(client, email, project, req, res){
		async.waterfall([
			function(done) {
				User.findOne({'_id':client.userId}).sort('-created').then(function (clientInfo) {
					done(null, clientInfo);
				});
			},
			function(clientInfo, done) {
				var emailSig = '';
				if(req.user.emailSignature){
					emailSig = req.user.emailSignature;
				} else {
					emailSig = '';
				}
				res.render('templates/projects/create-project-client-email', {
					email: email,
					emailSignature: emailSig,
					project: project,
					client: client,
					clientInfo: clientInfo,
					audURL: 'http://' + req.headers.host + '/#!/signin',
					dueDate: dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT')
				}, function(err, clientEmailHTML) {
					done(err, clientInfo, clientEmailHTML);
				});
			},
			function(clientInfo, clientEmailHTML, done){

				var emailSubject = 'Your audition project:  ' + project.title + ' Due ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

				// send email
				var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

				var mailOptions = {
									to: client.email,
									from: req.user.email || config.mailer.from,
									replyTo: req.user.email || config.mailer.from,
									cc: config.mailer.notifications,
									subject: emailSubject,
									html: clientEmailHTML
								};

				transporter.sendMail(mailOptions);

				// write change to log
				var log = {
					type: 'project',
					sharedKey: String(project._id),
					description: 'client ' + clientInfo.displayName + ' sent project created email ' + project.title,
					user: req.user
				};
				log = new Log(log);
				log.save();

			}
		], function(err) {
			if (err) {
				return res.status(400).json(err);
			} else {
				res.status(200).jsonp();
			}
		});
};

var moveFile = function(tempPath, newPath){
	mv(tempPath, newPath, function(err) {
        //console.log(err);
        // if (err){
        //     res.status(500).end();
        // }else{
        //     res.status(200).end();
        // }
    });
};

/**
 * Create a Project
 */
exports.create = function(req, res) {
	
	// remove project id definition if defined
	var oldID = '';
	if(typeof req.body.project != 'undefined'){
		oldID = req.body.project._id;
		delete req.body.project._id;
	}
	// method vars
	var i, j;
	var project = new Project(req.body.project),
		copiedScripts = req.body.copiedScripts,
		copiedReferenceFiles = req.body.copiedReferenceFiles;
	project.user = req.user;

	var appDir = '';
	var tempPath = '';
	var relativePath =  '';
	var newPath = '';

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern','production coordinator'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		// save final project
		project.save().then(function (project) {

			// perform before save routines
			if(req.body.notifyClient === true){
				// create new project note stating client notified
				var discussionTxt = 'Client Notified of Project Start by ' + req.user.displayName;
				var item = {date: moment().tz('America/New_York').format(), userid: '', username: 'system', item: discussionTxt, deleted: false};

				project.discussion.push(item);
			}

			// move new saved files from temp to project id based directory
			if(typeof project.scripts !== 'undefined'){
				for(i = 0; i < project.scripts.length; ++i){
					if(typeof project.scripts[i] !== 'undefined'){
						appDir = global.appRoot;
						tempPath = appDir + '/public/res/scripts/temp/' + project.scripts[i].file.name;
						relativePath =  'res/scripts/' + project._id + '/';
						newPath = appDir + '/public/' + relativePath;

						// create project directory if not found
						if (!fs.existsSync(newPath)) {
							fs.mkdirSync(newPath);
						}

						// add file path
						newPath += sanitize(project.scripts[i].file.name);

						moveFile(tempPath, newPath);
					}
				}
			}
			if(typeof project.referenceFiles !== 'undefined'){
				for(j = 0; j < project.referenceFiles.length; ++j){
					if(typeof project.referenceFiles[j] !== 'undefined'){
						appDir = global.appRoot;
						tempPath = appDir + '/public/res/referenceFiles/temp/' + project.referenceFiles[j].file.name;
						relativePath =  'res/referenceFiles/' + project._id + '/';
						newPath = appDir + '/public/' + relativePath;

						// create project directory if not found
						if (!fs.existsSync(newPath)) {
							fs.mkdirSync(newPath);
						}

						// add file path
						newPath += sanitize(project.referenceFiles[j].file.name);

						moveFile(tempPath, newPath);
					}
				}
			}

			// move copied ref and script files for re-auditioned projects
			if(project.status[0] === 'ReAuditioned'){
				if(typeof copiedScripts !== 'undefined'){
					for(i = 0; i < copiedScripts.length; ++i){
						if(typeof copiedScripts[i] !== 'undefined'){
							appDir = global.appRoot;
							tempPath = appDir + '/public/res/scripts/' + oldID + '/' + copiedScripts[i].file.name;
							relativePath =  'res/scripts/' + project._id + '/';
							newPath = appDir + '/public/' + relativePath;

							// create project directory if not found
							if (!fs.existsSync(newPath)) {
								fs.mkdirSync(newPath);
							}

							// add file path
							newPath += sanitize(copiedScripts[i].file.name);

							fs.copyFile(tempPath, newPath, function(err){
								if (err) {
									console.log("Error Found:", err);
								}
							});

							// add script file to project ref list
							project.scripts.push(copiedScripts[i]);
						}
					}
				}

				if(typeof copiedReferenceFiles !== 'undefined'){
					for(j = 0; j < copiedReferenceFiles.length; ++j){
						if(typeof copiedReferenceFiles[j] !== 'undefined'){
							appDir = global.appRoot;
							tempPath = appDir + '/public/res/referenceFiles/' + oldID + '/' + copiedReferenceFiles[j].file.name;
							relativePath =  'res/referenceFiles/' + project._id + '/';
							newPath = appDir + '/public/' + relativePath;

							// create project directory if not found
							if (!fs.existsSync(newPath)) {
								fs.mkdirSync(newPath);
							}

							// add file path
							newPath += sanitize(copiedReferenceFiles[j].file.name);

							fs.copyFile(tempPath, newPath, function(err){
								if (err) {
									console.log("Error Found:", err);
								}
							});

							// add ref file to project ref list
							project.referenceFiles.push(copiedReferenceFiles[j]);

						}
					}
				}

				// update old project status
				Project.findById(project.id).then(function (oldProject) {

					oldProject.status = 'ReAuditioned';

					oldProject.save().then(function (oldProject) {
					}).catch(function (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					});
				});

				// reset current project status
				project.status = 'In Progress';
			}

			// send project creation email
			async.waterfall([
				function(done) {
					User.find({'roles':'admin','noemail':{ $ne: true }}).sort('-created').then(function (admins) {
						done(null, admins);
					});
				},
				function(admins, done) {
					User.find({'roles': { $in: ['producer/auditions director', 'auditions director', 'audio intern']},'noemail':{ $ne: true }}).sort('-created').then(function (directors) {
						done(null, admins, directors);
					});
				},
				function(admins, directors, done) {
					User.find({'roles':'production coordinator','noemail':{ $ne: true }}).sort('-created').then(function (coordinators) {
						done(null, admins, directors, coordinators);
					});
				},
				function(admins, directors, coordinators, done) {
					User.find({'roles':'talent director','noemail':{ $ne: true }}).sort('-created').then(function (talentdirectors) {
						done(null, admins, directors, coordinators, talentdirectors);
					});
				},
				function(admins, directors, coordinators, talentdirectors, done) {

					var i, email =  {
									projectId: '',
									to: [],
									bcc: [],
									subject: '',
									header: '',
									footer: '',
									scripts: '',
									referenceFiles: ''
								};

					// add previously queried roles to email list
					for(i = 0; i < admins.length; ++i){
						email.bcc.push(admins[i].email);
					}
					for(i = 0; i < directors.length; ++i){
						email.bcc.push(directors[i].email);
					}
					// for(i = 0; i < coordinators.length; ++i){
					// 	email.bcc.push(coordinators[i].email);
					// }
					for(i = 0; i < talentdirectors.length; ++i){
						email.bcc.push(talentdirectors[i].email);
					}

					email.subject = 'Audition Project Created - ' + project.title + ' - Due ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

					email.header = '<strong>Project:</strong> ' + project.title + '<br>';
					email.header += '<strong>Due:</strong> ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST<br>';
					email.header += '<strong>Created by:</strong> ' + req.user.displayName + '<br>';
					email.header += '<strong>Description:</strong> ' + project.description + '<br>';

					// add scripts and assets to email body
					email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
					if(typeof project.scripts !== 'undefined'){
						if(project.scripts.length > 0){
							for(i = 0; i < project.scripts.length; ++i){
								email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
							}
						} else {
							email.scripts += 'None';
						}
					} else {
						email.scripts += 'None';
					}
					email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
					if(typeof project.referenceFiles !== 'undefined'){
						if(project.referenceFiles.length > 0){
							for(var j = 0; j < project.referenceFiles.length; ++j){
								email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
							}
						} else {
							email.referenceFiles += 'None';
						}
					} else {
						email.referenceFiles += 'None';
					}

					done('', email);
				},
				// render regular email body
				function(email, done) {
					res.render('templates/projects/create-project', {
						email: email
					}, function(err, emailHTML) {
						done(err, emailHTML, email);
					});
				},
				// send out regular project creation email
				function(emailHTML, email, done) {
					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var mailOptions = {
						to: email.bcc,
						cc: config.mailer.notifications,
						from: req.user.email || config.mailer.from,
						replyTo: req.user.email || config.mailer.from,
						subject: email.subject,
						html: emailHTML
					};

					if(email.bcc.length > 0){
						transporter.sendMail(mailOptions , function(err) {
							done(err, email);
						});
					}
					
				},
				// send out talent project creation email
				function(email, done) {

					if(typeof project.talent !== 'undefined'){

						var talentIds = [];
						var emailTalentChk;
						for(var i = 0; i < project.talent.length; ++i){
							talentIds[i] = project.talent[i].talentId;
						}
						Talent.where('_id').in(talentIds).sort('-created').then(function (talents) {

							async.eachSeries(talents, function (talent, talentCallback) {

								// write change to log
								var log = {
									type: 'talent',
									sharedKey: String(talent._id),
									description: talent.name + ' ' + talent.lastName + ' added to project ' + project.title,
									user: req.user
								};
								log = new Log(log);
								log.save();

								// check for email flag
								emailTalentChk = false;
								if(talent.type.toLowerCase() === 'email'){
									emailTalentChk = true;
								}

								// verify talent needs to be emailed
								if(emailTalentChk === true){
									for(j = 0; j < project.talent.length; ++j){
										if(project.talent[j].talentId === String(talent._id)){
											// email talent
											emailTalent(project.talent[j], talent, email, project, req, res);
											// update talent status as needed
											project.talent[j].status = 'Emailed';
										}
									}
								}

								talentCallback();

							}, function (err) {
								done('', email);
							});

						});

					} else {
						done('', email);
					}

				},
				function(email, done) {
					// send email to client accounts, if needed
					if(req.body.notifyClient === true){

						if(typeof project.client !== 'undefined'){
							for(i = 0; i < project.client.length; ++i){

								// write change to log
								var log = {
									type: 'user',
									sharedKey: String(project.client.clientId),
									description: project.client.name + ' added to project ' + project.title,
									user: req.user
								};
								log = new Log(log);
								log.save();

								emailClients(project.client[i], email, project, req, res);
							}
						}

					}

					done('');
				},
				// save final project document
				function(done) {

					// set project owner
					project.owner = req.user._id;

					// check for assigned clients, if none assigned update P&P phase
					if(project.client.length === 0){

						// set project phase status
						project.phases[2].status = 'Waiting For Clients to Be Added';

						// gen project note
						var discussion = 'Project phase ' + project.phases[2].name + ' status changed to ' + project.phases[2].status + ' on ' + moment().tz('America/New_York').format() + ' EST by ' + req.user.displayName;
						var item = {
							date: moment().tz('America/New_York').format(),
							userid: '',
							username: 'System',
							item: discussion,
							deleted: false
						};
						project.discussion.push(item);
					}

					// save final project
					project.markModified("talent");
					project.markModified("phases");
					project.save().then(function () {
						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' project created',
							user: req.user
						};
						log = new Log(log);
						log.save();

						// emit an event for all connected clients
						return res.jsonp(project);
					}).catch(function (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					});
				
				},
				], function(err) {
				if (err) return console.log(err);
			});

		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	} else {
		return res.status(403).send('User is not authorized');
	}
};

// load project audition files
exports.loadAuditions = function(req, res){

	// set vars
	var projId = req.body.projectId;

	Audition.find({'project': Object(projId)}).sort('-created').then(function (auditions) {
		return res.jsonp(auditions);
	}).catch(function (err) {
		return res.status(400).send(err);
	});

};

// save project audition files
exports.deleteAudition = function(req, res){

	var aud = req.body.audition,
        appDir = global.appRoot,
        audFile = '';

	if(aud != null){
		Audition.findById(aud._id).sort('-created').then(function (audition) {
			// set aud file path
			audFile = appDir + '/public/res/auditions/' + String(audition.project) + '/' + audition.file.name;
			// remove file from file system
			if (fs.existsSync(audFile)) {
				fs.unlink(audFile, (err) => {
						if (err) {
							return res.status(400).send(err);
						}
					}
				);
			}
			// remove audition from adution collection
			audition.deleteOne().then(function (audition) {
//					// emit an event for all connected clients
				return res.status(200).send();
			}).catch(function (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			});
		}).catch(function (err) {
			return res.status(400).send(err);
		});
	}
};

// save project audition files
exports.deleteAllAuditions = function(req, res){

    var prodId = req.body.project_ID,
        appDir = global.appRoot + '/public',
        auditionsDir = appDir + '/res/auditions/' + prodId + '/';

	// remove all file if exists
	rimraf.sync(auditionsDir);

    // remove all assocaited auditions
    Audition.remove({project: Object(prodId)}).then(function (audition) {
		return res.status(200).send();
	}).catch(function (err) {
		return res.status(400).send(err);
    });

};

// save project audition files
exports.saveAudition = function(req, res){

	// set vars
	var aud = req.body.audition,
		appDir = global.appRoot;

	Audition.findById(aud._id).sort('-created').then(function (audition) {

		// check for aud rename
		if (aud.rename !== '') {

			var file = appDir + '/public/res/auditions/' + String(aud.project) + '/' + aud.file.name;
			var newFile = appDir + '/public/res/auditions/' + String(aud.project) + '/' + aud.rename;

			// move file if exists
			if (fs.existsSync(file)){

				moveFile(file, newFile);

				// change stored file name
				aud.file.name = aud.rename;
				aud.rename = '';

			}
		}

		audition = _.extend(audition, aud);

		audition.save().then(function (upaud) {
			return res.jsonp(audition);
		}).catch(function (err) {
			return res.status(400).send(err);
		});

	}).catch(function (err) {
		return res.status(400).send(err);
	});

};

// load single project for projects admin page
exports.loadProject = function(req, res){

	// set vars
	var projId = req.body.projectId;
	// load project
	Project.findById(projId).then(function (project) {
		project.populate('user', 'displayName');
		// walk through assigned talent
		async.eachSeries(project.talent, function (curTalent, talentCallback) {
				// gather updated talent info
				Talent.findById(curTalent.talentId).then(function (talent) {
					if(talent){
						curTalent.nameLnmCode = talent.name + ' ' + talent.lastNameCode;
						curTalent.locationISDN = talent.locationISDN;
					}
					talentCallback();
				});
			}, function (err) {
				project.save().then(function (upproject) {
					return res.jsonp(upproject);
				}).catch(function (err) {
					return res.status(400).send(err);
				});
		});
	}).catch(function (err) {
		return res.status(400).send();
	});

};

/**
 * Show the current Project
 */
exports.read = function(req, res) {
	res.jsonp(req.project);
};

// remove file from local file system
var deleteFiles = function(project, req, user){

	var appDir = global.appRoot;

	for(var i = 0; i < project.deleteFiles.length; ++i){
		var file = appDir + '/public' + project.deleteFiles[i];

		// remove file if exists
		if (fs.existsSync(file)) {
			fs.unlinkSync(file, (err) => {
				if (err) {
					return res.status(400).send(err);
				}
			});

			// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' project file ' + project.deleteFiles[i] + ' deleted',
				user: req.user
			};
			log = new Log(log);
			log.save();
		}

		// remove file from delete queue
		project.deleteFiles.splice(i, 1);
	}

};

// check if file exists
exports.fileExists = function(req, res){

	// method vars
	var appDir = global.appRoot,
		file = appDir + '/public' + req.body.file;

	// check if file exists
	if (fs.existsSync(file)) {
		return res.status(200).send();
	} else {
		return res.status(400).send();
	}

};

// handle remote file delete requests
exports.deleteFileByName = function(req, res){

	var appDir = global.appRoot,
		fileLocation = req.body.fileLocation,
		file = appDir + '/public' + fileLocation,
		projectId = req.body.projectId;

	// remove file is exists
	if (fs.existsSync(file)) {
		fs.unlinkSync(file, (err) => {
			if (err) {
				return res.status(400).send(err);
			}
		});

		// log instance if project info included
		if(typeof req.body.projectId !== 'undefined'){

			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

				if(project){

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(project._id),
						description: 'file ' + fileLocation + ' removed from ' + project.title,
						user: req.user
					};
					log = new Log(log);
					log.save();

				}

			});
		}

	}

	return res.status(200).send();
};

// handle remote file delete requests
exports.deleteTempScript = function(req, res){

	var appDir = global.appRoot;
	var file = appDir + '/public/res/scripts/temp/' + req.body.fileLocation;

	// remove file is exists
	if (fs.existsSync(file)) {
		fs.unlinkSync(file, (err) => {
			if (err) {
				return res.status(400).send(err);
			}
		});
		return res.status(200).send();
	} else {
		return res.status(200).send();
	}
};

// rename file from local file system
var renameFiles = function(project, res, req){

	var appDir = global.appRoot;

	for(var i = 0; i < project.auditions.length; ++i){
		var file = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].file.name;
		var newFile = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].rename;

		// move file if exists
		if (fs.existsSync(file) && project.auditions[i].rename !== '') {
			moveFile(file, newFile);

			// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' project file ' + project.auditions[i].file.name + ' renamed to ' + project.auditions[i].rename,
				user: req.user
			};
			log = new Log(log);
			log.save();

			// change stored file name
			project.auditions[i].file.name = project.auditions[i].rename;
			project.auditions[i].rename = '';

		}
	}

};

/**
 * Update a Project
 */
exports.update = function(req, res) {
	var project = req.project ;

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (_.intersection(req.user.roles, allowedRoles).length) {

		project = _.extend(project , req.body);

		async.waterfall([
			// rename files as requested
			function(done) {

				var appDir = global.appRoot;

				for(var i = 0; i < project.auditions.length; ++i){
					if(typeof project.auditions[i] !== 'undefined' && typeof project.auditions[i].file !== 'undefined'){
						var file = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].file.name;
						var newFile = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].rename;

						// move file if exists
						if (fs.existsSync(file) && project.auditions[i].rename !== '') {

							// change stored file name
							project.auditions[i].file.name = project.auditions[i].rename;
							project.auditions[i].rename = '';

							moveFile(file, newFile);

							project.markModified('auditions');

						}
					}
				}

				done();
			},
			// delete any files no longer in use
			function(done) {

				var appDir = global.appRoot;

				for(var i = 0; i < project.deleteFiles.length; ++i){
					var file = appDir + '/public' + project.deleteFiles[i];

					// remove file is exists
					if (fs.existsSync(file)) {
						fs.unlinkSync(file, (err) => {
							if (err) {
								return res.status(400).send(err);
							}
						});
					}

					// remove file from delete queue
					project.deleteFiles.splice(i, 1);
				}

				done();
			},
			function(done) {
				project.save().then(function (upproject) {

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(upproject._id),
						description: upproject.title + ' project updated',
						user: req.user
					};
					log = new Log(log);
					log.save();

					return res.jsonp(upproject);

				}).catch(function (err) {
					done(err);
				});
			}
			], function(err) {
				if (err) return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			});

	}
};

var removeFolder = function(location) {
    fs.readdir(location, function (err, files) {
        async.each(files, function (file, cb) {
            file = location + '/' + file;
            fs.stat(file, function (err, stat) {
                if (err) {
                    return cb(err);
                }
                if (stat.isDirectory()) {
                    removeFolder(file, cb);
                } else {
                    if (fs.existsSync(file)) {
		    fs.unlink(file, function (err) {
				if (err) {
					return cb(err);
				}
				return cb();
			});
		    }
                }
            });
        });
    });
};

/**
 * Delete an Project
 */
exports.delete = function(req, res) {
	var project = req.project,
		prodId = Object.create(project._id);

	// generate delete files list
	var appDir = global.appRoot + '/public';
	var auditionsDir = appDir + '/res/auditions/' + project._id + '/';
	var scriptsDir = appDir + '/res/scripts/' + project._id + '/';
	var referenceFilesDir = appDir + '/res/referenceFiles/' + project._id + '/';

	// remove all file if exists
	rimraf.sync(auditionsDir);
	rimraf.sync(scriptsDir);
	rimraf.sync(referenceFilesDir);

		// write change to log
	var log = {
		type: 'project',
		sharedKey: String(project._id),
		description: 'project deleted ' + project.title,
		user: req.user
	};
	log = new Log(log);
	log.save();

	project.deleteOne().then(function () {
		// remove all assocaited auditions
		Audition.deleteMany({project: prodId}).then(function () {
			// emit an event for all connected clients
			return res.jsonp(project);
		}).catch(function (err) {
			return res.status(400).send(err);
		});
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

exports.deleteById = function(req, res) {

	Project.findById(req.body.projectId).then(function (project) {
		if(project){

			// generate delete files list
			var appDir = global.appRoot + '/public';
			var auditionsDir = appDir + '/res/auditions/' + project._id + '/';
			var scriptsDir = appDir + '/res/scripts/' + project._id + '/';
			var referenceFilesDir = appDir + '/res/referenceFiles/' + project._id + '/';

			// remove all file if exists
			rimraf.sync(auditionsDir);
			rimraf.sync(scriptsDir);
			rimraf.sync(referenceFilesDir);

			// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' project deleted',
				user: req.user
			};
			log = new Log(log);
			log.save();

			project.deleteOne().then(function () {
				Project.find().sort('-created').then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			}).catch(function (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			});
		}
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

// list projects assigned to talent
exports.getTalentFilteredProjects = function(req, res){

	var dayAgo = new Date();
	dayAgo.setDate(dayAgo.getDay() - 14);

	var searchCriteria = {
		'talent': {
					$elemMatch: {
						'talentId': req.body.talentId
					}
				}
	};

	if(req.body.archived === true){
		Project.find(searchCriteria).sort('-created').then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else {
		Project.find(searchCriteria).where('estimatedCompletionDate').gt(dayAgo).sort('-created').then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	}

};

/**
 * List of Projects
 */
var performLoadList = function(req, res, allowedRoles, i, j, limit){

	var curUserId = String(req.user._id);
	var selLimit = limit || 50;

	if(req.user.roles[i] === allowedRoles[j]){

		switch(allowedRoles[j]){
			case 'user':
				Project.find({'user._id': curUserId}).sort('-created').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'talent':
			// talent does not currently have access, added to permit later access
				Project.find({'talent': { $elemMatch: { 'talentId': curUserId}}}).sort('-created').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'client':
				Project.find({'client': { $elemMatch: { 'userId': curUserId}}}).sort('-created').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'client-client':
				Project.find({'clientClient': { $elemMatch: { 'userId': curUserId}}}).sort('-created').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
		}

	}
};
// assemble filters
var getProjectsFilters = function(req){

	// gen filter object
	var filterObj = {};
	// filter by project title
	if(req.body.filter.title){
		filterObj.title = new RegExp(req.body.filter.title, 'i');
	}
	if(req.body.filter.description){
		filterObj.description = new RegExp(req.body.filter.description, 'i');
	}
	// filter my Projects
	if(req.body.filter.myProjects === true){
		filterObj.user = req.user._id;
	}
	// set in progress bit
	if(req.body.filter.status){
		filterObj.status = req.body.filter.status;
	}
	// set in progress bit
	if(req.body.filter.clientEmail){
		filterObj.client = { $elemMatch: {  email : new RegExp(req.body.filter.clientEmail, 'i') } };
	}

	return filterObj;
};
// retrieve projects count
exports.getProjectsCnt = function(req, res){

	// set filter vars
	var projectName, entireProject, myProjects, inProgress;
	var filterObj = getProjectsFilters(req);

	Project.find(filterObj).count({}).then(function (count) {
		res.jsonp(count);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

// retrieve only a set amount of projects
exports.findLimit = function(req, res) {

	var limit = req.body.queryLimit || 50;

	if(req.body.queryLimit === 'all') {
		limit = 0;
	}

	// permit certain user roles full access
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		Project.find().populate('user', 'displayName').sort('-created').limit(limit).then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(var i = 0; i < req.user.roles.length; ++i){
			for(var j = 0; j < allowedRoles.length; ++j){
				performLoadList(req, res, allowedRoles, i, j, limit);
			}
		}

	}

};
// list projects using custom defined filter values
exports.findLimitWithFilter = function(req, res) {

	// set filter vars
	var sortOrder = {};
	var projectName, entireProject, myProjects, ascDesc, inProgress;
	var filterObj = getProjectsFilters(req);

	// set collection sort order
	if(req.body.filter.sortOrder){
		var selSort = req.body.filter.sortOrder;
		if(req.body.filter.ascDesc === 'desc'){
			sortOrder[selSort] = -1;
		} else {
			sortOrder[selSort] = 1;
		}
		//sortOrder = sortOrder[selSort];
	}
	// set and store limits
	var startVal, limitVal;
	if(req.body.startVal){
		startVal = req.body.startVal;
	} else {
		startVal = 0;
	}
	if(req.body.limitVal){
		limitVal = req.body.limitVal;
	} else {
		limitVal = 100;
	}

	// permit certain user roles full access
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		Project.find(filterObj).populate('user', 'displayName').sort(sortOrder).skip(Number(startVal)).limit(Number(limitVal))
		.then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				obj: filterObj,
				sort: sortOrder,
				skip: startVal,
				limit: limitVal
			});
		});;

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(var i = 0; i < req.user.roles.length; ++i){
			for(var j = 0; j < allowedRoles.length; ++j){
				performLoadList(req, res, allowedRoles, i, j, limitVal);
			}
		}

	}

};
exports.list = function(req, res) {

	// permit certain user roles full access
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		Project.find().populate('user', 'displayName').sort('-created')
		.then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(var i = 0; i < req.user.roles.length; ++i){
			for(var j = 0; j < allowedRoles.length; ++j){
				performLoadList(req, res, allowedRoles, i, j);
			}
		}

	}
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) { 
	Project.findById(id).then(function (project) {
		if (!project) return next(new Error('Failed to load Project '));
		project.populate('user', 'displayName');
		req.project = project;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Project authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// recon 2/17/2015 to allow admin and producer level users to edit all projects
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator'];

	if (!_.intersection(req.user.roles, allowedRoles).length) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

// file upload
exports.uploadFile = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;

	var project = JSON.parse(req.body.data);

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + project.project._id + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }

    var relativePath =  'res' + '/' + project.project._id + '/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file to path
    newPath += sanitize(file.name);

    mv(tempPath, newPath, function(err) {

		if (err){
            return res.status(500).end();
        }else{

        	// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' file uploaded ' + sanitize(file.name),
				user: req.user,
				date: moment().tz('America/New_York').format()
			};
			log = new Log(log);
			log.save();

            return res.status(200).end();
        }
    });
};

// file upload
exports.uploadScript = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;

    // var project = JSON.parse(req.body.data);
    // project = project.project;
	var recBody = JSON.parse(req.body.data);
	var projectId = recBody.projectId;

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'scripts/' + projectId + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
	var scriptPath =  'res' + '/' + 'scripts/';
    var relativePath =  scriptPath + projectId + '/';
    var newPath = appDir + '/public/' + relativePath;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(appDir + '/public/' + scriptPath)) {
		fs.mkdirSync(appDir + '/public/' + scriptPath);
	}

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += sanitize(file.name);

	if(file.name.indexOf('#') > -1){

		return res.status(500).end();

	} else {

		Project.findById(projectId).then(function (project) {

			mv(tempPath, newPath, function(err) {

				if (err){
					return res.status(500).end();
				}else{

					req.files.file.name = sanitize(req.files.file.name);
					
					// generate new script object
					var script = {
									file: req.files.file,
									by: {
										userId: req.user._id,
										date: moment().tz('America/New_York').format(),
										name: req.user.displayName
									}
								};

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(projectId),
						description: project.title + ' script uploaded ' + file.name,
						user: req.user
					};
					log = new Log(log);
					log.save();

					return res.jsonp(script);

				}
			});

		});

	}

};

// file upload
exports.uploadReferenceFile = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
	
    var file = req.files.file;

    // var project = JSON.parse(req.body.data);
    // project = project.project;
	var recBody = JSON.parse(req.body.data);
	var projectId = recBody.projectId;

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'referenceFiles/' + projectId + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
		var refsPath =  'res' + '/' + 'referenceFiles/';
    var relativePath =  refsPath + projectId + '/';
    var newPath = appDir + '/public/' + relativePath;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(appDir + '/public/' + refsPath)) {
		fs.mkdirSync(appDir + '/public/' + refsPath);
	}

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += sanitize(file.name);

		Project.findById(projectId).then(function (project) {

	    mv(tempPath, newPath, function(err) {

			if (err){
	            return res.status(500).end();
	        }else{

					req.files.file.name = sanitize(req.files.file.name);
					
					var referenceFile = {
								file: req.files.file,
								by: {
									userId: req.user._id,
									date: moment().tz('America/New_York').format(),
									name: req.user.displayName
								}
								};

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(projectId),
						description: project.title + ' reference file uploaded ' + sanitize(file.name),
						user: req.user
					};
					log = new Log(log);
					log.save();

					return res.jsonp(referenceFile);

	        }
	    });

		});

};

exports.uploadTempReferenceFile = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;

	var referenceFiles = [];

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'referenceFiles/' + 'temp/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
	var refsPath =  'res' + '/' + 'referenceFiles/';
    var relativePath =  refsPath + 'temp/';
    var newPath = appDir + '/public/' + relativePath;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(appDir + '/public/' + refsPath)) {
		fs.mkdirSync(appDir + '/public/' + refsPath);
	}

	// check for existing temp directory, create if needed
	if (!fs.existsSync(newPath)) {
		fs.mkdirSync(newPath);
	}

    // add file path
    newPath += sanitize(file.name);

	req.files.file.name = sanitize(req.files.file.name);
    var referenceFile = {
		file: req.files.file,
		by: {
				userId: req.user._id,
				date: moment().tz('America/New_York').format(),
				name: req.user.displayName
			}
	};

	referenceFiles.push(referenceFile);

    mv(tempPath, newPath, function(err) {
        if (err){
            return res.status(500).end();
        }else{
            return res.jsonp(referenceFiles);
        }
    });
};

// file upload
exports.uploadTempScript = function(req, res, next){
	// We are able to access req.files.file thanks to
	// the multiparty middleware
	var file = req.files.file;

	var scripts = [];

	//var file = req.files.file;
	var appDir = global.appRoot;
	var tempPath = file.path;
	// check for passenger buffer file location
	var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'scripts/' + 'temp/' + file.name;
	if(fs.existsSync(passDir)){
	  tempPath = passDir;
	}
	var scriptPath =  'res' + '/' + 'scripts/';
	var relativePath =  scriptPath + 'temp/';
	var newPath = appDir + '/public/' + relativePath;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(appDir + '/public/' + scriptPath)) {
		fs.mkdirSync(appDir + '/public/' + scriptPath);
	}

	// check for existing temp directory, create if needed
	if (!fs.existsSync(newPath)) {
		fs.mkdirSync(newPath);
	}

	// add file path
    newPath += sanitize(file.name);
	if(file.name.indexOf('#') > -1){

		return res.status(500).end();

	} else {

		// assign user data
		var uid = '', uname = '';
		if(typeof req.user !== 'undefined'){
			uid = req.user._id;
			uname = req.user.displayName;
		}

		req.files.file.name = sanitize(req.files.file.name);

		var script = {
						file: req.files.file,
						by: {
							userId: uid,
							date: moment().tz('America/New_York').format(),
							name: uname
						},
						filecheck: 0,
						filecheckdate: ''
					};

		scripts.push(script);

		mv(tempPath, newPath, function(err) {
		  if (err){
			  return res.status(500).end();
		  }else{
			  return res.jsonp(scripts);
		  }
		});

	}
};

exports.test = function(req, res, next){
    // method vars
	var audTalent = '',
		firstName = '',
		lastNameCode = '',
		curUser = Object.create(req.user);

    var file = '120-AlanS.mp3';

    var regStr = /([a-zA-Z]+)\.\w{3}$/i.exec(file);
	if(regStr !== null){
		var regStrOP = regStr[1],
			   lastNm = /([A-Z])[a-z]*$/.exec(regStrOP);

		if(lastNm !== null){
			var lastNmPos = lastNm.index;

			firstName = regStrOP.slice(0,lastNmPos);
			lastNameCode = regStrOP.slice(lastNmPos, regStrOP.length);
		}
	}

    Talent.find({'name': new RegExp('^'+firstName+'$', 'i'), 'lastNameCode': new RegExp('^'+lastNameCode+'$', 'i')}).sort('-created').then(function (talent) {
            return res.jsonp(talent);

//            Project.findById('56fd5d370cd11652504b0cd4').populate('user', 'displayName').exec(function(err, project) {
//				// walk through project talent, look for existing assignment
//                var fndTalent = [];
//                async.eachSeries(project.talent, function (curTalent, talentCallback) {
//
//                    if(talent !== null){
//                        if(String(talent._id) == String(curTalent.talentId)){
//                            audTalent = curTalent.talentId;
//                        }
//                        fndTalent.push(talent._id + ' ' + curTalent.talentId);
//                    }
//                    talentCallback();
//
//                }, function (err) {
//                    return res.jsonp(fndTalent);
//                });
//			});
            //return res.jsonp(talent);
	}).catch(function (err) {
		return res.status(400).json(err);
    });

}

// file upload
exports.uploadAudition = function(req, res, next){

	// method vars
	var audTalent = '',
		firstName = '',
		lastNameCode = '',
		curUser = Object.create(req.user);

    var uploadedFiles = (Array.isArray(req.files.file) ? req.files.file : [req.files.file] );

    //return res.jsonp(req.files);
    // upload all files from files array
    async.eachSeries(uploadedFiles, function iteratee(curFile, fileCallback) {

        // We are able to access req.files.file thanks to
        // the multiparty middleware
        var file = curFile;

        // read in project document
        //var project = JSON.parse(req.body.data);
        var recBody = JSON.parse(req.body.data),
            projectId = recBody.projectId;

        //var file = req.files.file;
        var appDir = global.appRoot,
            tempPath = file.path;
        // check for passenger buffer file location
        var passDir = '/usr/share/passenger/helper-scripts/public/res/auditions/' + projectId + '/' + sanitize(file.name);
        if(fs.existsSync(passDir)){
            tempPath = passDir;
        }
        var audPath =  'res' + '/' + 'auditions/',
            relativePath =  audPath + projectId + '/',
            newPath = appDir + '/public/' + relativePath;

        // check for existing parent directory, create if needed
        if (!fs.existsSync(appDir + '/public/' + audPath)) {
            fs.mkdirSync(appDir + '/public/' + audPath);
        }

        // create project directory if not found
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        // add file path
        newPath += sanitize(file.name);

        // strip talent name and last name code from audition
        var regStr = /([a-z_A-Z]+)\.\w{3}$/i.exec(file.name.trim());
		firstName = '';
		lastNameCode = '';
        if(regStr !== null){
            var regStrOP = regStr[1],
                lastNm = /([A-Z])[a-z]*$/.exec(regStrOP);

            if(lastNm !== null){
                var lastNmPos = lastNm.index;

                firstName = regStrOP.slice(0,lastNmPos).split('_').join(' ');
                lastNameCode = regStrOP.slice(lastNmPos, regStrOP.length);
            }
        }

        async.waterfall([
            // gather info for selected project
            function(done) {
                mv(tempPath, newPath, function(err) {
                    done(err);
                });
            },
            function(done) {
                Talent.find({'name': { $regex: '^'+firstName+'$', $options: 'i' }, 'lastNameCode': { $regex: '^'+lastNameCode+'$',  $options: 'i'}}).sort('-created').then(function (talent) {
                    done(null, talent);
                });
            },
            function(talent, done) {
                Project.findById(projectId).then(function (project) {
                    done(null, talent, project);
                });
            },
            function(talent, project, done) {

                audTalent = '';

                // walk through project talent, look for existing assignment
                async.eachSeries(project.talent, function iteratee(curTalent, talentCallback) {

                    async.eachSeries(talent, function iteratee(curAllTalent, talentAllCallback) {

                        if(talent !== null){
                            if(String(curAllTalent._id).trim() == String(curTalent.talentId).trim()){
                                audTalent = curTalent.talentId;
                                curTalent.status = 'Posted';

                                //delete project.__v;
                                project.markModified('talent');
                                project.markModified('modified');
                                //curTalent.markModified('status');
                                project.save().catch(function (err) {
									log = {
                                        type: 'error',
                                        sharedKey: String(project._id),
                                        description: String(err) + ' Project ID: ' + String(project._id),
                                        user: req.user
                                    };
                                    log = new Log(log);
                                    log.save();
                                });

                                // write change to log
                                var log = {
                                    type: 'talent',
                                    sharedKey: curTalent.talentId,
                                    description: project.title + ' status updated to ' + curTalent.status,
                                    user: req.user
                                };
                                log = new Log(log);
                                log.save();

                            }
                        }

                        talentAllCallback();

                    }, function done(err) {

                        talentCallback();

                    });

                }, function done(err) {

                    var audition = {
                        project: project._id,
						owner: curUser,
                        file: curFile,
                        discussion: [],
                        description: '',
                        rating: [],
                        published: true,
                        rename: '',
                        avgRating: 0,
                        favorite: 0,
                        talent: audTalent,
                        selected: false,
                        booked: false,
                        approved:
                            {
                                by:
                                {
                                    userId: curUser._id,
                                    date: moment().tz('America/New_York').format(),
                                    name: curUser.displayName
                                }
                            }
                        };

                    // save audition to auditions collection
                    var aud = new Audition(audition);
                    aud.save();

                    // write change to log
                    var log = {
                        type: 'project',
                        sharedKey: String(project._id),
                        description: project.title + ' audition uploaded ' + sanitize(file.name),
                        user: curUser
                    };
                    log = new Log(log);
                    log.save();

                    // send audition data to client

                    //return res.jsonp(audition);

                    fileCallback();

                });
            }
            ], function(err) {
            if (err) {
                //return res.status(500).json(err);
            }
        });

    }, function done(err) {
        if (err) {
            return res.status(500).json(err);
        } else {
            return res.jsonp({'status':'success'});

        }

    });

};

// audition temp file upload
exports.uploadTempAudition = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;

    var project = JSON.parse(req.body.data);
    project = project.project;

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'auditions/' + 'temp/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
	var audPath =  'res' + '/' + 'auditions/';
	var relativePath =  audPath + 'temp/';
    var newPath = appDir + '/public/' + relativePath;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(appDir + '/public/' + audPath)) {
		fs.mkdirSync(appDir + '/public/' + audPath);
	}

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += sanitize(file.name);

    mv(tempPath, newPath, function(err) {
        if (err){
            res.status(500).end();
        }else{
			req.files.file.name = sanitize(req.files.file.name);

			var audition = {
						file: req.files.file,
						discussion: [],
						description: '',
						rating: [],
						published: true,
						rename: '',
						avgRating: 0,
						favorite: 0,
						approved:
								{
									by:
									{
										userId: '',
										date: moment().tz('America/New_York').format(),
										name: ''
									}
								}
			};

			return res.jsonp(audition);

        }
    });

};


exports.downloadAllAuditionsClient = function(req, res, next){

	Audition.find({'project': Object(req.body.project._id),'published':{ "$in": ["true",true] }}).sort('-created').then(function (auditionsFiles) {
		
		var i = 0,
			audFileCnt = auditionsFiles.length,
			fileLoc = '';
		// get app dir
		var appDir = global.appRoot;
		var relativePath =  'res' + '/' + 'auditions' + '/' + req.body.project._id + '/';
		var newPath = appDir + '/public/' + relativePath;
		var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
		var zipName = req.body.project.title.replace('/','-') + '.zip';
		var newZip = savePath + zipName;

		// check for existing parent directory, create if needed
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath);
		}

		var output = fs.createWriteStream(newZip);
		var archive = archiver('zip');

		output.on('close', function() {
			res.jsonp({zip:zipName});
		});

		for(i = 0; i < audFileCnt; i++){
			fileLoc = newPath + auditionsFiles[i].file.name;
			archive.file(fileLoc, { name:auditionsFiles[i].file.name });
		}

		archive.pipe(output);

		archive.finalize();

	}).catch(function (err) {
		res.status(500).end();
	});
	
};


exports.downloadAllAuditions = function(req, res, next){
	// get app dir
	var appDir = global.appRoot;
	var relativePath =  'res' + '/' + 'auditions' + '/' + req.body.project._id + '/';
	var newPath = appDir + '/public/' + relativePath;
	var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var zipName = req.body.project.title.replace('/','-') + '.zip';
	var newZip = savePath + zipName;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
		res.jsonp({zip:zipName});
	});

	archive.directory(newPath, 'my-auditions');

	archive.pipe(output);

	archive.finalize();

 //    res.setHeader('Content-Type', 'application/zip');
	// res.setHeader('content-disposition', 'attachment; filename="auditions.zip"');
 //    return archive.pipe(res);

};

exports.downloadBookedAuditions = function(req, res, next){

	// method vars
	var projectId = req.body.projectId;
	var projectTitle = req.body.projectTitle.replace('/','-');
	var bookedAuds = req.body.bookedAuds;

	// get app dir
	var appDir = global.appRoot;
	var relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/';
	var newPath = appDir + '/public/' + relativePath;
	var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var zipName = projectTitle + '.zip';
	var newZip = savePath + zipName;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
	  res.jsonp({zip:zipName});
	});

	// add all booked auditions
    async.eachSeries(bookedAuds, function (audition, next) {

        if (fs.existsSync(newPath + audition)) {
			archive.file(newPath + audition, { name:audition });
		}

        next();

    }, function done(err) {

        archive.pipe(output);
        archive.finalize();

    });

};


exports.downloadSelectedAuditions = function(req, res, next){

	// method vars
	var projectId = req.body.projectId;
	var projectTitle = req.body.projectTitle.replace('/','-');
	var selAuds = req.body.selectedAuds;

	// get app dir
	var appDir = global.appRoot;
	var relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/';
	var newPath = appDir + '/public/' + relativePath;
	var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var zipName = projectTitle + '.zip';
	var newZip = savePath + zipName;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
	  res.jsonp({zip:zipName});
	});

    // add all booked auditions
    async.eachSeries(selAuds, function (audition, next) {

        if (fs.existsSync(newPath + audition)) {
			archive.file(newPath + audition, { name:audition });
		}
        next();

    }, function (err) {

        archive.pipe(output);
        archive.finalize();

    });

};
// send email and update project status for selected booked auditions
exports.bookAuditions = function(req, res, next){

	var projectId = req.body.data.project;

	async.waterfall([
		// gather info for selected project
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
				done(null, project);
			});
		},
		// update status for selected booked auditions
		function(project, done) {

			var selAuds = [];

			async.eachSeries(project.auditions, function (audition, next) {
				if(audition.selected === true && (typeof audition.booked === 'undefined' || audition.booked === false)){
					audition.booked = true;
					selAuds.push(audition);
				}
				next();
			}, function (err) {
				done(err, selAuds, project);
			});
		},
		// update status for new selected booked auditions
		function(selAuds, project, done) {

			// gather audition data from auditions collection
			Audition.find({'project': project._id}).sort('-created').then(function (auditions) {
				if (auditions) {
					async.eachSeries(auditions, function (audition, next) {
						if(audition.selected === true && (typeof audition.booked === 'undefined' || audition.booked === false)){
							audition.booked = true;
							selAuds.push(audition);
							audition.save();
						}
						next();
					}, function (err) {
						done(err, selAuds, project);
					});
				}
			});
		},
		// update project
		function(selAuds, project, done) {

			var newProject = project.toObject();

			newProject.status = 'Booked';

			Project.findById(project._id).then(function (project) {

				project = _.extend(project, newProject);

				project.save().then(function () {
						done(null, selAuds, project);
				});

			});
		},
		// gather client email, send out emails
		function(selAuds, project, done){

			var clients = [];

			async.eachSeries(project.client, function (client, clientCallback) {

				User.findOne({'_id':client.userId}).sort('-created').then(function (clientInfo) {
					clients.push(clientInfo);
					clientCallback();
				});

			}, function (err) {
				done(err, clients, selAuds, project);
		   	});
		},
		function(clients, selAuds, project, done){

			var clientsEmails = [];

			async.eachSeries(clients, function (client, clientCallback) {

				clientsEmails.push(client.email);
				clientCallback();

			}, function (err) {
				done(err, clientsEmails, selAuds, project);
	   	});
		},
		// get project owner data
		function(clientsEmails, selAuds, project, done) {

			// gather project owner data
			var ownerId;
			if(!project.owner){
				ownerId = project.user;
			} else{
				ownerId = project.owner;
			}

			User.findOne({'_id':ownerId}).sort('-created').then(function (ownerInfo) {
				done(null, ownerInfo, clientsEmails, selAuds, project);
			});
		},
		function(ownerInfo, clientsEmails, selAuds, project, done){

			// generate email signature
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

			var emailSig = '';
			if(ownerInfo.emailSignature){
				emailSig = ownerInfo.emailSignature;
			} else {
				emailSig = '';
			}

			// assign booked list
			var bookedText = '<p>';
			for(var i = 0; i < selAuds.length; ++i){
				bookedText += '<a href="http://' + req.headers.host + '/res/auditions/' + project._id + '/' + selAuds[i].file.name + '">' + selAuds[i].file.name + '</a><br>';
			}
			bookedText += '</p>';

			res.render('templates/projects/booked-audition-email', {
				user: req.user,
				project: project,
				dueDate: newDate,
				emailSignature: emailSig,
				bookedText: bookedText
			}, function(err, bookedEmailHTML) {
				done(err, ownerInfo, clientsEmails, selAuds, project, bookedEmailHTML);
			});

		},
		// send out talent project creation email
		function(ownerInfo, clientsEmails, selAuds, project, bookedEmailHTML, done) {
			// send email
			// generate email signature
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
			var emailSubject = 'Auditions Booked - ' + project.title;

			var mailOptions = {
				to: clientsEmails,
				cc: [ownerInfo.email, config.mailer.notifications],
				from: ownerInfo.email || config.mailer.from,
				replyTo: ownerInfo.email || config.mailer.from,
				subject: emailSubject,
				html: bookedEmailHTML
			};
			transporter.sendMail(mailOptions, function(err){
				done(err);
			});
		}
		], function(err) {
		if (err) {
			return res.status(400).json(err);
		} else {
			return res.status(200).send();
		}
	});
};

exports.backupProjectsById = function(req, res, next){

	// get app dir
	var appDir = global.appRoot;
	var archivesPath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var curDate = moment().format('MMM Do YY');
	var zippedFilename = 'Auditions Project Backup Bundle - ' + curDate + '.zip';
	var newZip = archivesPath + zippedFilename;
	var backupDir = archivesPath + req.user._id + '_backup';
	var auditionsDir, scriptsDir, referenceFilesDir, projectBuDir;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(archivesPath)) {
		fs.mkdirSync(archivesPath);
	}

    // remove existing backup file
    if (fs.existsSync(newZip)) {
    	rimraf.sync(newZip);
    }

    // archiver settings
    var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
	  // delete temp files
	  rimraf.sync(backupDir);
	  // inform user of file download
	  res.jsonp({zippedFilename: zippedFilename});
	});

	// create backup directory
	if (!fs.existsSync(backupDir)) {
    	fs.mkdirSync(backupDir);
    }

	async.eachSeries(req.body.projectList, function (projectId, callback) {

		Project.findById(projectId).then(function (project) {
			if (!project) return next(new Error('Failed to load Project '));
			req.project = project ;

			// set project file directory params
			auditionsDir = appDir + '/public/res/auditions/' + project._id + '/';
			scriptsDir = appDir + '/public/res/scripts/' + project._id + '/';
			referenceFilesDir = appDir + '/public/res/referenceFiles/' + project._id + '/';
			projectBuDir = '/backups/' + moment(project.estimatedCompletionDate).format('MM-DD-YYYY hhmm a') + '-' + project.title + '-' + project._id;

			// compress associated files and JSON document to single archive
			async.waterfall([
			function(done) {

				// create backup directory
				if (!fs.existsSync(backupDir + '/' + project._id)) {
			    	fs.mkdirSync(backupDir + '/' + project._id);
			    }

				// create text file containing json object
				var file = fs.createWriteStream(backupDir + '/' + project._id + '/JSON.txt');
				file.end(JSON.stringify(project));

				archive.file(backupDir + '/' + project._id + '/JSON.txt', { name:projectBuDir + '/JSON.txt' });

				done('');
			},
			function(done) {
				// create archive of all associated files
				if (fs.existsSync(auditionsDir)){
			    	archive.directory(auditionsDir, projectBuDir + '/auditions');
				}
				if (fs.existsSync(scriptsDir)){
			    	archive.directory(scriptsDir, projectBuDir + '/scripts');
			    }
			    if (fs.existsSync(referenceFilesDir)){
			    	archive.directory(referenceFilesDir, projectBuDir + '/referenceFiles');
			    }

			    done('');
			}
			], function(err) {
				callback(err);
			});
		}).catch(function (err) {
			return next(err);
		});

	}, function (err) {
		if( err ) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			archive.pipe(output);

		    archive.finalize();

			//res.jsonp({count: missingCnt, results:callTalents});
		}
   	});

};

var walk = function(dir, done) {
  var results = [], fileData = {}, fileInfo, fileName, fileExt;
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          fileInfo = file.split('/');
          fileName = fileInfo[fileInfo.length-1];
          fileExt = fileName.split('.');
          fileExt = fileExt[fileExt.length-1];

          fileInfo.pop();

          // only push JSON.txt documents
          if(fileName === 'JSON.txt'){
	          fileData = {
	          	path: file,
	          	parentPath: fileInfo.join('/'),
	          	name: fileName,
	          	ext: fileExt
	          };
	          results.push(fileData);
      	  }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

exports.uploadBackup = function(req, res, next){
// We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file, JSONobj, saveProj, parentPath, project;
    var auditionsDir, scriptsDir, referenceFilesDir;
    var auditionsBackupDir, scriptsBackupDir, referenceFilesBackupDir;

    //var file = req.files.file;
    var appDir = global.appRoot;
    var tempPath = file.path;
    // check for passenger buffer file location
    var passDir = '/usr/share/passenger/helper-scripts/public/res/' + 'archives/' + 'backups/' + file.name;
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
	var archivesPath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var backupPath = archivesPath + 'backups/';
	var savePath = archivesPath + file.name;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(archivesPath)) {
		fs.mkdirSync(archivesPath);
	}

	// remove backups directory, if exists
	if(fs.existsSync(backupPath)) {
		rimraf.sync(backupPath);
	}

	// save backup package
    mv(tempPath, savePath, function(err) {
		if (err && err !== '') {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			// open submitted archive
	    	// perform tasks after archive has been decompressed
	    	unzip(savePath, {fix: true}, function(err) {

	    		walk(backupPath, function(err, results){

	    			async.eachSeries(results, function (curSelproject, projectCallback) {

	    				parentPath = curSelproject.parentPath;

	    				fs.readFile(curSelproject.path, 'utf8', function (err, data) {

							// generate and insert new project object
							JSONobj = JSON.parse(data);

							delete(JSONobj.user);

							project = new Project(JSONobj);

							req.project = project;

							// delete existing project if exists
							Project.findById(project._id).then(function (delProject) {

								// generate delete files list
								var auditionsDir = appDir + '/public/' + '/res/auditions/' + project._id + '/';
								var scriptsDir = appDir + '/public/' + '/res/scripts/' + project._id + '/';
								var referenceFilesDir = appDir + '/public/' + '/res/referenceFiles/' + project._id + '/';

								// remove all file if exists
								rimraf.sync(auditionsDir);
								rimraf.sync(scriptsDir);
								rimraf.sync(referenceFilesDir);

								project.deleteOne().then(function () {

									project.save().then(function () {

										// current file location
										auditionsBackupDir = parentPath + '/auditions/';
										scriptsBackupDir = parentPath + '/scripts/';
										referenceFilesBackupDir = parentPath + '/referenceFiles/';

										async.waterfall([
											function(done) {
												// check for associated media directories
												fs.existsSync(auditionsBackupDir, function(exists) {
													if (!exists) {
														done(err);
													} else {
											    		mv(auditionsBackupDir, auditionsDir, {mkdirp: true}, function(err) {
															done(err);
														});
												    }

												});
											},
											function(done) {
											    fs.existsSync(scriptsBackupDir, function(exists) {
											    	if (!exists) {
														done(err);
													} else {

											    		mv(scriptsBackupDir, scriptsDir, {mkdirp: true}, function(err) {
															done(err);
														});
											    	}

											    });
											},
											function(done) {
											    fs.existsSync(referenceFilesBackupDir, function(exists) {
											    	if (!exists) {
														done(err);
													} else {
											    		mv(referenceFilesBackupDir, referenceFilesDir, {mkdirp: true}, function(err) {
															done(err);
														});
												    }

											    });
											},

											], function(err) {
											if (err && err !== '') {
												return res.status(400).send({
													message: errorHandler.getErrorMessage(err)
												});
											} else {
												projectCallback(err);
											}
										});

									});

								});


							});

						});

	    			}, function (err) {
						if( err && err !== '') {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {

							// remove backup dir
							rimraf.sync(backupPath);

							// reload project list
							Project.find().sort('-created').then(function (projects) {
								return res.jsonp(projects);
							}).catch(function (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							});

						}

					});

	    		});

			});

	    }
    });
};

// upload talent auditions
exports.uploadTalentAudition = function(req, res, next){

	// method vals
	var tempPath, savePath, key = 0;

	// gather submitted vals
	var project = req.body.project;
	var auditions = req.body.auditions;
	var talentId = req.body.talent;

	// get app dir
	var appDir = global.appRoot;
	// check for passenger buffer file location
	var auditionsTempPath = '/usr/share/passenger/helper-scripts/public/res' + '/' + 'auditions' + '/' + 'temp' + '/';
	var auditionsPath = appDir + '/public/' + 'res' + '/' + 'auditions' + '/' + 'temp' + '/';
	var talentUploadParent = appDir + '/public/' + 'res' + '/' + 'talentUploads' + '/';
	var talentUploadPath = talentUploadParent + project._id + '/';
	var talentUploadTalentPath = talentUploadPath + talentId + '/';

	// check for existing parent directory, create if needed
	if (!fs.existsSync(talentUploadParent)) {
		fs.mkdirSync(talentUploadParent);
	}

	// create project directory if not found
	if (!fs.existsSync(talentUploadPath)) {
		fs.mkdirSync(talentUploadPath);
	}
	if (!fs.existsSync(talentUploadTalentPath)) {
		fs.mkdirSync(talentUploadTalentPath);
	}

	// walk through submitted auditions
	async.waterfall([
		function(done) {

			async.eachSeries(auditions, function (audition, auditionCallback) {

				// move submitted auditions to new location
				tempPath = auditionsTempPath + audition.file.name;
				savePath = talentUploadTalentPath + audition.file.name;

				mv(tempPath, savePath, function(err) {

					// remove file if exists
					if (fs.existsSync(tempPath)) {
						fs.unlinkSync(tempPath, (err) => {
							if (err) {
								return res.status(400).send(err);
							}
						});
					}

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(project._id),
						description: project.title + ' talent audition uploaded ' + audition.file.name,
						user: req.user
					};
					log = new Log(log);
					log.save();

					auditionCallback(err);
				});

			}, function (err) {
				done(err);
		   	});

		},
		// reload project for most recent data
		function(done){
			Project.findById(project._id).then(function (updatedProject) {
				done(null, updatedProject);
			});
		},
		// update project with submitted auds
		function(updatedProject, done){

			for(var i = 0; i < updatedProject.talent.length; ++i){

				if(updatedProject.talent[i].talentId === talentId){

					if(typeof updatedProject.talent[i].submissions === 'undefined'){

						updatedProject.talent[i].submissions = auditions;
						done('', updatedProject);

					} else {

						for(var j = 0; j < auditions.length; ++j){
							updatedProject.talent[i].submissions.push(auditions[j]);
						}
						done('', updatedProject);

					}

				}

			}

		},
		// save updated project
		function(updatedProject, done){

			Project.findById(project._id).then(function (project) {

				project = _.extend(project, updatedProject.toObject());

				project.save().then(function () {

					done(err);

				});

			});

		}
		], function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp({'status':'success'});
			}
	});

};
