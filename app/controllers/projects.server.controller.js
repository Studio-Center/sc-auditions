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
	// set date and timezone
	moment = require('moment-timezone'),
	now = new Date();

exports.sendEmail = function(req, res){

	// ensure email body is not blank
	if(typeof req.body.email !== 'undefined'){

		// gather admin and producers emails to include in send
		async.waterfall([
			function(done) {
				User.find({'roles':'admin'}).sort('-created').exec(function(err, admins) {
					done(err, admins);
				});
			},
			function(admins, done) {
				User.find({'roles':'producer/auditions director'}).sort('-created').exec(function(err, directors) {
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
				    cc: 'audition­\-notification@studiocenter.com',
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
				//if (err) return console.log(err);
		});

	}
};

var emailTalent = function(selTalent, talentInfo, email, project, req, res){

	async.waterfall([
		function(done) {
			var ownerId = project.owner || project.user._id;
			User.findOne({'_id':ownerId}).sort('-created').exec(function(err, owner) {
				if(err){
					done(err, req.user);
				} else {
					owner = owner || req.user;
					done(err, owner);
				}
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
			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));
			var emailSubject = '';
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			var nameArr = [];

			nameArr = talentInfo.name.split(' ');

			// assign email subject line
			if(selTalent.requested === true){
				emailSubject = nameArr[0] + ' has a REQUESTED Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
			} else {
				emailSubject = nameArr[0] + ' has an Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
			}

			var mailOptions = {
				to: talentInfo.email,
				from: owner.email || config.mailer.from,
				replyTo: owner.email || config.mailer.from,
				cc: 'audition­\-notification@studiocenter.com',
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
				}
				log = new Log(log);
				log.save();

				done(err);
			});
		},
		], function(err) {
		//if (err) return console.log(err);
	});

};

var sendTalentEmail = function(req, res, project, talent, override){

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Talent.findOne({'_id':talent.talentId}).sort('-created').exec(function(err, talentInfo) {
				done(err, talentInfo);
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
					//console.log(project.talent[i].status);
					if(talentInfo.type.toLowerCase() === 'email' || override === true){
						project.talent[i].status = 'Emailed';
					}
					//console.log(project.talent[i].status);
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
			if(typeof req.body.project.log !== 'undefined'){
				var log = req.body.project.log;
				log.user = req.user;

				log = new Log(log);
				log.save();

				// also senf log for prohect if talent log attribute
				if(log.type === 'talent'){
					log = log.toObject();

					log.type = 'project';
					log.sharedKey = String(req.body.project._id);

					log = new Log(log);
					log.save();
				}
			}

			Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				
				project = _.extend(project, newProject);

				req.project = project;

				project.save(function(err) {
					if (err) {
						done(err);
					} else {

						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
						res.json(project);
					}
				});			

			});


		}
		], function(err) {
		if (err) {
			if (err) {
				return res.json(400, err);
			} else {
				return res.json(200);
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
	Project.findOne({'_id':projectId}).sort('-created').exec(function(err, project) {

		// walk through and email all selected clients
		async.eachSeries(talents, function (selTalent, callback) {

			Talent.findOne({'_id':selTalent.talentId}).sort('-created').exec(function(err, talentInfo) {

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
								User.findOne({'_id':ownerId}).sort('-created').exec(function(err, owner) {
									if(err){
										done(err, req.user);
									} else {
										owner = owner || req.user;
										done(err, owner);
									}
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
									talent: talentInfo
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
									cc: 'audition­\-notification@studiocenter.com',
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
									}
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
				console.log(err);
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

// gather project data
exports.getproject = function(req, res){

	Project.findById(req.body.id).populate('user', 'displayName').exec(function(err, project) {
		if (err) {
			return res.json(400, err);
		} else {
			res.jsonp(project);
		}
	});

};

// send talent project start email
exports.sendTalentEmail = function(req, res){

	var project = req.body.project;
	var talent = req.body.talent;
	var override = req.body.override || false;

	sendTalentEmail(req, res, project, talent, override);	

};

exports.sendTalentEmailById = function(req, res){

	var projectId = req.body.projectId;
	var talent = req.body.talent;
	var override = req.body.override || false;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').exec(function(err, project) {
				done(err, project);
			});
		},
		function(project, done) {
			project = project.toObject();
			sendTalentEmail(req, res, project, talent, override);	
		}
		], function(err) {
		if (err) {
			return res.json(400, err);
		} else {
			return res.json(200);
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
			Project.findOne({'_id':projectId}).sort('-created').exec(function(err, project) {
				done(err, project);
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
					}
					log = new Log(log);
					log.save();

					done('', project);
				}
			}

		},
		// email selected talent
		function(project, done){

			var newProject = project.toObject();

			Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				
				project = _.extend(project, newProject);

				req.project = project;

				project.save(function(err) {
					var socketio = req.app.get('socketio');
					socketio.sockets.emit('projectUpdate', {id: project._id}); 
					socketio.sockets.emit('callListUpdate', {filter: ''}); 

					done(err);
				});			

			});

		}
		], function(err) {
		if (err) {
			return res.json(400, err);
		} else {
			
			return res.json(200);
		}
	});
};

// update talent status
exports.updateTalentStatus = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'production coordinator','client','client-client'];

	// validate user interaction
	if (_.intersection(req.user.roles, allowedRoles).length) {

		var project = req.body.project;

		Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {

			project = _.extend(project, req.body.project);

			req.project = project ;

			project.save(function(err) {
				if (err) {
					return res.json(400, err);
				} else {
					var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
					res.json(200);
				}
			});	

		});

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
			Project.findOne({'_id':projectId}).sort('-created').exec(function(err, project) {
				done(err, project);
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

			Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				
				project = _.extend(project, newProject);

				req.project = project;

				project.save(function(err) {

					var socketio = req.app.get('socketio');
					socketio.sockets.emit('projectUpdate', {id: project._id}); 
					socketio.sockets.emit('callListUpdate', {filter: ''}); 

					done(err);
				});			

			});

		}
		], function(err) {
		if (err) {
			return res.json(400, err);
		} else {
			
			return res.json(200);
		}
	});

};

// update talent status
exports.updateNoRefresh = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'production coordinator','client','client-client'];

	// validate user interaction
	if (_.intersection(req.user.roles, allowedRoles).length) {

		// write change to log
		if(typeof req.body.project.log !== 'undefined'){
			var log = req.body.project.log;
			log.user = req.user;

			log = new Log(log);
			log.save();

			// also senf log for prohect if talent log attribute
			if(log.type === 'talent'){
				log = log.toObject();

				log.type = 'project';
				log.sharedKey = String(req.body.project._id);

				log = new Log(log);
				log.save();
			}
		}

		var project = req.body.project;

		Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {

			project = _.extend(project, req.body.project);

			req.project = project;

			project.save(function(err) {
				if (err) {
					return res.json(400, err);
				} else {
					var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 

					res.jsonp(project);
				}
			});	

		});

	}

};

// convert number to word
var a = ['','First ','Second ','Third ','Fourth ', 'Fifth ','Sixth ','Seventh ','Eighth ','Ninth ','Tenth ','Eleventh ','Twelfth ','Thirteenth ','Fourteenth ','Fifteenth ','Sixteenth ','Seventeenth ','Eighteenth ','Nineteenth '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) : '';
    str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) : '';
    str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]])  : '';
    str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
    str += (n[5] !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
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
	User.where('_id').in(clientIds).sort('-created').exec(function(err, foundClients) {

		// walk through and email all selected clients
		async.eachSeries(foundClients, function (foundClient, callback) {

			// wrap in anonymous function to preserve client values per iteration
			var curClient = foundClient;

			var client = {name: curClient.displayName};

			async.waterfall([
				function(done) {
					var ownerId = req.body.project.owner || req.body.project.user._id;
					User.findOne({'_id':ownerId}).sort('-created').exec(function(err, owner) {
						if(err){
							done(err, '');
						} else {
							done(err, owner);
						}
					});
				},
				function(owner, done) {
					User.find({'roles':'producer/auditions director'}).sort('-created').exec(function(err, directors) {
						done(err, owner, directors);
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
										cc: 'audition­\-notification@studiocenter.com',
										bcc: bccList || config.mailer.from,
										subject: emailSubject,
										html: clientEmailHTML
									};

					transporter.sendMail(mailOptions, function(){
						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(req.body.project._id),
							description: 'client ' + curClient.displayName + ' sent ' + type + ' email ' + req.body.project.title,
							user: req.user
						}
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

	// build email
	var emailBody = 'First Name: ' + req.body.firstName + '\n';
	emailBody += 'Last Name: ' + req.body.lastName + '\n';
	emailBody += 'Company: ' + req.body.company + '\n';
	emailBody += 'Phone: ' + req.body.phone + '\n';
	emailBody += 'Email: ' + req.body.email + '\n';
	emailBody += 'Description: ' + req.body.describe + '\n';

	//var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
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
	    to: 'scripts@studiocenter.com',
	    cc: 'audition­\-notification@studiocenter.com',
	    subject: 'Start a new Audition Project Form Submission',
	    text: emailBody,
	    attachments: attachements
	});

	// write change to log
	var log = {
		type: 'system',
		sharedKey: String(req.user._id) || 'N/A',
		description: 'new project lead submitted by ' + req.body.firstName + ' ' + req.body.lastName,
		user: req.user
	}
	log = new Log(log);
	log.save();

	return res.status(200).send();
};

var emailClients = function(client, email, project, req, res){
		async.waterfall([
			function(done) {
				User.findOne({'_id':client.userId}).sort('-created').exec(function(err, clientInfo) {
					done(err, clientInfo);
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
									cc: 'audition­\-notification@studiocenter.com',
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
				}
				log = new Log(log);
				log.save();

			}
		], function(err) {
			//if (err) return console.log(err);
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

	// method vars
	var i, j;
	var project = new Project(req.body);
	project.user = req.user;

	var appDir = '';
    var tempPath = '';
    var relativePath =  '';
    var newPath = '';

	var allowedRoles = ['admin','producer/auditions director','production coordinator'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		// perform before save routines
		if(req.body.notifyClient === true){
			// create new project note stating client notified
			var discussionTxt = 'Client Notified of Project Start by ' + req.user.displayName;
			var item = {date: now.toJSON(), userid: '', username: 'system', item: discussionTxt, deleted: false};

			project.discussion.push(item);
		}

		//console.log(project._id);

		// move new saved files from temp to project id based directory
		if(typeof project.scripts !== 'undefined'){
			for(i = 0; i < project.scripts.length; ++i){
				if(typeof project.scripts[i] !== 'undefined'){
					appDir = path.dirname(require.main.filename);
				    tempPath = appDir + '/public/res/scripts/temp/' + project.scripts[i].file.name;
				    relativePath =  'res/scripts/' + project._id + '/';
				    newPath = appDir + '/public/' + relativePath;

				    // create project directory if not found
				    if (!fs.existsSync(newPath)) {
				    	fs.mkdirSync(newPath);
				    }

				    // add file path
				    newPath += project.scripts[i].file.name;

				    moveFile(tempPath, newPath);
				}
			}
		}
		if(typeof project.referenceFiles !== 'undefined'){
			for(j = 0; j < project.referenceFiles.length; ++j){
				if(typeof project.referenceFiles[j] !== 'undefined'){
					appDir = path.dirname(require.main.filename);
				    tempPath = appDir + '/public/res/referenceFiles/temp/' + project.referenceFiles[j].file.name;
				    relativePath =  'res/referenceFiles/' + project._id + '/';
				    newPath = appDir + '/public/' + relativePath;

				    // create project directory if not found
				    if (!fs.existsSync(newPath)) {
				    	fs.mkdirSync(newPath);
				    }

				    // add file path
				    newPath += project.referenceFiles[j].file.name;

				    moveFile(tempPath, newPath);
				}
			}
		}

		// move copied ref and script files for re-auditioned projects
		if(req.body.status === 'ReAuditioned'){
			if(typeof req.body.copiedScripts !== 'undefined'){
				for(i = 0; i < req.body.copiedScripts.length; ++i){
					if(typeof req.body.copiedScripts[i] !== 'undefined'){
						appDir = path.dirname(require.main.filename);
					    tempPath = appDir + '/public/res/scripts/' + req.body.id + '/' + req.body.copiedScripts[i].file.name;
					    relativePath =  'res/scripts/' + project._id + '/';
					    newPath = appDir + '/public/' + relativePath;

					    // create project directory if not found
					    if (!fs.existsSync(newPath)) {
					    	fs.mkdirSync(newPath);
					    }

					    // add file path
					    newPath += req.body.copiedScripts[i].file.name;

					    moveFile(tempPath, newPath);

					    // add script file to project ref list
					    project.scripts.push(req.body.copiedScripts[i]);
					}
				}
			}
			if(typeof req.body.copiedReferenceFiles !== 'undefined'){
				for(j = 0; j < req.body.copiedReferenceFiles.length; ++j){
					if(typeof req.body.copiedReferenceFiles[j] !== 'undefined'){
						appDir = path.dirname(require.main.filename);
					    tempPath = appDir + '/public/res/referenceFiles/' + req.body.id + '/' + req.body.copiedReferenceFiles[j].file.name;
					    relativePath =  'res/referenceFiles/' + project._id + '/';
					    newPath = appDir + '/public/' + relativePath;

					    // create project directory if not found
					    if (!fs.existsSync(newPath)) {
					    	fs.mkdirSync(newPath);
					    }

					    // add file path
					    newPath += req.body.copiedReferenceFiles[j].file.name;

					    moveFile(tempPath, newPath);

					    // add ref file to project ref list
					    project.referenceFiles.push(req.body.copiedReferenceFiles[j]);
					}
				}
			}

			// update old project status
			Project.findById(req.body.id).exec(function(err, oldProject) {

				oldProject.status = 'ReAuditioned';

				oldProject.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						// emit an event for all connected clients
						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectsListUpdate'); // emit an event for all connected clients
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
					}
				});
			});

			// reset current project status
			project.status = 'In Progress';
		}

		// send project creation email
		async.waterfall([
			function(done) {
				User.find({'roles':'admin'}).sort('-created').exec(function(err, admins) {
					done(err, admins);
				});
			},
			function(admins, done) {
				User.find({'roles':'producer/auditions director'}).sort('-created').exec(function(err, directors) {
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
				var i;

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

				// // append default footer to email
				// email.footer =  'The ' + config.app.title + ' Support Team' + '<br>';
				// email.footer += 'To view your StudioCenterAuditions.com Home Page, visit:' + '<br>';
				// email.footer += 'http://' + req.headers.host;

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
					cc: 'audition­\-notification@studiocenter.com',
					from: req.user.email || config.mailer.from,
					replyTo: req.user.email || config.mailer.from,
					subject: email.subject,
					html: emailHTML
				};

				transporter.sendMail(mailOptions , function(err) {
					done(err, email);
				});
			},
			// send out talent project creation email
			function(email, done) {
				
				if(typeof project.talent !== 'undefined'){

					var talentIds = [];
					var emailTalentChk;
					for(var i = 0; i < project.talent.length; ++i){
						talentIds[i] = project.talent[i].talentId;						
					}

					Talent.where('_id').in(talentIds).sort('-created').exec(function(err, talents) {

						async.eachSeries(talents, function (talent, talentCallback) {

							// write change to log
							var log = {
								type: 'talent',
								sharedKey: String(talent._id),
								description: talent.name + ' ' + talent.lastName + ' added to project ' + project.title,
								user: req.user
							}
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
							}
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

				project.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' project created',
							user: req.user
						}
						log = new Log(log);
						log.save();

						// emit an event for all connected clients
						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectsListUpdate'); // emit an event for all connected clients
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
						return res.jsonp(project);
					}
				});
			},
			], function(err) {
			if (err) return console.log(err);
		});

	} else {
		return res.status(403).send('User is not authorized');
	}
};


/**
 * Show the current Project
 */
exports.read = function(req, res) {
	res.jsonp(req.project);
};


// remove file from local file system
var deleteFiles = function(project){
	
	var appDir = path.dirname(require.main.filename);

	for(var i = 0; i < project.deleteFiles.length; ++i){
		var file = appDir + '/public' + project.deleteFiles[i];

		// remove file if exists
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);

			// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' project file ' + project.deleteFiles[i] + ' deleted',
				user: req.user
			}
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
	var appDir = path.dirname(require.main.filename);
	var file = appDir + '/public' + req.body.file;

	// check if file exists
	if (fs.existsSync(file)) {
		return res.status(200).send();
	} else {
		return res.status(400).send();
	}

};

// handle remote file delete requests
exports.deleteFileByName = function(req, res){

	var appDir = path.dirname(require.main.filename);
	var file = appDir + '/public' + req.body.fileLocation;

	// remove file is exists
	if (fs.existsSync(file)) {
		fs.unlinkSync(file);
	}
};

// rename file from local file system
var renameFiles = function(project,res){
	
	var appDir = path.dirname(require.main.filename);

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
			}
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

	var allowedRoles = ['admin','producer/auditions director', 'production coordinator','client','client-client'];

	// validate user interaction
	if (_.intersection(req.user.roles, allowedRoles).length) {

		project = _.extend(project , req.body);

		async.waterfall([
			// rename files as requested
			function(done) {

				var appDir = path.dirname(require.main.filename);

				for(var i = 0; i < project.auditions.length; ++i){
					if(typeof project.auditions[i].file !== 'undefined'){
						var file = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].file.name;
						var newFile = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].rename;

						// move file is exists
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

				var appDir = path.dirname(require.main.filename);

				for(var i = 0; i < project.deleteFiles.length; ++i){
					var file = appDir + '/public' + project.deleteFiles[i];

					// remove file is exists
					if (fs.existsSync(file)) {
						fs.unlinkSync(file);
					}

					// remove file from delete queue
					project.deleteFiles.splice(i, 1);
				}

				done();
			},
			function(done) {
				project.save(function(err) {
					if (err) {
						done(err);
					} else {

						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' project updated',
							user: req.user
						}
						log = new Log(log);
						log.save();

						// update connected clients
						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 

						return res.jsonp(project);
					}
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
                    fs.unlink(file, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb();
                    });
                }
            });
        });
    });
};

/**
 * Delete an Project
 */
exports.delete = function(req, res) {
	var project = req.project;

	// generate delete files list
	var appDir = path.dirname(require.main.filename) + '/public';
	var auditionsDir = appDir + '/res/auditions/' + project._id + '/';
	var scriptsDir = appDir + '/res/scripts/' + project._id + '/';
	var referenceFilesDir = appDir + '/res/referenceFiles/' + project._id + '/';

	// remove all file if exists
	rimraf.sync(auditionsDir);
	rimraf.sync(scriptsDir);
	rimraf.sync(referenceFilesDir);

	project.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// emit an event for all connected clients
			var socketio = req.app.get('socketio');
			socketio.sockets.emit('projectsListUpdate'); 
			return res.jsonp(project);
		}
	});
};

exports.deleteById = function(req, res) {

	Project.findById(req.body.projectId).exec(function(err, project) {
		if (err) return console.log(err);
		if(project){

			// generate delete files list
			var appDir = path.dirname(require.main.filename) + '/public';
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
			}
			log = new Log(log);
			log.save();

			project.remove(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							return res.jsonp(projects);
						}
					});
				}
			});
		}

	});
	
};

// list projects assigned to talent
exports.getTalentFilteredProjects = function(req, res){

	var dayAgo = new Date();
	dayAgo.setDate(dayAgo.getDay() - 1);

	var searchCriteria = {'talent': { 
									$elemMatch: { 
										'talentId': req.body.talentId
									} 
								}
						};

	if(req.body.archived === true){
		Project.find(searchCriteria).sort('-created').populate('project', 'displayName').exec(function(err, projects) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp(projects);
			}
		});
	} else {
		Project.find(searchCriteria).where('estimatedCompletionDate').gt(dayAgo).sort('-created').populate('project', 'displayName').exec(function(err, projects) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp(projects);
			}
		});
	} 
	
};

/**
 * List of Projects
 */
var performLoadList = function(req, res, allowedRoles, i, j){

	var curUserId = String(req.user._id);

	if(req.user.roles[i] === allowedRoles[j]){

		switch(allowedRoles[j]){
			case 'user':
				Project.find({'user._id': curUserId}).sort('-created').populate('user', 'displayName').exec(function(err, projects) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						return res.jsonp(projects);
					}
				});
			break;
			case 'talent':
			// talent does not currently have access, added to permit later access
				Project.find({'talent': { $elemMatch: { 'talentId': curUserId}}}).sort('-created').populate('user', 'displayName').exec(function(err, projects) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						return res.jsonp(projects);
					}
				});
			break;
			case 'client':
				Project.find({'client': { $elemMatch: { 'userId': curUserId}}}).sort('-created').populate('user', 'displayName').exec(function(err, projects) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						//console.log(projects);
						return res.jsonp(projects);
					}
				});
			break;
			case 'client-client':
				//console.log(curUserId);
				Project.find({'clientClient': { $elemMatch: { 'userId': curUserId}}}).sort('-created').populate('user', 'displayName').exec(function(err, projects) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						return res.jsonp(projects);
					}
				});						
			break;
		}

	}
};

exports.findLimit = function(req, res) { 

	var limit = req.body.queryLimit;

	Project.find().sort('-created').populate('user', 'displayName').limit(limit).exec(function(err, projects) {
		if (err) {
			//console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			return res.jsonp(projects);
		}
	});

};
exports.list = function(req, res) { 

	// permit certain user roles full access
	var allowedRoles = ['admin','producer/auditions director', 'production coordinator','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
			if (err) {
				//console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp(projects);
			}
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
exports.projectByID = function(req, res, next, id) { Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
		if (err) return next(err);
		if (! project) return next(new Error('Failed to load Project '));
		req.project = project ;
		next();
	});
};

/**
 * Project authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// recon 2/17/2015 to allow admin and producer level users to edit all projects
	var allowedRoles = ['admin','producer/auditions director', 'production coordinator'];

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
    //console.log(file.name);
    //console.log(file.type);
    var project = JSON.parse(req.body.data);

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;

    var relativePath =  'res' + '/' + project.project._id + '/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file to path
    newPath += file.name;

    //console.log(newPath);

    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            return res.status(500).end();
        }else{

        	// write change to log
			var log = {
				type: 'project',
				sharedKey: String(project._id),
				description: project.title + ' file uploaded ' + file.name,
				user: req.user
			}
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
    //console.log(req.files);
    //console.log(file.name);
    //console.log(file.type);

    var project = JSON.parse(req.body.data);
    project = project.project;

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'scripts' + '/' + project._id + '/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    //console.log(file.name);
    newPath += file.name;

    //console.log(newPath);
    
    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            return res.status(500).end();
        }else{
        	Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				if (err) return next(err);
				if (! project) return next(new Error('Failed to load Project '));
				req.project = project ;

				var script = {
								file: req.files.file, 
								by: {
									userId: req.user._id,
									date: now.toJSON(), 
									name: req.user.displayName
								}
							};

				// assign script object to body
				project.scripts.push(script);

				project = _.extend(req.project, project);

				project.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' script uploaded ' + file.name,
							user: req.user
						}
						log = new Log(log);
						log.save();

						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
						return res.jsonp(project);
					}
				});
			});
            //res.status(200).end();
        }
    });
};

// file upload
exports.uploadReferenceFile = function(req, res, next){
	// We are able to access req.files.file thanks to 
    // the multiparty middleware
    var file = req.files.file;
    //console.log(req.files);
    //console.log(file.name);
    //console.log(file.type);

    var project = JSON.parse(req.body.data);
    project = project.project;

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'referenceFiles' + '/' + project._id + '/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    //console.log(file.name);
    newPath += file.name;

    //console.log(newPath);
    
    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            return res.status(500).end();
        }else{
        	Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				if (err) return next(err);
				if (! project) return next(new Error('Failed to load Project '));
				req.project = project ;

				var referenceFile = {
							file: req.files.file,
							by: {
								userId: req.user._id,
								date: now.toJSON(), 
								name: req.user.displayName
							}
							};

				// assign script object to body
				project.referenceFiles.push(referenceFile);

				project = _.extend(req.project, project);

				project.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' reference file uploaded ' + file.name,
							user: req.user
						}
						log = new Log(log);
						log.save();

						var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
						return res.jsonp(project);
					}
				});
			});
            //res.status(200).end();
        }
    });
};

exports.uploadTempReferenceFile = function(req, res, next){
	// We are able to access req.files.file thanks to 
    // the multiparty middleware
    var file = req.files.file;
    //console.log(file.name);
    //console.log(file.type);

    var referenceFiles = [];

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'referenceFiles' + '/temp/';
    var newPath = appDir + '/public/' + relativePath;

    // add file path
    newPath += file.name;

    //console.log(newPath);
    var referenceFile = {
    				file: req.files.file,
    				by: {
							userId: req.user._id,
							date: now.toJSON(), 
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
    //console.log(file.name);
    //console.log(file.type);

    var scripts = [];

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'scripts' + '/temp/';
    var newPath = appDir + '/public/' + relativePath;

    // add file path
    newPath += file.name;

    //console.log(newPath);
    var script = {
					file: req.files.file,
					userId: req.user._id,
					date: now.toJSON(), 
					name: req.user.displayName
				};

	scripts.push(script);

    mv(tempPath, newPath, function(err) {
        if (err){
            return res.status(500).end();
        }else{
            return res.jsonp(scripts);
        }
    });
};

// file upload
exports.uploadAudition = function(req, res, next){

	// method vars
	var audTalent = '';
	var firstName = '';
	var lastNameCode = '';

	// We are able to access req.files.file thanks to 
    // the multiparty middleware
    var file = req.files.file;
    //console.log(file.name);
    //console.log(file.type);

    var project = JSON.parse(req.body.data);
    project = project.project;

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'auditions' + '/' + project._id + '/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += file.name;
    //console.log(newPath);

    // strip talent name and last name code from audition
    var regStr = /([a-zA-Z]+)\.\w{3}$/i.exec(file.name);
    if(regStr !== null){
		var regStrOP = regStr[1];

		var lastNm = /([A-Z])[a-z]*$/.exec(regStrOP);
		if(lastNm !== null){
			var lastNmPos = lastNm.index;

			firstName = regStrOP.slice(0,lastNmPos);
			lastNameCode = regStrOP.slice(lastNmPos, regStrOP.length);
		}
	}

    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            res.status(500).end();
        }else{
        	Talent.findOne({'name': new RegExp('^'+firstName+'$', 'i'), 'lastNameCode': new RegExp('^'+lastNameCode+'$', 'i')}).sort('-created').exec(function(err, talent) {

	            Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
					if (err) return next(err);
					if (! project) return next(new Error('Failed to load Project '));
					req.project = project ;

					// walk through project talent, look for existing assignment
					async.eachSeries(project.talent, function (curTalent, talentCallback) {
						if(talent !== null){
							if(String(talent._id) === curTalent.talentId){
								audTalent = curTalent.talentId;

								project.talent[project.talent.indexOf(curTalent)].status = 'Posted';

								project.markModified('talent');

								talentCallback();
							} else {
								talentCallback();
							}
						} else {
							talentCallback();
						}
					}, function (err) {
						
						var audition = {
								file: req.files.file, 
								discussion: [], 
								description: '',
								rating: [], 
								published: true,
								rename: '',
								avgRating: 0,
								favorite: 0,
								talent: audTalent,
								approved: 
										{
											by: 
											{
												userId: req.user._id,
												date: now.toJSON(), 
												name: req.user.displayName
											}
										}
								};

						// write change to log
						var log = {
							type: 'project',
							sharedKey: String(project._id),
							description: project.title + ' audition uploaded ' + file.name,
							user: req.user
						}
						log = new Log(log);
						log.save();

						// send audition data to client
						return res.jsonp(audition);

						// //console.log(audition);
						// // assign script object to body
						// project.auditions.push(audition);

						// project = _.extend(req.project, project.toObject());

						// project.save(function(err) {
						// 	if (err) {
						// 		return res.status(400).send({
						// 			message: errorHandler.getErrorMessage(err)
						// 		});
						// 	} else {

						// 		// write change to log
						// 		var log = {
						// 			type: 'project',
						// 			sharedKey: String(project._id),
						// 			description: project.title + ' audition uploaded ' + file.name,
						// 			user: req.user
						// 		}
						// 		log = new Log(log);
						// 		log.save();

						// 		var socketio = req.app.get('socketio');
						// 		socketio.sockets.emit('projectUpdate', {id: project._id}); 
						// 		socketio.sockets.emit('callListUpdate', {filter: ''}); 
						// 		return res.jsonp(project);
								
						// 	}
						// });

				   	});
					
				});

			});
            //res.status(200).end();
        }
    });

};

// audition temp file upload
exports.uploadTempAudition = function(req, res, next){
	// We are able to access req.files.file thanks to 
    // the multiparty middleware
    var file = req.files.file;
    //console.log(file.name);
    //console.log(file.type);

    var project = JSON.parse(req.body.data);
    project = project.project;

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'auditions' + '/temp/';
    var newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += file.name;

    //console.log(newPath);

    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            res.status(500).end();
        }else{
            
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
										date: now.toJSON(), 
										name: ''
									}
								}
			};

			return res.jsonp(audition);
			
        }
    });

};

exports.downloadAllAuditions = function(req, res, next){
	// get app dir
	var appDir = path.dirname(require.main.filename);
	var relativePath =  'res' + '/' + 'auditions' + '/' + req.body.project._id + '/';
    var newPath = appDir + '/public/' + relativePath;
    var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
    var zipName = req.body.project.title + '.zip';
    var newZip = savePath + zipName;

    //console.log(newPath);

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
	var projectTitle = req.body.projectTitle;
	var bookedAuds = req.body.bookedAuds;

	// get app dir
	var appDir = path.dirname(require.main.filename);
	var relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/';
    var newPath = appDir + '/public/' + relativePath;
    var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
    var zipName = projectTitle + '.zip';
    var newZip = savePath + zipName;

    //console.log(newPath);

    var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
	  res.jsonp({zip:zipName});
	});

    // add all booked auditions
    for(var i = 0; i < bookedAuds.length; ++i){
    	archive.file(newPath + bookedAuds[i], { name:bookedAuds[i] });
    }

    archive.pipe(output);

    archive.finalize();

};


exports.downloadSelectedAuditions = function(req, res, next){

	// method vars
	var projectId = req.body.projectId;
	var projectTitle = req.body.projectTitle;
	var selAuds = req.body.selectedAuds;

	// get app dir
	var appDir = path.dirname(require.main.filename);
	var relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/';
    var newPath = appDir + '/public/' + relativePath;
    var savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
    var zipName = projectTitle + '.zip';
    var newZip = savePath + zipName;

    //console.log(newPath);

    var output = fs.createWriteStream(newZip);
	var archive = archiver('zip');

	output.on('close', function() {
	  res.jsonp({zip:zipName});
	});

    // add all booked auditions
    for(var i = 0; i < selAuds.length; ++i){
    	archive.file(newPath + selAuds[i], { name:selAuds[i] });
    }

    archive.pipe(output);

    archive.finalize();

};
// send email and update project status for selected booked auditions
exports.bookAuditions = function(req, res, next){

	var projectId = req.body.data.project;
	var auditions = req.body.data.auditions;

	async.waterfall([
		// gather info for selected project
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').exec(function(err, project) {
				done(err, project);
			});
		},
		// update status for selected booked auditions
		function(project, done) {

			var selAuds = [];

			async.eachSeries(auditions, function (audition, auditionCallback) {
				for(var i = 0; i < project.auditions.length; ++i){
					if(audition === project.auditions[i].file.path){
						project.auditions[i].booked = true;
						selAuds.push(project.auditions[i]);
						auditionCallback();
					}
				}
			}, function (err) {
				done(err, selAuds, project);
		   	});
		},
		// update project
		function(selAuds, project, done) {

			var newProject = project.toObject();

			newProject.status = 'Booked';

			Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				
				project = _.extend(project, newProject);

				project.save(function(err) {
					var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 
					done(err, selAuds, project);
				});

			});
		},
		// gather client email, send out emails
		function(selAuds, project, done){

			var clients = [];

			async.eachSeries(project.client, function (client, clientCallback) {

				User.findOne({'_id':client.userId}).sort('-created').exec(function(err, clientInfo) {
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

			User.findOne({'_id':ownerId}).sort('-created').exec(function(err, ownerInfo) {
				done(err, ownerInfo, clientsEmails, selAuds, project);
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
				cc: [ownerInfo.email, 'audition­\-notification@studiocenter.com'],
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
			return res.json(400, err);
		} else {
			return res.json(200);
		}
	});
};

exports.backupProjectsById = function(req, res, next){

	// get app dir
	var appDir = path.dirname(require.main.filename);
    var archivesPath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var curDate = moment().format('MMM Do YY');
	var zippedFilename = 'Auditions Project Backup Bundle - ' + curDate + '.zip';
    var newZip = archivesPath + zippedFilename;
    var backupDir = archivesPath + req.user._id + '_backup';
    var auditionsDir, scriptsDir, referenceFilesDir, projectBuDir;
    
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

		Project.findById(projectId).populate('user', 'displayName').exec(function(err, project) {
			if (err) return next(err);
			if (! project) return next(new Error('Failed to load Project '));
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
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
	var archivesPath = appDir + '/public/' + 'res' + '/' + 'archives' + '/';
	var backupPath = archivesPath + 'backups/';
	var savePath = archivesPath + file.name;

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
							Project.findById(project._id).exec(function(err, delProject) {

								// generate delete files list
								var auditionsDir = appDir + '/public/' + '/res/auditions/' + project._id + '/';
								var scriptsDir = appDir + '/public/' + '/res/scripts/' + project._id + '/';
								var referenceFilesDir = appDir + '/public/' + '/res/referenceFiles/' + project._id + '/';

								// remove all file if exists
								rimraf.sync(auditionsDir);
								rimraf.sync(scriptsDir);
								rimraf.sync(referenceFilesDir);

								project.remove(function(err) {

									project.save(function(err) {

										// current file location
										auditionsBackupDir = parentPath + '/auditions/';
										scriptsBackupDir = parentPath + '/scripts/';
										referenceFilesBackupDir = parentPath + '/referenceFiles/';

										async.waterfall([
											function(done) {
												// check for associated media directories
												fs.exists(auditionsBackupDir, function(exists) {
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
											    fs.exists(scriptsBackupDir, function(exists) {
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
											    fs.exists(referenceFilesBackupDir, function(exists) {
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
							Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									return res.jsonp(projects);
								}
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
	var appDir = path.dirname(require.main.filename);
    var auditionsPath = appDir + '/public/' + 'res' + '/' + 'auditions' + '/' + 'temp' + '/';
    var talentUploadPath = appDir + '/public/' + 'res' + '/' + 'talentUploads' + '/' + project._id + '/';
    var talentUploadTalentPath = talentUploadPath + talentId + '/';

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
				tempPath = auditionsPath + audition.file.name;
				savePath = talentUploadTalentPath + audition.file.name;

				mv(tempPath, savePath, function(err) {

					// remove file if exists
					if (fs.existsSync(tempPath)) {
						fs.unlinkSync(tempPath);
					}

					auditionCallback(err);
				});

			}, function (err) {
				done(err);
		   	});

		},
		// reload project for most recent data
		function(done){
			Project.findById(project._id).exec(function(err, updatedProject) {
				done(err, updatedProject);
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

			Project.findById(project._id).exec(function(err, project) {

				project = _.extend(project, updatedProject.toObject());
				//console.log(updatedProject);

				project.save(function(err) {

					// write change to log
					var log = {
						type: 'project',
						sharedKey: String(project._id),
						description: project.title + ' talent audition uploaded ' + file.name,
						user: req.user
					}
					log = new Log(log);
					log.save();

					var socketio = req.app.get('socketio');
						socketio.sockets.emit('projectUpdate', {id: project._id}); 
						socketio.sockets.emit('callListUpdate', {filter: ''}); 

					done(err);

				});

			});

		}
		], function(err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.jsonp({'status':'success'});
			}
	});

};