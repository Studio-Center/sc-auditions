'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Typecast = mongoose.model('Typecast'),
	_ = require('lodash');

/**
 * Create a Typecast
 */
exports.create = function(req, res) {
	var typecast = new Typecast(req.body);
	typecast.user = req.user;

	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern','talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {
		typecast.save().then(function () {
			var socketio = req.app.get('socketio');
			socketio.sockets.emit('typecastsListUpdate'); 
			
			return res.jsonp(typecast);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else {
		return res.status(403).send('User is not authorized');
	}
};

/**
 * Show the current Typecast
 */
exports.read = function(req, res) {
	res.jsonp(req.typecast);
};

/**
 * Update a Typecast
 */
exports.update = function(req, res) {
	var typecast = req.typecast ;

	typecast = _.extend(typecast , req.body);

	typecast.save().then(function () {
		res.jsonp(typecast);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Delete an Typecast
 */
exports.delete = function(req, res) {
	var typecast = req.typecast ;

	typecast.deleteOne().then(function (typecast) {
		var socketio = req.app.get('socketio');
		socketio.sockets.emit('typecastsListUpdate'); 
		
		res.jsonp(typecast);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * List of Typecasts
 */
exports.list = function(req, res) { 
	Typecast.find().sort('-created').then(function (typecasts) {
		res.jsonp(typecasts);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Typecast middleware
 */
exports.typecastByID = function(req, res, next, id) { 
	Typecast.findById(id).then(function (typecast) {
		if (! typecast) return next(new Error('Failed to load Typecast ' + id));
		req.typecast = typecast ;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Typecast authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	var allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern','talent director'];

	if (!_.intersection(req.user.roles, allowedRoles).length) {
		return res.status(403).send('User is not authorized');
	}
	next();
};