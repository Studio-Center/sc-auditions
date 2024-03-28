'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Log = mongoose.model('Log'),
	_ = require('lodash');

/**
 * Create a Log
 */
exports.create = function(req, res) {
	var log = new Log(req.body);
	log.user = req.user;

	log.save().then(function () {
		res.jsonp(log);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Show the current Log
 */
exports.read = function(req, res) {
	res.jsonp(req.log);
};

/**
 * Update a Log
 */
exports.update = function(req, res) {
	var log = req.log ;

	log = _.extend(log , req.body);

	log.save().then(function (log) {
		res.jsonp(log);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Delete an Log
 */
exports.delete = function(req, res) {
	var log = req.log ;

	log.deleteOne().then(function(log) {
		res.jsonp(log);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

// get logs record cound
exports.recCount = function(req, res){

	var filter = req.body.filter,
			searchTxt = req.body.searchTxt,
			filterObj = {};

	if(filter){
		filterObj.type = filter;
	}
	if(searchTxt){
		filterObj.description = new RegExp(searchTxt, 'i');
	}

	Log.find(filterObj).count({}).then(function (count) {
		res.jsonp(count);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

/**
 * List of Logs
 */
exports.list = function(req, res) {

	// set and store limits
	var startVal, limitVal;
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

	Log.find().sort('-created').skip(startVal).limit(limitVal).then(function (logs) {
		res.jsonp(logs);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

// present filtered list of logs
exports.listFilter = function(req, res){

	// set and store limits
	var startVal, limitVal;
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

	var filter = req.body.filter;

	Log.find(filter).sort('-created').skip(startVal).limit(limitVal).then(function (logs) {
		res.jsonp(logs);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

// list type filter
exports.listTypeFilter = function(req, res){

	// set and store limits
	var startVal, limitVal;
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

	var filter = req.body.filter,
			searchTxt = req.body.searchTxt,
			filterObj = {};

	if(filter){
		filterObj.type = filter;
	}
	if(searchTxt){
		filterObj.description = new RegExp(searchTxt, 'i');
	}

	Log.find(filterObj).sort('-created').skip(startVal).limit(limitVal).then(function (logs) {
		res.jsonp(logs);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

/**
 * Log middleware
 */
exports.logByID = function(req, res, next, id) { Log.findById(id).then(function (log) {
		if (! log) return next(new Error('Failed to load Log ' + id));
		req.log = log ;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Log authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.log.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
