'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).then(function (user) {
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

exports.userByIDEdit = function(req, res, next, id) { 
	User.findById(id).then(function (user) {
		if (! user) return next(new Error('Failed to load User ' + id));
		req.useredit = user ;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles, res, next) {
	var _this = this;

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern','production coordinator'];

	if (_.intersection(roles.user.roles, allowedRoles).length) {
		return next();
	} else {
		return function(req, res, next) {	
			_this.requiresLogin(req, res, function() {
				if (_.intersection(req.user.roles, roles).length) {
					return next();
				} else {
					return res.status(403).send({
						message: 'User is not authorized'
					});
				}
			});
		};
	}
};