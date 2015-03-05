'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.jsonp(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

exports.updateAdmin = function(req, res) {
	// Init Variables
	//var message = null;
	//var user = req.user;
	// For security measurement we remove the roles from the req.body object
	//delete req.body.roles;
	//console.log(user);
	//console.log(req.body);
	var adminUserId = req.user._id;

	// load edited user data
	User.findById(req.body._id).populate('user', 'displayName').exec(function(err, user) {
		if (user) {
			// Merge existing user
			user = _.extend(user, req.body);
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;
			user.edited = '';

			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {

					var transporter = nodemailer.createTransport(config.mailer.options);
					
					// configure email body
					var emailBody = 'First Name: ' + user.firstName + '\n';
					emailBody += 'Last Name: ' + user.lastName + '\n';
					emailBody += 'Email: ' + user.email + '\n';
					emailBody += 'Username: ' + user.username + '\n';

					// send email notification of update
					transporter.sendMail({
					    from: config.mailer.from,
					    to: user.email,
					    subject: 'SC Auditions ' + user.displayName + ' account update',
					    text: emailBody
					});

					// reload admin user data
					User.findById(adminUserId).populate('user', 'displayName').exec(function(err, user) {
						req.login(user, function(err) {
							if (err) {
								res.status(400).send(err);
							} else {
								res.jsonp(user);
							}
						});
					});
				}
			});
		}
	});
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};
// 2/20/2015
// added for admin user purposes
exports.list = function(req, res) { User.find().sort('-created').populate('user', 'displayName').exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};
exports.getListLevel = function(req, res, next, id) { 
	User.find({'roles':id}).sort('-created').populate('user', 'displayName').exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};

/**
 * Show the current user
 */
exports.read = function(req, res) {
	res.jsonp(req.profile);
};
exports.readAdmin = function(req, res) {
	res.jsonp(req.useredit);
};

exports.delete = function(req, res) {
	var user = req.useredit ;

	user.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};