'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	Log = mongoose.model('Log'),
	radash = require('radash'),
	async = require('async'),
    errorHandler = require('../errors');

// update single talent single project status
exports.updateSingleTalentStatus = function (req, res){

	let projectId = req.body.projectId,
		talentId = req.body.talentId,
		talentStatus = req.body.talentStatus;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findById(projectId).then(function (project) {
				done(null, project);
			}).catch(function (err) {
				done(err, null);
			});
		},
		// update talent email status
		function(project, done){

			// update talent email status
			for(const i in project.talent) {
				if(project.talent[i].talentId === talentId){
					project.talent[i].status = talentStatus;

					// write change to log
					let log = {
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

			let newProject = project.toObject();

			Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

				project = Object.assign(project, newProject);

				// clear version
				delete project.__v;

				req.project = project;

				project.save().then(function () {
				}).catch(function (err) {
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
			return res.status(200).send();
		}
	});
};

// update talent status
exports.updateTalentStatus = function(req, res){

	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (radash.intersects(req.user.roles, allowedRoles)) {

		let project = req.body.project;

        if (project._id.match(/^[0-9a-fA-F]{24}$/)) {
            Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

                project = Object.assign(project, req.body.project);

				// clear version
				delete project.__v;

                req.project = project ;

                project.markModified('talent');
                project.markModified('modified');

                project.save().then(function () {
					return res.status(200).send();
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
                });

            });
        }

	}

};

// update talent note
exports.updateTalentNote = function (req, res){

	let projectId = req.body.projectId,
		talentId = req.body.talentId,
		newNote = req.body.note;

	async.waterfall([
		// gather info for selected talent
		function(done) {
			Project.findById(projectId).then(function (project) {
				done(null, project);
			}).catch(function (err) {
				done(err, null);
			});
		},
		// update talent email status
		function(project, done){

			// update talent email status
			for(const i in project.talent) {
				if(project.talent[i].talentId === talentId){
					project.talent[i].note = newNote;
					done('', project);
				}
			}

		},
		// email selected talent
		function(project, done){

			let newProject = project.toObject();

			Project.findById(project._id).then(function (projects) {
				project.populate('user', 'displayName');

				project = Object.assign(project, newProject);

                project.markModified('talent');
                project.markModified('modified');

				// clear version
				delete project.__v;

				req.project = project;

				project.save().then(function () {
					done(null);
				}).catch(function (err) {
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
			return res.status(200).send();
		}
	});

};
