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
	fs = require('fs'),
	config = require('../../config/config'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	nodemailer = require('nodemailer'),
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

				// append default footer to email
				email.message += '\n' + 'The ' + config.app.title + ' Support Team' + '\n';
				email.message += '\n' + 'To view your StudioCenterAuditions.com Home Page, visit:' + '\n';
				email.message += 'http://' + req.headers.host + '\n';

				// send email
				var transporter = nodemailer.createTransport(config.mailer.options);
				transporter.sendMail({
				    from: config.mailer.from,
				    to: email.to,
				    bcc: bcc,
				    subject: email.subject,
				    text: email.message
				});
			},
			], function(err) {
			if (err) return next(err);
		});

	}
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

	// send email
	var transporter = nodemailer.createTransport(config.mailer.options);
	transporter.sendMail({
	    from: config.mailer.from,
	    to: 'rob@studiocenter.com',
	    subject: 'Start a new Audition Project Form Submission',
	    text: emailBody
	});

};

/**
 * Create a Project
 */
exports.create = function(req, res) {
	var project = new Project(req.body);
	project.user = req.user;

	var allowedRoles = ['admin','producer/auditions director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {
		project.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(project);

				// move new saved files from temp to project id based directory
				if(typeof project.scripts !== 'undefined'){
					for(var i = 0; i < project.scripts.length; ++i){
						if(typeof project.scripts[i] !== 'undefined'){
							var appDir = path.dirname(require.main.filename);
						    var tempPath = appDir + '/public/res/scripts/temp/' + project.scripts[i].file.name;
						    var relativePath =  'res/scripts/' + project._id + '/';
						    var newPath = appDir + '/public/' + relativePath;

						    // create project directory if not found
						    if (!fs.existsSync(newPath)) {
						    	fs.mkdirSync(newPath);
						    }

						    // add file path
						    newPath += project.scripts[i].file.name;

						    mv(tempPath, newPath, function(err) {
						        //console.log(err);
						        if (err){
						            res.status(500).end();
						        }else{
						            res.status(200).end();
						        }
						    });
						}
					}
				}
				if(typeof project.referenceFiles !== 'undefined'){
					for(var j = 0; j < project.referenceFiles.length; ++j){
						if(typeof project.referenceFiles[j] !== 'undefined'){
							var appDir = path.dirname(require.main.filename);
						    var tempPath = appDir + '/public/res/referenceFiles/temp/' + project.referenceFiles[j].file.name;
						    var relativePath =  'res/referenceFiles/' + project._id + '/';
						    var newPath = appDir + '/public/' + relativePath;

						    // create project directory if not found
						    if (!fs.existsSync(newPath)) {
						    	fs.mkdirSync(newPath);
						    }

						    // add file path
						    newPath += project.referenceFiles[j].file.name;

						    mv(tempPath, newPath, function(err) {
						        //console.log(err);
						        if (err){
						            res.status(500).end();
						        }else{
						            res.status(200).end();
						        }
						    });
						}
					}
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
										message: ''
									};
						var i, to = [];

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

						// add clients to email list
						if(typeof project.talent !== 'undefined'){
							for(i = 0; i < project.talent.length; ++i){
								to.push(project.talent[i].email);
							}
						}

						// add clients to email list
						if(typeof project.client !== 'undefined'){
							for(i = 0; i < project.client.length; ++i){
								to.push(project.client[i].email);
							}
						}

						email.subject = project.title + ' project created';
					    email.message = 'Project: ' + project.title + '\n';
					    email.message += 'Description: ' + project.description + '\n';
					    email.message += 'Added by: ' + req.user.displayName + '\n';

						// add scripts and assets to email body
						if(typeof project.scripts !== 'undefined'){
							email.message += '\n' + 'Scripts:' + '\n';
							for(i = 0; i < project.scripts.length; ++i){
								email.message += 'http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '\n';
							}
						}
						if(typeof project.referenceFiles !== 'undefined'){
							email.message += '\n' + 'Reference Files:' + '\n';
							for(var j = 0; j < project.referenceFiles.length; ++j){
								email.message += 'http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '\n';
							}
						}

						// append default footer to email
						email.message += '\n' + 'The ' + config.app.title + ' Support Team' + '\n';
						email.message += '\n' + 'To view your StudioCenterAuditions.com Home Page, visit:' + '\n';
						email.message += 'http://' + req.headers.host + '\n';

						// send email
						var transporter = nodemailer.createTransport(config.mailer.options);
						transporter.sendMail({
						    from: config.mailer.from,
						    to: to,
						    bcc: bcc,
						    subject: email.subject,
						    text: email.message
						});
					},
					], function(err) {
					if (err) return next(err);
				});

			}
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

		// remove file is exists
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
		}

		// remove file from delete queue
		project.deleteFiles.splice(i, 1);
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

		// move file is exists
		if (fs.existsSync(file) && project.auditions[i].rename !== '') {
			mv(file, newFile, function(err) {
		        if (err){
		            res.status(500).end();
		        }else{
		            res.status(200).end();
		        }
		    });

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

							mv(file, newFile, function(err) {
								if (err){
						            done(err);
						        }
						    });

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
						res.jsonp(project);
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
	var delFilesLn = project.deleteFiles.length || 0;
	var i;
	var appDir = path.dirname(require.main.filename) + '/public';
	var auditionsDir = '/res/auditions/' + project._id + '/';
	var scriptsDir = '/res/scripts/' + project._id + '/';

	for(i = 0; i < project.auditions.length; ++i){
		if(typeof project.auditions[i] !== 'undefined' && project.auditions[i] !== null){
			if(typeof project.auditions[i].file !== 'undefined'){
				project.deleteFiles[delFilesLn] = auditionsDir + project.auditions[i].file.name;
				delFilesLn++;
			}
		}
	}
	for(i = 0; i < project.scripts.length; ++i){
		if(typeof project.scripts[i] !== 'undefined' && project.scripts[i] !== null){
			if(typeof project.scripts[i].file !== 'undefined'){
				project.deleteFiles[delFilesLn] = scriptsDir + project.scripts[i].file.name;
				delFilesLn++;
			}
		}
	}

	// delete found files
	deleteFiles(project);

	// remove auditions and scripts directories is exists
	if (fs.existsSync(appDir + auditionsDir)) {
		removeFolder(appDir + auditionsDir);
	}
		if (fs.existsSync(appDir + scriptsDir)) {
		removeFolder(appDir + scriptsDir);
	}


	project.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(project);
		}
	});
};

/**
 * List of Projects
 */
exports.list = function(req, res) { 

	// permit certain user roles full access
	var allowedRoles = ['admin','producer/auditions director', 'production coordinator','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {

		Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(projects);
			}
		});

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];
		var curUserId = String(req.user._id);

		for(var i = 0; i < req.user.roles.length; ++i){
			for(var j = 0; j < allowedRoles.length; ++j){
				if(req.user.roles[i] === allowedRoles[j]){

					switch(allowedRoles[j]){
						case 'user':
							Project.find({'user._id': curUserId}).sort('-created').populate('user', 'displayName').exec(function(err, projects) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									res.jsonp(projects);
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
									res.jsonp(projects);
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
									res.jsonp(projects);
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
									res.jsonp(projects);
								}
							});						
						break;
					}

				}
			}
		}

	}
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) { Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
		if (err) return next(err);
		if (! project) return next(new Error('Failed to load Project ' + id));
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
            res.status(500).end();
        }else{
            res.status(200).end();
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
            res.status(500).end();
        }else{
        	Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				if (err) return next(err);
				if (! project) return next(new Error('Failed to load Project ' + id));
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
						res.jsonp(project);
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
            res.status(500).end();
        }else{
        	Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				if (err) return next(err);
				if (! project) return next(new Error('Failed to load Project ' + id));
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
						res.jsonp(project);
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
            res.status(500).end();
        }else{
            res.jsonp(referenceFiles);
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
            res.status(500).end();
        }else{
            res.jsonp(scripts);
        }
    });
};

// file upload
exports.uploadAudition = function(req, res, next){
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

    mv(tempPath, newPath, function(err) {
        //console.log(err);
        if (err){
            res.status(500).end();
        }else{
            Project.findById(project._id).populate('user', 'displayName').exec(function(err, project) {
				if (err) return next(err);
				if (! project) return next(new Error('Failed to load Project ' + id));
				req.project = project ;

				var audition = {
							file: req.files.file, 
							discussion: [], 
							description: '',
							rating: [], 
							published: false,
							rename: '',
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
				//console.log(audition);
				// assign script object to body
				project.auditions.push(audition);

				project = _.extend(req.project, project);

				project.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.jsonp(project);
					}
				});
			});
            //res.status(200).end();
        }
    });
};