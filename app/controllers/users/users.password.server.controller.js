'use strict';

/**
 * Module dependencies.
 */
const errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	sgMail = require('@sendgrid/mail'),
	async = require('async'),
	crypto = require('crypto');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				let token = buffer.toString('hex');
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
							message: errorHandler.getErrorMessage('No account with that username has been found')
						});
					} else if (user.provider !== 'local') {
						return res.status(400).send({
							message: errorHandler.getErrorMessage('It seems like you signed up using your ' + user.provider + ' account')
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
					message: errorHandler.getErrorMessage('Username field must not be blank')
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
			let mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Password Reset',
				html: emailHTML
			};

			sgMail
			.send(mailOptions)
			.then(() => {
				done();
			}, error => {
				res.send({
					message: 'An email has been sent to ' + user.email + ' with further instructions.'
				});
				done(error);
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
	let passwordDetails = req.body;

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
								message: errorHandler.getErrorMessage('Passwords do not match')
							});
						}
					} else {
						return res.status(400).send({
							message: errorHandler.getErrorMessage('Password reset token is invalid or has expired.')
						});
					}
				}).catch(function (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage('Password reset token is invalid or has expired.')
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
				let mailOptions = {
					to: user.email,
					from: config.mailer.from,
					subject: 'Your password has been changed',
					html: emailHTML
				};

				sgMail
				.send(mailOptions)
				.then(() => {
					done(null, 'done');
				}, error => {
					done(error, 'done');
				});

			}
		], function(err) {
			if (err) return next(err);
		});

	} else {
		return res.status(400).send({
			message: errorHandler.getErrorMessage('password field empty')
		});
	}
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
	// Init Variables
	let passwordDetails = req.body;

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
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
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
								message: errorHandler.getErrorMessage('Passwords do not match')
							});
						}
					} else {
						res.status(400).send({
							message: errorHandler.getErrorMessage('Current password is incorrect')
						});
					}
				} else {
					res.status(400).send({
						message: errorHandler.getErrorMessage('User is not found')
					});
				}
			}).catch(function (err) {
				res.status(400).send({
					message: errorHandler.getErrorMessage('User is not found')
				});
			});
		} else {
			res.status(400).send({
				message: errorHandler.getErrorMessage('Please provide a new password')
			});
		}
	} else {
		res.status(400).send({
			message: errorHandler.getErrorMessage('User is not signed in')
		});
	}
};
