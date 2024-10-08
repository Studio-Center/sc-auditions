'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Project = mongoose.model('Project'),
	Audition = mongoose.model('Audition'),
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
	emailTalent = require('./classes/email.class').talent,
	emailClients = require('./classes/email.class').clients,
	fileFuncs = require('./classes/files.class');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

/**
 * Project authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// recon 2/17/2015 to allow admin and producer level users to edit all projects
	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator'];

	if (!radash.intersects(req.user.roles, allowedRoles)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

// update talent status
exports.updateNoRefresh = function(req, res){

	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client']
    let log = '';

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

                Project.findById(req.body.project._id).then(function (project) {
					project.populate('user', 'displayName');

                    project = Object.assign(project, req.body.project);

					if(project){
						project.markModified('talent');
						project.markModified('modified');

						// clear version
						delete project.__v;

						req.project = project;

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

							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
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
	let oldID = '';
	if(typeof req.body.project != 'undefined'){
		oldID = req.body.project._id;
		delete req.body.project._id;
	}
	// method vars
	let project = new Project(req.body.project),
		copiedScripts = req.body.copiedScripts,
		copiedReferenceFiles = req.body.copiedReferenceFiles,
		appDir = global.appRoot,
		tempPath = '',
		relativePath =  '',
		newPath = '';
	
	project.user = req.user;

	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern','production coordinator'];

	if (radash.intersects(req.user.roles, allowedRoles)) {

		// clear version
		delete project.__v;

		// save final project
		project.save().then(function (project) {

			// perform before save routines
			if(req.body.notifyClient === true){
				// create new project note stating client notified
				let discussionTxt = 'Client Notified of Project Start by ' + req.user.displayName;
				let item = {date: moment().tz('America/New_York').format(), userid: '', username: 'system', item: discussionTxt, deleted: false};

				project.discussion.push(item);
			}

			// move new saved files from temp to project id based directory
			if(typeof project.scripts !== 'undefined'){
				for(const i in project.scripts) {
					if(typeof project.scripts[i] !== 'undefined'){
						
						tempPath = appDir + '/public/res/scripts/temp/' + project.scripts[i].file.name;
						relativePath =  'res/scripts/' + project._id + '/';
						newPath = appDir + '/public/' + relativePath;

						// create project directory if not found
						if (!fs.existsSync(newPath)) {
							fs.mkdirSync(newPath);
						}

						// add file path
						newPath += sanitize(project.scripts[i].file.name);

						fileFuncs.moveFile(tempPath, newPath);

						// update file name with sanitized version
						project.scripts[i].file.name = sanitize(project.scripts[i].file.name);
					}
				}
			}
			if(typeof project.referenceFiles !== 'undefined'){
				for(const j in project.referenceFiles) {
					if(typeof project.referenceFiles[j] !== 'undefined'){

						tempPath = appDir + '/public/res/referenceFiles/temp/' + project.referenceFiles[j].file.name;
						relativePath =  'res/referenceFiles/' + project._id + '/';
						newPath = appDir + '/public/' + relativePath;

						// create project directory if not found
						if (!fs.existsSync(newPath)) {
							fs.mkdirSync(newPath);
						}

						// add file path
						newPath += sanitize(project.referenceFiles[j].file.name);

						fileFuncs.moveFile(tempPath, newPath);

						// update file name with sanitized version
						project.referenceFiles[j].file.name = sanitize(project.referenceFiles[j].file.name);
					}
				}
			}

			// move copied ref and script files for re-auditioned projects
			if(project.status[0] === 'ReAuditioned'){
				if(typeof copiedScripts !== 'undefined'){
					for(const i in copiedScripts) {
						if(typeof copiedScripts[i] !== 'undefined'){

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
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}
							});

							// update file name with sanitized version
							copiedScripts[i].file.name = sanitize(copiedScripts[i].file.name);

							// add script file to project ref list
							project.scripts.push(copiedScripts[i]);
						}
					}
				}

				if(typeof copiedReferenceFiles !== 'undefined'){
					for(const j in copiedReferenceFiles) {
						if(typeof copiedReferenceFiles[j] !== 'undefined'){

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
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}
							});

							// update file name with sanitized version
							copiedReferenceFiles[j].file.name = sanitize(copiedReferenceFiles[j].file.name);

							// add ref file to project ref list
							project.referenceFiles.push(copiedReferenceFiles[j]);

						}
					}
				}

				// update old project status
				Project.findById(project.id).then(function (oldProject) {

					oldProject.status = 'ReAuditioned';

					// clear version
                    delete oldProject.__v;

					oldProject.save().then(function () {
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

					let email =  {
									projectId: '',
									to: [],
									bcc: [],
									subject: '',
									header: '',
									footer: '',
									scripts: '',
									referenceFiles: ''
								};

					email.subject = 'Audition Project Created - ' + project.title + ' - Due ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

					email.header = '<strong>Project:</strong> ' + project.title + '<br>';
					email.header += '<strong>Due:</strong> ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST<br>';
					email.header += '<strong>Created by:</strong> ' + req.user.displayName + '<br>';
					email.header += '<strong>Description:</strong> ' + project.description + '<br>';

					// add scripts and assets to email body
					email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
					if(typeof project.scripts !== 'undefined' && project.scripts.length > 0){
						for(const i in project.scripts) {
							email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
						}
					} else {
						email.scripts += 'None';
					}
					email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
					if(typeof project.referenceFiles !== 'undefined' && project.referenceFiles.length > 0){
						for(const j in project.referenceFiles) {
							email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
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
					let fromEmail = req.user.email || config.mailer.from,
						mailOptions = {
							to: config.mailer.notifications,
							from: fromEmail,
							subject: email.subject,
							html: emailHTML
						};

					try{
						sgMail
						.send(mailOptions)
						.then(() => {
							done(null, email);
						}, error => {
							done(error, email);
						});
					}catch (error) {
						done(error, email);
					}
					
				},
				// send out talent project creation email
				function(email, done) {

					if(typeof project.talent !== 'undefined'){

						let talentIds = [],
							emailTalentChk;
							
						for(const i in project.talent) {
							talentIds[i] = project.talent[i].talentId;
						}
						Talent.where('_id').in(talentIds).sort('-created').then(function (talents) {

							async.eachSeries(talents, function (talent, talentCallback) {

								// write change to log
								let log = {
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
									for(const j in project.talent) {
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

						if(typeof project.client !== 'undefined' && project.client.length === 0){
							for(const i in project.client) {

								// write change to log
								let log = {
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
					if(typeof project.client !== 'undefined' && project.client.length === 0){

						// set project phase status
						project.phases[2].status = 'Waiting For Clients to Be Added';

						// gen project note
						let discussion = 'Project phase ' + project.phases[2].name + ' status changed to ' + project.phases[2].status + ' on ' + moment().tz('America/New_York').format() + ' EST by ' + req.user.displayName,
							item = {
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
					// clear version
                    delete project.__v;
					project.save().then(function (newProject) {
						// write change to log
						let log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' project created',
							user: req.user
						};
						log = new Log(log);
						log.save();

						// emit an event for all connected clients
						return res.jsonp(newProject);
					}).catch(function (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					});
				
				},
				], function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
			});

		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	} else {
		return res.status(403).send({
			message: errorHandler.getErrorMessage('User is not authorized')
		});
	}
};

/**
 * Update a Project
 */
exports.update = function(req, res) {
	let project = req.project,
		appDir = global.appRoot;

	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (radash.intersects(req.user.roles, allowedRoles)) {

		project = Object.assign(project , req.body);

		async.waterfall([
			// rename files as requested
			function(done) {

				for(const i in project.auditions) {
					if(typeof project.auditions[i] !== 'undefined' && typeof project.auditions[i].file !== 'undefined'){
						let file = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].file.name;
						let newFile = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].rename;

						// move file if exists
						if (fs.existsSync(file) && project.auditions[i].rename !== '') {

							// change stored file name
							project.auditions[i].file.name = project.auditions[i].rename;
							project.auditions[i].rename = '';

							fileFuncs.moveFile(file, newFile);

							project.markModified('auditions');

						}
					}
				}

				done();
			},
			// delete any files no longer in use
			function(done) {

				for(const i in project.deleteFiles) {
					let file = appDir + '/public' + project.deleteFiles[i];

					// remove file if exists
					if (fs.existsSync(file)) {
						fs.unlinkSync(file, (err) => {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							}
						});
					}

					// remove file from delete queue
					project.deleteFiles.splice(i, 1);
				}

				done();
			},
			function(done) {
				// clear version
				delete project.__v;
				project.save().then(function (upproject) {

					// write change to log
					let log = {
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
	let project = req.project,
		prodId = Object.create(project._id),
		appDir = global.appRoot + '/public',
		auditionsDir = appDir + '/res/auditions/' + project._id + '/',
		scriptsDir = appDir + '/res/scripts/' + project._id + '/',
		referenceFilesDir = appDir + '/res/referenceFiles/' + project._id + '/';

	// remove all file if exists
	rimraf.sync(auditionsDir);
	rimraf.sync(scriptsDir);
	rimraf.sync(referenceFilesDir);

		// write change to log
	let log = {
		type: 'project',
		sharedKey: String(project._id),
		description: 'project deleted ' + project.title,
		user: req.user
	};
	log = new Log(log);
	log.save();

	project.deleteOne().then(function () {
		// remove all associated auditions
		Audition.deleteMany({project: prodId}).then(function () {
			return res.jsonp(project);
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
};

exports.deleteById = function(req, res) {

	Project.findById(req.body.projectId).then(function (project) {
		if(project){

			// generate delete files list
			let appDir = global.appRoot + '/public',
				auditionsDir = appDir + '/res/auditions/' + project._id + '/',
				scriptsDir = appDir + '/res/scripts/' + project._id + '/',
				referenceFilesDir = appDir + '/res/referenceFiles/' + project._id + '/';

			// remove all file if exists
			rimraf.sync(auditionsDir);
			rimraf.sync(scriptsDir);
			rimraf.sync(referenceFilesDir);

			// write change to log
			let log = {
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