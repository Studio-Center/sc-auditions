'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Log = mongoose.model('Log'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport');

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

		user.save().then(function () {

			// write change to log
			var log = {
				type: 'system',
				sharedKey: String(user._id),
				description: 'user ' + user.displayName + ' updated ',
				user: user
			};
			log = new Log(log);
			log.save();

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.jsonp(user);
				}
			});

		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
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

	// define email signature
	var emailSig = '';
	if(req.user.emailSignature){
		emailSig = req.user.emailSignature;
	} else {
		emailSig = '';
	}

	// store admins email address
	var adminEmail = req.user.email;

	// load edited user data
	User.findById(req.body._id).then(function (user) {
		if (user) {
			// Merge existing user
			user = _.extend(user, req.body);
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;
			//user.edited = '';
			//user.password = new Buffer.from(user.passwordText, 'base64');
			user.password = req.body.newpassword;
			user.passwordText = new Buffer.from(req.body.newpassword).toString('base64');

			user.save().then(function () {
				// write change to log
				var log = {
					type: 'system',
					sharedKey: String(user._id),
					description: 'user ' + user.displayName + ' updated ',
					user: user
				};
				log = new Log(log);
				log.save();

				var template = 'templates/users/client-updated-email';

				// send new user email
				res.render(template, {
					emailSignature: emailSig,
					user: user,
					audURL: 'http://' + req.headers.host,
				}, function(err, clientEmailHTML) {

					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var ccAddr = [config.mailer.notifications, adminEmail];

					// send email notification of update
					transporter.sendMail({
						to: user.email,
						from: adminEmail || config.mailer.from,
						cc: ccAddr,
						replyTo: adminEmail || config.mailer.from,
						subject: 'Studio Center Auditions - Client Information Updated',
						html: clientEmailHTML
					});

				});

				// reload admin user data
				User.findById(adminUserId).then(function (user) {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							res.jsonp(user);
						}
					});
				});
			}).catch(function (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
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
exports.list = function(req, res) { 
	User.find().sort('-created').then(function (users) {
		res.jsonp(users);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};
exports.getListLevel = function(req, res, next, id) {
	User.find({'roles':{'$regex': id}}).sort('-created').then(function (users) {
		res.jsonp(users);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
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

	user.deleteOne().then(function(err) {
		res.jsonp(user);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

// allow admin user to create account
exports.create = function(req, res) {
	// For security measurement we remove the roles from the req.body object

	var adminUserId = req.user._id;

	// define email signature
	var emailSig = '';
	if(req.user.emailSignature){
		emailSig = req.user.emailSignature;
	} else {
		emailSig = '';
	}

	// store admins email address
	var adminEmail = req.user.email;

	var savedPassword = req.body.password;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// store password as Base64 Value
	user.passwordText = new Buffer.from(savedPassword).toString('base64');

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user
	user.save().then(function () {

		var template = 'templates/users/client-welcome-email';

		// send new user email
		res.render(template, {
			emailSignature: emailSig,
			user: user,
			password: savedPassword,
			audURL: 'http://' + req.headers.host,
		}, function(err, clientEmailHTML) {

			var emailSubject = 'Studio Center Auditions - Client Login Information';

			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

			var mailOptions = {
				to: user.email,
				from: adminEmail || config.mailer.from,
				replyTo: adminEmail || config.mailer.from,
				cc: config.mailer.notifications,
				subject: emailSubject,
				html: clientEmailHTML
			};

			transporter.sendMail(mailOptions, function(){

				// write change to log
				var log = {
					type: 'system',
					sharedKey: String(user._id),
					description: 'user ' + user.displayName + ' added and emailed ',
					user: user
				};
				log = new Log(log);
				log.save();

			});

		});

		// Remove sensitive data before login
		user.password = undefined;
		user.salt = undefined;

		req.login(user, function(err) {
			if (err) {
				res.status(400).send(err);
			} else {
				// reload admin user data
				User.findById(adminUserId).then(function () {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							// return user json object
							res.jsonp(user);
						}
					});
				});
			}
		});
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

// assemble filters
var getUsersFilters = function(req){

	// gen filter object
	var filterObj = {};
	// filter by project title
	if(req.body.filter.fName){
		filterObj.firstName = new RegExp(req.body.filter.fName, 'i');
	}
	if(req.body.filter.lName){
		filterObj.lastName = new RegExp(req.body.filter.lName, 'i');
	}
	if(req.body.filter.email){
		filterObj.email = new RegExp(req.body.filter.email, 'i');
	}
	if(req.body.filter.company){
		filterObj.company = new RegExp(req.body.filter.company, 'i');
	}
	// filter by role
	if(req.body.filter.roles){
		filterObj.roles = req.body.filter.roles;
	}

	return filterObj;
};
// retrieve talents count
exports.getUsersCnt = function(req, res){

	// set filter vars
	var filterObj = getUsersFilters(req);

	User.find(filterObj).count({}).then(function (count) {
		res.jsonp(count);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

exports.findLimitWithFilter = function(req, res) {

	// set filter vars
	var filterObj = getUsersFilters(req);
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

	User.find(filterObj).sort({'firstName': 1,'lastName': 1,'-created': -1}).skip(startVal).limit(limitVal).then(function (users) {
		res.jsonp(users);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};
