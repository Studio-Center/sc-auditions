'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Agency = mongoose.model('Agency'),
	_ = require('lodash');

/**
 * Create a Agency
 */
exports.create = function(req, res) {
	var agency = new Agency(req.body);
	agency.user = req.user;

	if (req.user.role === 'admin' || req.user.role === 'producer/auditions director'){
		agency.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(agency);
			}
		});
	} else {
		return res.status(403).send('User is not authorized');
	} 
};

/**
 * Show the current Agency
 */
exports.read = function(req, res) {
	res.jsonp(req.agency);
};

/**
 * Update a Agency
 */
exports.update = function(req, res) {
	var agency = req.agency ;

	agency = _.extend(agency , req.body);

	agency.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(agency);
		}
	});
};

/**
 * Delete an Agency
 */
exports.delete = function(req, res) {
	var agency = req.agency ;

	agency.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(agency);
		}
	});
};

/**
 * List of Agencies
 */
exports.list = function(req, res) { Agency.find().sort('-created').populate('user', 'displayName').exec(function(err, agencies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(agencies);
		}
	});
};

/**
 * Agency middleware
 */
exports.agencyByID = function(req, res, next, id) { Agency.findById(id).populate('user', 'displayName').exec(function(err, agency) {
		if (err) return next(err);
		if (! agency) return next(new Error('Failed to load Agency ' + id));
		req.agency = agency ;
		next();
	});
};

/**
 * Agency authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.user.role === 'admin' || req.user.role === 'producer/auditions director' || req.agency.user.id === req.user.id) {
		// do nothing
	} else {
		return res.status(403).send('User is not authorized');
	}
	next();
};