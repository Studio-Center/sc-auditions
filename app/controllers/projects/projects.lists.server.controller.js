'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Project = mongoose.model('Project'),
	Audition = mongoose.model('Audition'),
	Talent = mongoose.model('Talent'),
	radash = require('radash'),
	async = require('async');

/**
 * Show the current Project
 */
exports.read = function(req, res) {
	res.jsonp(req.project);
};

// load single project for projects admin page
exports.loadProject = function(req, res){

	// set vars
	let projId = req.body.projectId;
	// load project
	Project.findById(projId).then(function (project) {
		project.populate('user', 'displayName');
		// walk through assigned talent
		async.eachSeries(project.talent, function (curTalent, talentCallback) {
				// gather updated talent info
				Talent.findById(curTalent.talentId).then(function (talent) {
					if(talent){
						curTalent.nameLnmCode = talent.name + ' ' + talent.lastNameCode;
						curTalent.locationISDN = talent.locationISDN;
					}
					talentCallback();
				});
			}, function (err) {
				project.save().then(function (upproject) {
					return res.jsonp(upproject);
				}).catch(function (err) {
					return res.status(400).send(err);
				});
		});
	}).catch(function (err) {
		return res.status(400).send();
	});

};

// gather project data
exports.getproject = function(req, res){

	Project.findById(req.body.id).then(function (project) {
		project.populate('user', 'displayName');
		res.status(200).jsonp(project);
	}).catch(function (err) {
		return res.status(400).json(err);
	});

};

// load project audition files
exports.loadAuditions = function(req, res){

	// set vars
	let projId = req.body.projectId;

	Audition.find({'project': Object(projId)}).sort('-created').then(function (auditions) {
		return res.jsonp(auditions);
	}).catch(function (err) {
		return res.status(400).send(err);
	});

};

/**
 * List of Projects
 */
var performLoadList = function(req, res, allowedRoles, i, j, limit){

	let curUserId = String(req.user._id),
		selLimit = limit || 50;

	if(req.user.roles[i] === allowedRoles[j]){

		switch(allowedRoles[j]){
			case 'user':
				Project.find({'user._id': curUserId}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'talent':
			// talent does not currently have access, added to permit later access
				Project.find({'talent': { $elemMatch: { 'talentId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'client':
				Project.find({'client': { $elemMatch: { 'userId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
			case 'client-client':
				Project.find({'clientClient': { $elemMatch: { 'userId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
					return res.jsonp(projects);
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				});
			break;
		}

	}
};

// list projects assigned to talent
exports.getTalentFilteredProjects = function(req, res){

	let dayAgo = new Date();
	dayAgo.setDate(dayAgo.getDay() - 14);

	let searchCriteria = {
		'talent': {
					$elemMatch: {
						'talentId': req.body.talentId
					}
				}
	};

	if(req.body.archived === true){
		Project.find(searchCriteria).sort('-estimatedCompletionDate').then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else {
		Project.find(searchCriteria).where('estimatedCompletionDate').gt(dayAgo).sort('-estimatedCompletionDate').then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	}

};
// assemble filters
var getProjectsFilters = function(req){

	// gen filter object
	let filterObj = {};
	// filter by project title
	if(req.body.filter.title){
		filterObj.title = new RegExp(req.body.filter.title, 'i');
	}
	if(req.body.filter.description){
		filterObj.description = new RegExp(req.body.filter.description, 'i');
	}
	// filter my Projects
	if(req.body.filter.myProjects === true){
		filterObj.user = req.user._id;
	}
	// set in progress bit
	if(req.body.filter.status){
		filterObj.status = req.body.filter.status;
	}
	// set in progress bit
	if(req.body.filter.clientEmail){
		filterObj.client = { $elemMatch: {  email : new RegExp(req.body.filter.clientEmail, 'i') } };
	}

	return filterObj;
};
// retrieve projects count
exports.getProjectsCnt = function(req, res){

	// set filter vars
	let filterObj = getProjectsFilters(req);

	Project.find(filterObj).count({}).then(function (count) {
		res.jsonp(count);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

// retrieve only a set amount of projects
exports.findLimit = function(req, res) {

	let limit = req.body.queryLimit || 50;

	if(req.body.queryLimit === 'all') {
		limit = 0;
	}

	// permit certain user roles full access
	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (radash.intersects(req.user.roles, allowedRoles)) {

		Project.find().populate('user', 'displayName').sort('-estimatedCompletionDate').limit(limit).then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(const i in req.user.roles) {
			for(const j in allowedRoles) {
				performLoadList(req, res, allowedRoles, i, j, limit);
			}
		}

	}

};
// list projects using custom defined filter values
exports.findLimitWithFilter = function(req, res) {

	// set filter vars
	let sortOrder = {},
		filterObj = getProjectsFilters(req);

	// set collection sort order
	if(req.body.filter.sortOrder){
		let selSort = req.body.filter.sortOrder;
		if(req.body.filter.ascDesc === 'desc'){
			sortOrder[selSort] = -1;
		} else {
			sortOrder[selSort] = 1;
		}
		//sortOrder = sortOrder[selSort];
	} else {
		sortOrder = '-estimatedCompletionDate';
	}
	// set and store limits
	let startVal, limitVal;
	if(req.body.startVal){
		startVal = req.body.startVal;
	} else {
		startVal = 0;
	}
	if(req.body.limitVal){
		limitVal = req.body.limitVal;
	} else {
		limitVal = 100;
	}

	// permit certain user roles full access
	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (radash.intersects(req.user.roles, allowedRoles)) {

		Project.find(filterObj).populate('user', 'displayName').sort(sortOrder).skip(Number(startVal)).limit(Number(limitVal))
		.then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				obj: filterObj,
				sort: sortOrder,
				skip: startVal,
				limit: limitVal
			});
		});;

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(const i in req.user.roles) {
			for(const j in allowedRoles) {
				performLoadList(req, res, allowedRoles, i, j, limitVal);
			}
		}

	}

};
exports.list = function(req, res) {

	// permit certain user roles full access
	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator','talent director'];

	if (radash.intersects(req.user.roles, allowedRoles)) {

		Project.find().populate('user', 'displayName').sort('-created')
		.then(function (projects) {
			return res.jsonp(projects);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});

	// filter results as required for remaning uer roles
	} else {

		allowedRoles = ['user', 'talent', 'client', 'client-client'];

		for(const i in req.user.roles) {
			for(const j in allowedRoles) {
				performLoadList(req, res, allowedRoles, i, j);
			}
		}

	}
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) { 
	Project.findById(id).then(function (project) {
		if (!project) return next(new Error('Failed to load Project '));
		project.populate('user', 'displayName');
		req.project = project;
		next();
	}).catch(function (err) {
		return next(err);
	});
};
