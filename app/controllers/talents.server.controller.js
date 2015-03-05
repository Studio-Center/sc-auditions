'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Talent = mongoose.model('Talent'),
	_ = require('lodash');

/**
 * Create a Talent
 */
exports.create = function(req, res) {
	var talent = new Talent(req.body);
	talent.user = req.user;

	var allowedRoles = ['admin','producer/auditions director','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {
		console.log(talent);
		talent.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(talent);
			}
		});
	} else {
		return res.status(403).send('User is not authorized');
	}
};

/**
 * Show the current Talent
 */
exports.read = function(req, res) {
	res.jsonp(req.talent);
};

/**
 * Update a Talent
 */
exports.update = function(req, res) {
	var talent = req.talent ;

	talent = _.extend(talent , req.body);

	talent.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(talent);
		}
	});
};

/**
 * Delete an Talent
 */
exports.delete = function(req, res) {
	var talent = req.talent ;

	talent.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(talent);
		}
	});
};

/**
 * List of Talents
 */
exports.list = function(req, res) { Talent.find().sort('-created').populate('user', 'displayName').exec(function(err, talents) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(talents);
		}
	});
};

/**
 * Talent middleware
 */
exports.talentByID = function(req, res, next, id) { Talent.findById(id).populate('user', 'displayName').exec(function(err, talent) {
		if (err) return next(err);
		if (! talent) return next(new Error('Failed to load Talent ' + id));
		req.talent = talent ;
		next();
	});
};

/**
 * Talent authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	var allowedRoles = ['admin','producer/auditions director','talent director'];

	if (!_.intersection(req.user.roles, allowedRoles).length) {
		return res.status(403).send('User is not authorized');
	}
	next();
};