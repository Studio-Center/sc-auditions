'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	Log = mongoose.model('Log'),
	_ = require('lodash'),
	radash = require('radash'),
	async = require('async');

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

			return res.status(200).send();
		}
	});
};

// update talent status
exports.updateTalentStatus = function(req, res){

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','client','client-client'];

	// validate user interaction
	if (radash.intersects(req.user.roles, allowedRoles)) {

		var project = req.body.project;

        if (project._id.match(/^[0-9a-fA-F]{24}$/)) {
            Project.findById(project._id).then(function (project) {
				project.populate('user', 'displayName');

                project = _.extend(project, req.body.project);

                req.project = project ;

                project.markModified('talent');
                project.markModified('modified');

                project.save().then(function () {
					return res.status(200).send();
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
					done(null);
				}).catch(function (err) {
					done(err);
				});

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
