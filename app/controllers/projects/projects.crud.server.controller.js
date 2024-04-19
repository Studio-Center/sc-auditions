'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Project = mongoose.model('Project'),
	Audition = mongoose.model('Audition'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	config = require('../../../config/config'),
	radash = require('radash'),
	async = require('async'),
	sgMail = require('@sendgrid/mail'),
	dateFormat = require('dateformat'),
	sanitize = require("sanitize-filename"),
	moment = require('moment-timezone'),
	mv = require('mv'),
	emailTalent = require('./classes/email.class').talent,
	emailClients = require('./classes/email.class').clients;

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

/**
 * Project authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// recon 2/17/2015 to allow admin and producer level users to edit all projects
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator'];

	if (!radash.intersects(req.user.roles, allowedRoles)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

// update talent status
exports.updateNoRefresh = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'],
      	log = '',
		project = '';

    if(typeof req.body.project != 'undefined' && typeof req.body.project._id  != 'undefined'){
	// validate user interaction
        if (radash.intersects(req.user.roles, allowedRoles) && typeof req.body.project != 'undefined' && typeof req.body.project._id != 'undefined') {

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

                    project = Object.assign(project, req.body.project);

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

	if (radash.intersects(req.user.roles, allowedRoles)) {

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
					email.bcc = radash.unique(email.bcc);
					email.bcc = radash.diff(email.bcc, [req.user.email]);

					var mailOptions = {
						to: email.bcc,
						cc: config.mailer.notifications,
						from: req.user.email || config.mailer.from,
						replyTo: req.user.email || config.mailer.from,
						subject: email.subject,
						html: emailHTML
					};

					if(email.bcc.length > 0){
						sgMail
						.send(mailOptions)
						.then(() => {
							done(null, email);
						}, error => {
							done(error, email);
						});
					} else {
						done(null, email);
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

/**
 * Update a Project
 */
exports.update = function(req, res) {
	var project = req.project ;

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (radash.intersects(req.user.roles, allowedRoles)) {

		project = Object.assign(project , req.body);

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

/**
 * Delete a Project
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