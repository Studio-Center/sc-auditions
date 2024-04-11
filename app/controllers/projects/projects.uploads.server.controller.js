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
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	mv = require('mv'),
	unzip = require('unzip-wrapper'),
	sanitize = require("sanitize-filename"),
	moment = require('moment-timezone');


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
    