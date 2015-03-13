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
	nodemailer = require('nodemailer');

// process email submission
var procEmail = function(project, req){
	if(typeof project.email !== 'undefined'){
		// append default footer to email
		project.email.message += '\n' + 'The ' + config.app.title + ' Support Team' + '\n';
		project.email.message += '\n' + 'To view your StudioCenterAuditions.com Home Page, visit:' + '\n';
		project.email.message += 'http://' + req.headers.host + '\n';

		// send email
		var transporter = nodemailer.createTransport(config.mailer.options);
		transporter.sendMail({
		    from: config.mailer.from,
		    to: project.email.to,
		    subject: project.email.subject,
		    text: project.email.message
		});
	}

	// reset email object
	delete project.email;
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
				if(typeof project.scripts[0] !== 'undefined'){
					var appDir = path.dirname(require.main.filename);
				    var tempPath = appDir + '/public/res/scripts/temp/' + project.scripts[0].file.name;
				    var relativePath =  'res/scripts/' + project._id + '/';
				    var newPath = appDir + '/public/' + relativePath;

				    // create project directory if not found
				    if (!fs.existsSync(newPath)) {
				    	fs.mkdirSync(newPath);
				    }

				    // add file path
				    newPath += project.scripts[0].file.name;

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
			// send required emails as needed
			function(done) {
				if(typeof project.email !== 'undefined'){
					// append default footer to email
					project.email.message += '\n' + 'The ' + config.app.title + ' Support Team' + '\n';
					project.email.message += '\n' + 'To view your StudioCenterAuditions.com Home Page, visit:' + '\n';
					project.email.message += 'http://' + req.headers.host + '\n';

					// send email
					var transporter = nodemailer.createTransport(config.mailer.options);
					transporter.sendMail({
					    from: config.mailer.from,
					    to: project.email.to,
					    subject: project.email.subject,
					    text: project.email.message
					});
				}

				// reset email object
				delete project.email;
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

var removeFolder = function(location, next) {
    fs.readdir(location, function (err, files) {
        async.each(files, function (file, cb) {
            file = location + '/' + file
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
                    })
                }
            })
        }, function (err) {
            if (err) return next(err)
            fs.rmdir(location, function (err) {
                return next(err)
            })
        })
    })
}

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
		if(typeof project.auditions[i] !== 'undefined'){
			if(typeof project.auditions[i].file !== 'undefined'){
				project.deleteFiles[delFilesLn] = auditionsDir + project.auditions[i].file.name;
				delFilesLn++;
			}
		}
	}
	for(i = 0; i < project.scripts.length; ++i){
		if(typeof project.scripts[i] !== 'undefined'){
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
    //console.log(file.name);
    //console.log(file.type);

    var project = JSON.parse(req.body.data);

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'scripts' + '/' + project.project._id + '/';
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
            res.status(200).end();
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

    var project = JSON.parse(req.body.data);

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'scripts' + '/temp/';
    var newPath = appDir + '/public/' + relativePath;

    // add file path
    newPath += file.name;

    //console.log(newPath);

    mv(tempPath, newPath, function(err) {
        console.log(err);
        if (err){
            res.status(500).end();
        }else{
            res.status(200).end();
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

    //var file = req.files.file;
    var appDir = path.dirname(require.main.filename);
    var tempPath = file.path;
    var relativePath =  'res' + '/' + 'auditions' + '/' + project.project._id + '/';
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
            res.status(200).end();
        }
    });
};