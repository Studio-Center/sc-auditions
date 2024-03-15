'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	async = require('async'),
	crypto = require('crypto');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function(token, done) {
			if (req.body.username) {
				User.findOne({
					username: req.body.username
				}, '-salt -password').then(function (user) {
					if (!user) {
						return res.status(400).send({
							message: 'No account with that username has been found'
						});
					} else if (user.provider !== 'local') {
						return res.status(400).send({
							message: 'It seems like you signed up using your ' + user.provider + ' account'
						});
					} else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save().then(function () {
							done(null, token, user);
						});
					}
				});
			} else {
				return res.status(400).send({
					message: 'Username field must not be blank'
				});
			}
		},
		function(token, user, done) {
			res.render('templates/reset-password-email', {
				name: user.displayName,
				appName: config.app.title,
				url: 'http://' + req.headers.host + '/auth/reset/' + token
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				cc: config.mailer.notifications,
				subject: 'Password Reset',
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				if (!err) {
					res.send({
						message: 'An email has been sent to ' + user.email + ' with further instructions.'
					});
				}

				done(err);
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}).then(function (user) {
		if (!user) {
			return res.redirect('/#!/password/reset/invalid');
		}

		res.redirect('/#!/password/reset/' + req.params.token);
	}).catch(function (err) {
		return res.redirect('/#!/password/reset/invalid');
	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
	// Init Variables
	var passwordDetails = req.body;

	if(passwordDetails.newPassword != '' && passwordDetails.newPassword != null){

		async.waterfall([

			function(done) {
				User.findOne({
					resetPasswordToken: req.params.token,
					resetPasswordExpires: {
						$gt: Date.now()
					}
				}).then(function (user) {
					if (user) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
							user.password = passwordDetails.newPassword;
							user.resetPasswordToken = undefined;
							user.resetPasswordExpires = undefined;

							// store password as Base64 Value
							user.passwordText = new Buffer.from(user.password).toString('base64');

							user.save().then(function () {
								req.login(user, function(err) {
									if (err) {
										res.status(400).send(err);
									} else {
										// Return authenticated user
										res.jsonp(user);

										done(err, user);
									}
								});
							}).catch(function (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							});
						} else {
							return res.status(400).send({
								message: 'Passwords do not match'
							});
						}
					} else {
						return res.status(400).send({
							message: 'Password reset token is invalid or has expired.'
						});
					}
				}).catch(function (err) {
					return res.status(400).send({
						message: 'Password reset token is invalid or has expired.'
					});
				});
			},
			function(user, done) {
				res.render('templates/reset-password-confirm-email', {
					name: user.displayName,
					appName: config.app.title
				}, function(err, emailHTML) {
					done(err, emailHTML, user);
				});
			},
			// If valid email, send reset email using service
			function(emailHTML, user, done) {
				var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
				var mailOptions = {
					to: user.email,
					from: config.mailer.from,
					cc: config.mailer.notifications,
					subject: 'Your password has been changed',
					html: emailHTML
				};

				smtpTransport.sendMail(mailOptions, function(err) {
					done(err, 'done');
				});
			}
		], function(err) {
			if (err) return next(err);
		});

	} else {
		return res.status(400).send('password field empty');
	}
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
	// Init Variables
	var passwordDetails = req.body;

	if (req.user) {
		if (passwordDetails.newPassword) {
			User.findById(req.user.id).then(function (user) {
				if (user) {
					if (user.authenticate(passwordDetails.currentPassword)) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {

							user.password = passwordDetails.newPassword;

							// store password as Base64 Value
							user.passwordText = new Buffer.from(user.password).toString('base64');

							user.save().then(function () {
								req.login(user, function(err) {
									if (err) {
										res.status(400).send(err);
									} else {
										res.send({
											message: 'Password changed successfully'
										});
									}
								});
							}).catch(function (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							});
						} else {
							res.status(400).send({
								message: 'Passwords do not match'
							});
						}
					} else {
						res.status(400).send({
							message: 'Current password is incorrect'
						});
					}
				} else {
					res.status(400).send({
						message: 'User is not found'
					});
				}
			}).catch(function (err) {
				res.status(400).send({
					message: 'User is not found'
				});
			});
		} else {
			res.status(400).send({
				message: 'Please provide a new password'
			});
		}
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};
