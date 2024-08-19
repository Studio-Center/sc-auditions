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
	async = require('async'),
	mv = require('mv'),
	unzip = require('unzip-wrapper'),
	sanitize = require("sanitize-filename"),
	moment = require('moment-timezone'),
    fileFuncs = require('./classes/files.class');


// file upload
exports.uploadFile = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    let file = req.files.file,
        project = JSON.parse(req.body.data),
        appDir = global.appRoot,
        tempPath = file.path;

    // check for passenger buffer file location
    let passDir = '/usr/share/passenger/helper-scripts/public/res/' + project.project._id + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }

    let relativePath =  'res/' + project.project._id + '/',
        newPath = appDir + '/public/' + relativePath;

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file to path
    newPath += sanitize(file.name);

    mv(tempPath, newPath, function(err) {

		if (err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{

        	// write change to log
			let log = {
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
    let file = req.files.file,
        recBody = JSON.parse(req.body.data),
        projectId = recBody.projectId,
        appDir = global.appRoot,
        tempPath = file.path,
        scriptPath =  'res/scripts/',
        relativePath =  scriptPath + projectId + '/',
        scriptsDir = appDir + '/public/' + scriptPath,
        newPath = appDir + '/public/' + relativePath;

    // check for passenger buffer file location
    let passDir = '/usr/share/passenger/helper-scripts/public/res/scripts/' + projectId + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }

	// check for existing parent directory, create if needed
	if (!fs.existsSync(scriptsDir)) {
		fs.mkdirSync(scriptsDir);
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
					return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
				}else{

					req.files.file.name = sanitize(req.files.file.name);
					
					// generate new script object
					let script = {
									file: req.files.file,
									by: {
										userId: req.user._id,
										date: moment().tz('America/New_York').format(),
										name: req.user.displayName
									}
								};

					// write change to log
					let log = {
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
	
    let file = req.files.file,
        recBody = JSON.parse(req.body.data),
        projectId = recBody.projectId,
        appDir = global.appRoot,
        tempPath = file.path,
        refsPath =  'res/referenceFiles/',
        relativePath =  refsPath + projectId + '/',
        refsDir = appDir + '/public/' + refsPath,
        newPath = appDir + '/public/' + relativePath;

    // check for passenger buffer file location
    let passDir = '/usr/share/passenger/helper-scripts/public/res/referenceFiles/' + projectId + '/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }
	
	// check for existing parent directory, create if needed
	if (!fs.existsSync(refsDir)) {
		fs.mkdirSync(refsDir);
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
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }else{

                        req.files.file.name = sanitize(req.files.file.name);
                        
                        let referenceFile = {
                                    file: req.files.file,
                                    by: {
                                        userId: req.user._id,
                                        date: moment().tz('America/New_York').format(),
                                        name: req.user.displayName
                                    }
                                    };

                        // write change to log
                        let log = {
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
    let file = req.files.file,
        referenceFiles = [],
        appDir = global.appRoot,
        tempPath = file.path,
        refsPath =  'res/referenceFiles/',
        relativePath =  refsPath + 'temp/',
        refsDir = appDir + '/public/' + refsPath,
        newPath = appDir + '/public/' + relativePath;

    // check for passenger buffer file location
    let passDir = '/usr/share/passenger/helper-scripts/public/res/referenceFiles/temp/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }

	// check for existing parent directory, create if needed
	if (!fs.existsSync(refsDir)) {
		fs.mkdirSync(refsDir);
	}

	// check for existing temp directory, create if needed
	if (!fs.existsSync(newPath)) {
		fs.mkdirSync(newPath);
	}

    // add file path
    newPath += sanitize(file.name);

	req.files.file.name = sanitize(req.files.file.name);
    let referenceFile = {
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
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
            return res.jsonp(referenceFiles);
        }
    });
};

// file upload
exports.uploadTempScript = function(req, res, next){
	// We are able to access req.files.file thanks to
	// the multiparty middleware
	let file = req.files.file,
        scripts = [],
        appDir = global.appRoot,
        tempPath = file.path,
        scriptPath =  'res/scripts/',
        relativePath =  scriptPath + 'temp/',
        scriptsDir = appDir + '/public/' + scriptPath,
        newPath = appDir + '/public/' + relativePath;

	// check for passenger buffer file location
	let passDir = '/usr/share/passenger/helper-scripts/public/res/scripts/temp/' + file.name;
	if(fs.existsSync(passDir)){
	  tempPath = passDir;
	}

	// check for existing parent directory, create if needed
	if (!fs.existsSync(scriptsDir)) {
		fs.mkdirSync(scriptsDir);
	}

	// check for existing temp directory, create if needed
	if (!fs.existsSync(newPath)) {
		fs.mkdirSync(newPath);
	}

	// add file path
    newPath += sanitize(file.name);
	if(file.name.indexOf('#') > -1){

		return res.status(500).end({
            message: errorHandler.getErrorMessage('file not found')
        });

	} else {

		// assign user data
		let uid = '', uname = '';
		if(typeof req.user !== 'undefined'){
			uid = req.user._id;
			uname = req.user.displayName;
		}

		req.files.file.name = sanitize(req.files.file.name);

		let script = {
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
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
		  }else{
			  return res.jsonp(scripts);
		  }
		});

	}
};


// file upload
exports.uploadAudition = function(req, res, next){

	// method vars
	let audTalent = '',
		firstName = '',
		lastNameCode = '',
		curUser = Object.create(req.user),
        uploadedFiles = (Array.isArray(req.files.file) ? req.files.file : [req.files.file] );

    //return res.jsonp(req.files);
    // upload all files from files array
    async.eachSeries(uploadedFiles, function iteratee(curFile, fileCallback) {

        // We are able to access req.files.file thanks to
        // the multiparty middleware
        let file = curFile,
            recBody = JSON.parse(req.body.data),
            projectId = recBody.projectId,
            appDir = global.appRoot,
            tempPath = file.path,
            audPath =  'res/auditions/',
            relativePath =  audPath + projectId + '/',
            audsDir = appDir + '/public/' + audPath,
            newPath = appDir + '/public/' + relativePath;

        // check for passenger buffer file location
        let passDir = '/usr/share/passenger/helper-scripts/public/res/auditions/' + projectId + '/' + sanitize(file.name);
        if(fs.existsSync(passDir)){
            tempPath = passDir;
        }

        // check for existing parent directory, create if needed
        if (!fs.existsSync(audsDir)) {
            fs.mkdirSync(audsDir);
        }

        // create project directory if not found
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        // add file path
        newPath += sanitize(file.name);

        // strip talent name and last name code from audition
        let regStr = /([a-z_A-Z]+)\.\w{3}$/i.exec(file.name.trim());
		firstName = '';
		lastNameCode = '';
        if(regStr !== null){
            let regStrOP = regStr[1],
                lastNm = /([A-Z])[a-z]*$/.exec(regStrOP);

            if(lastNm !== null){
                let lastNmPos = lastNm.index;

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
                                // clear version
                                delete project.__v;
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
                                let log = {
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

                    let audition = {
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
                    let aud = new Audition(audition);
                    aud.save();

                    // write change to log
                    let log = {
                        type: 'project',
                        sharedKey: String(project._id),
                        description: project.title + ' audition uploaded ' + sanitize(file.name),
                        user: curUser
                    };
                    log = new Log(log);
                    log.save();

                    // send audition data to client
                    fileCallback();

                });
            }
            ], function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });

    }, function done(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({'status':'success'});

        }

    });

};

// audition temp file upload
exports.uploadTempAudition = function(req, res, next){
	// We are able to access req.files.file thanks to
    // the multiparty middleware
    let file = req.files.file,
        project = JSON.parse(req.body.data),
        appDir = global.appRoot,
        tempPath = file.path,
        audPath =  'res/auditions/',
        relativePath =  audPath + 'temp/',
        audsDir = appDir + '/public/' + audPath,
        newPath = appDir + '/public/' + relativePath;

    project = project.project;

    // check for passenger buffer file location
    let passDir = '/usr/share/passenger/helper-scripts/public/res/auditions/temp/' + sanitize(file.name);
    if(fs.existsSync(passDir)){
      tempPath = passDir;
    }

	// check for existing parent directory, create if needed
	if (!fs.existsSync(audsDir)) {
		fs.mkdirSync(audsDir);
	}

    // create project directory if not found
    if (!fs.existsSync(newPath)) {
    	fs.mkdirSync(newPath);
    }

    // add file path
    newPath += sanitize(file.name);

    mv(tempPath, newPath, function(err) {
        if (err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
			req.files.file.name = sanitize(req.files.file.name);

			let audition = {
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
	let tempPath, 
        savePath, 
        project = req.body.project,
        auditions = req.body.auditions,
        talentId = req.body.talent,
        appDir = global.appRoot;

	// check for passenger buffer file location
	let auditionsTempPath = '/usr/share/passenger/helper-scripts/public/res/auditions/temp/',
        talentUploadParent = appDir + '/public/res/talentUploads/',
        talentUploadPath = talentUploadParent + project._id + '/',
        talentUploadTalentPath = talentUploadPath + talentId + '/';

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
								return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
							}
						});
					}

					// write change to log
					let log = {
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

            for(const i in updatedProject.talent) {

				if(updatedProject.talent[i].talentId === talentId){

					if(typeof updatedProject.talent[i].submissions === 'undefined'){

						updatedProject.talent[i].submissions = auditions;
						done('', updatedProject);

					} else {

                        for(const j in auditions) {
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

				project = Object.assign(project, updatedProject.toObject());

                // clear version
                delete project.__v;
                
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
  
exports.uploadBackup = function(req, res, next){
    // We are able to access req.files.file thanks to
        // the multiparty middleware
        let file = req.files.file, JSONobj, parentPath, project,
            auditionsBackupDir, scriptsBackupDir, referenceFilesBackupDir,
            appDir = global.appRoot,
            tempPath = file.path,
            archivesPath = appDir + '/public/res/archives/',
            backupPath = archivesPath + 'backups/',
            savePath = archivesPath + file.name;

        // check for passenger buffer file location
        let passDir = '/usr/share/passenger/helper-scripts/public/res/archives/backups/' + file.name;
        if(fs.existsSync(passDir)){
          tempPath = passDir;
        }
    
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
    
                    fileFuncs.walk(backupPath, function(err, results){
    
                        async.eachSeries(results, function (curSelproject, projectCallback) {
    
                            parentPath = curSelproject.parentPath;
    
                            fs.readFile(curSelproject.path, 'utf8', function (err, data) {
    
                                // generate and insert new project object
                                JSONobj = JSON.parse(data);
    
                                delete(JSONobj.user);
    
                                project = new Project(JSONobj);
                                
                                // clear version
                                delete project.__v;

                                req.project = project;
    
                                // delete existing project if exists
                                Project.findById(project._id).then(function (delProject) {
    
                                    // generate delete files list
                                    let auditionsDir = appDir + '/public/res/auditions/' + project._id + '/',
                                        scriptsDir = appDir + '/public/res/scripts/' + project._id + '/',
                                        referenceFilesDir = appDir + '/public//res/referenceFiles/' + project._id + '/';
    
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
    