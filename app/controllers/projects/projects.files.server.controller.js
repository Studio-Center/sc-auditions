'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Project = mongoose.model('Project'),
	Audition = mongoose.model('Audition'),
	Log = mongoose.model('Log'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	async = require('async'),
	moment = require('moment-timezone'),
	fileFuncs = require('./classes/files.class');

// save project audition files
exports.deleteAudition = function(req, res){

	let aud = req.body.audition,
        appDir = global.appRoot,
        audFile = '';

	if(aud){
		Audition.findById(aud._id).sort('-created').then(function (audition) {
			// set aud file path
			audFile = appDir + '/public/res/auditions/' + String(audition.project) + '/' + audition.file.name;
			// remove file from file system
			if (fs.existsSync(audFile)) {
				fs.unlink(audFile, (err) => {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
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
			return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
		});
	}
};

// save project audition files
exports.deleteAllAuditions = function(req, res){

    let prodId = req.body.project_ID,
        appDir = global.appRoot + '/public',
        auditionsDir = appDir + '/res/auditions/' + prodId + '/';

	// remove all file if exists
	rimraf.sync(auditionsDir);

    // remove all assocaited auditions
    Audition.remove({project: Object(prodId)}).then(function (audition) {
		return res.status(200).send();
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
    });

};

// save project audition files
exports.saveAudition = function(req, res){

	// set vars
	let aud = req.body.audition,
		appDir = global.appRoot;

	Audition.findById(aud._id).sort('-created').then(function (audition) {

		// check for aud rename
		if (aud.rename) {

			let file = appDir + '/public/res/auditions/' + String(aud.project) + '/' + aud.file.name,
				newFile = appDir + '/public/res/auditions/' + String(aud.project) + '/' + aud.rename;

			// move file if exists
			if (fs.existsSync(file)){

				fileFuncs.moveFile(file, newFile);

				// change stored file name
				aud.file.name = aud.rename;
				aud.rename = '';

			}
		}

		audition = Object.assign(audition, aud);

		audition.save().then(function (upaud) {
			return res.jsonp(audition);
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

// check if file exists
exports.fileExists = function(req, res){

	// method vars
	let appDir = global.appRoot,
		file = appDir + '/public' + req.body.file;

	// check if file exists
	if (fs.existsSync(file)) {
		return res.status(200).send();
	} else {
		return res.status(400).send({
			message: errorHandler.getErrorMessage('file not found')
		});
	}

};

// handle remote file delete requests
exports.deleteFileByName = function(req, res){

	let appDir = global.appRoot,
		fileLocation = req.body.fileLocation,
		file = appDir + '/public' + fileLocation,
		projectId = req.body.projectId;

	// remove file is exists
	if (fs.existsSync(file)) {
		fs.unlinkSync(file, (err) => {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
		});

		// log instance if project info included
		if(typeof req.body.projectId !== 'undefined'){

			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

				if(project){

					// write change to log
					let log = {
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

	let appDir = global.appRoot,
		file = appDir + '/public/res/scripts/temp/' + req.body.fileLocation;

	// remove file is exists
	if (fs.existsSync(file)) {
		fs.unlinkSync(file, (err) => {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
		});
	}
	return res.status(200).send();
};

exports.backupProjectsById = function(req, res, next){

	// get app dir
	let appDir = global.appRoot,
		archivesPath = appDir + '/public/' + 'res' + '/' + 'archives' + '/',
		curDate = moment().format('MMM Do YY'),
		zippedFilename = 'Auditions Project Backup Bundle - ' + curDate + '.zip',
		newZip = archivesPath + zippedFilename,
		backupDir = archivesPath + req.user._id + '_backup',
		auditionsDir, scriptsDir, referenceFilesDir, projectBuDir;

	// check for existing parent directory, create if needed
	if (!fs.existsSync(archivesPath)) {
		fs.mkdirSync(archivesPath);
	}

    // remove existing backup file
    if (fs.existsSync(newZip)) {
    	rimraf.sync(newZip);
    }

    // archiver settings
    let output = fs.createWriteStream(newZip),
		archive = archiver('zip');

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
			req.project = project;
			delete req.project.__v;

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
				let file = fs.createWriteStream(backupDir + '/' + project._id + '/JSON.txt');
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

			res.jsonp({count: missingCnt, results:callTalents});
		}
   	});

};
