'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	_ = require('lodash'),
	config = require('../../config/config'),
	async = require('async'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	dateFormat = require('dateformat'),
	now = new Date();

/**
 * Create a Talent
 */
exports.create = function(req, res) {
	var talent = new Talent(req.body);
	talent.user = req.user;

	var allowedRoles = ['admin', 'production coordinator', 'producer/auditions director', 'audio intern', 'talent director'];

	if (_.intersection(req.user.roles, allowedRoles).length) {
		//console.log(talent);
		talent.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

			// write change to log
			var log = {
				type: 'talent',
				sharedKey: String(talent._id),
				description: talent.name + ' ' + talent.lastName + ' created',
				user: req.user
			};
			log = new Log(log);
			log.save();

			// send out new talent email
			async.waterfall([
				function(done) {
					var i;
					//generate talent report
					var talentData = '<p><strong>First Name</strong> ' + talent.name + '</p>';
					talentData += '<p><strong>Last Name</strong> ' + talent.lastName + '</p>';
					if(talent.parentName){
						talentData += '<p><strong>Parent Name</strong> ' + talent.parentName + '</p>';
					}
					if(talent.gender || talent.ageRange){
						talentData += '<p><strong>Gender</strong> ' + talent.gender + ' ' + (talent.ageRange || '') + '</p>';
					}
					if(talent.email){
						talentData += '<p><strong>Email</strong> ' + talent.email + '</p>';
					}
					if(talent.email2){
						talentData += '<p><strong>Email Alt</strong> ' + talent.email2 + '</p>';
					}
					if(talent.phone){
						talentData += '<p><strong>Phone Number</strong> ' + talent.phone + '</p>';
					}
					if(talent.phone2){
						talentData += '<p><strong>Phone Number Alt</strong> ' + talent.phone2 + '</p>';
					}
					if(talent.type){
						talentData += '<p><strong>Type</strong> ' + talent.type + '</p>';
					}
					talentData += '<p><strong>Union Status</strong> ';
					for(i = 0; i < talent.unionStatus.length; ++i){
						talentData += talent.unionStatus[i] + ' ';
					}
					talentData += '<br>';
					for(i = 0; i < talent.unionJoined.length; ++i){
						talentData += talent.unionJoined[i] + ' ';
					}
					talentData += '</p>';
					if(talent.lastNameCode){
						talentData += '<p><strong>Last Name Code</strong> ' + talent.lastNameCode + '</p>';
					}
					if(talent.outageTimes){
						talentData += '<p><strong>Outage Times</strong> ' + talent.outageTimes + '</p>';
					}
					if(talent.locationISDN){
						talentData += '<p><strong>Location/ISDN</strong> ' + talent.locationISDN + '</p>';
					}
					if(talent.exclusivity){
						talentData += '<p><strong>Exclusivity</strong> ' + talent.exclusivity + '</p>';
					}
					if(talent.ISDNLine1){
						talentData += '<p><strong>ISDN Line 1</strong> ' + talent.ISDNLine1 + '</p>';
					}
					if(talent.ISDNLine2){
						talentData += '<p><strong>ISDN Line 2</strong> ' + talent.ISDNLine2 + '</p>';
					}
					if(talent.sourceConnectUsername){
						talentData += '<p><strong>Source Connect Username</strong> ' + talent.sourceConnectUsername + '</p>';
					}
					if(talent.producerOptional){
						talentData += '<p><strong>Producer</strong> ' + talent.producerOptional + '</p>';
					}
					talentData += '<p><strong>Typecasts</strong>';
					for(i = 0; i < talent.typeCasts.length; ++i){
						talentData += talent.typeCasts[i] + ' ';
					}
					talentData += '</p>';

					done('', talentData);
				},
				// generate Dave's email
				function(talentData, done) {

					// generate email signature
					var emailSig = '';
					if(req.user.emailSignature){
						emailSig = req.user.emailSignature;
					} else {
						emailSig = '';
					}

					res.render('templates/talents/new-talent-dave', {
						talentData: talentData,
						emailSignature: emailSig
					}, function(err, emailHTML) {
						done(err, emailHTML, talentData, emailSig);
					});
				},
				// send Dave an email
				function(emailHTML, talentData, emailSig, done) {

					var emailSubject = 'NEW TALENT ADDITION TO VO ROSTER:  ' + talent.name + ' ' + talent.lastName;

					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var mailOptions = {
										to: 'Dave@studiocenter.com',
										from: req.user.email || config.mailer.from,
										replyTo: req.user.email || config.mailer.from,
										cc: config.mailer.notifications,
										subject: emailSubject,
										html: emailHTML
									};

					transporter.sendMail(mailOptions, function(err){
						done(err, talentData, emailSig );
					});

				},
				// generate Ken's email
				function(talentData, emailSig, done) {
					res.render('templates/talents/new-talent-ken', {
						talentData: talentData,
						emailSignature: emailSig
					}, function(err, emailHTML) {
						done(err, emailHTML, talentData, emailSig);
					});
				},
				// send Ken an email
				function(emailHTML, talentData, emailSig, done) {

					var emailSubject = 'NEW TALENT ADDITION TO VO ROSTER:  ' + talent.name + ' ' + talent.lastName;

					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var mailOptions = {
										to: ['Ken@studiocenter.com', 'edwin@studiocenter.com'],
										from: req.user.email || config.mailer.from,
										replyTo: req.user.email || config.mailer.from,
										cc: config.mailer.notifications,
										subject: emailSubject,
										html: emailHTML
									};

					transporter.sendMail(mailOptions, function(err){
						done(err, talentData, emailSig );
					});

				},
				// generate Kevin's email
				function(talentData, emailSig, done) {
					res.render('templates/talents/new-talent-kevin', {
						talentData: talent,
						emailSignature: emailSig
					}, function(err, emailHTML) {
						done(err, emailHTML, talentData, emailSig);
					});
				},
				// send Kevin an email
				function(emailHTML, talentData, emailSig, done) {

					var emailSubject = 'NEW TALENT ADDITION TO VO ROSTER:  ' + talent.name + ' ' + talent.lastName;

					// send email
					var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

					var mailOptions = {
										to: 'Kevin@studiocenter.com',
										from: req.user.email || config.mailer.from,
										replyTo: req.user.email || config.mailer.from,
										cc: config.mailer.notifications,
										subject: emailSubject,
										html: emailHTML
									};

					transporter.sendMail(mailOptions, function(err){
						done(err);
					});

				},
				], function(err) {
				if (err) return console.log(err);
			});
				var socketio = req.app.get('socketio');
				socketio.sockets.emit('talentsListUpdate');

				return res.jsonp(talent);
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

			// write change to log
			var log = {
				type: 'talent',
				sharedKey: String(talent._id),
				description: talent.name + ' ' + talent.lastName + ' updated ',
				user: req.user
			};
			log = new Log(log);
			log.save();

			res.jsonp(talent);
		}
	});
};

/**
 * Delete an Talent
 */
exports.delete = function(req, res) {
	var talent = req.talent;

	// send delete talent emails
	async.waterfall([
		// generate Dave's email
		function(done) {

			// generate email signature
			var emailSig = '';
			if(req.user.emailSignature){
				emailSig = req.user.emailSignature;
			} else {
				emailSig = '';
			}

			res.render('templates/talents/delete-talent-dave', {
				talentData: talent,
				emailSignature: emailSig
			}, function(err, emailHTML) {
				done(err, emailHTML, emailSig);
			});
		},
		// send Dave an email
		function(emailHTML, emailSig, done) {

			var emailSubject = 'TALENT TERMINATED FROM VO ROSTER: ' + talent.name + ' ' + talent.lastName;

			// send email
			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

			var mailOptions = {
								to: 'Dave@studiocenter.com',
								from: req.user.email || config.mailer.from,
								replyTo: req.user.email || config.mailer.from,
								cc: config.mailer.notifications,
								subject: emailSubject,
								html: emailHTML
							};

			transporter.sendMail(mailOptions, function(err){
				done(err, emailSig);
			});

		},
		// generate Ken's email
		function(emailSig, done) {
			res.render('templates/talents/delete-talent-ken', {
				talentData: talent,
				emailSignature: emailSig
			}, function(err, emailHTML) {
				done(err, emailHTML);
			});
		},
		// send Ken an email
		function(emailHTML, done) {

			var emailSubject = 'TALENT TERMINATED FROM VO ROSTER: ' + talent.name + ' ' + talent.lastName;

			// send email
			var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

			var mailOptions = {
								to: 'Ken@studiocenter.com',
								from: req.user.email || config.mailer.from,
								replyTo: req.user.email || config.mailer.from,
								cc: config.mailer.notifications,
								subject: emailSubject,
								html: emailHTML
							};

			transporter.sendMail(mailOptions, function(err){
				done(err);
			});

		},
		function(done) {

			// write change to log
			var log = {
				type: 'talent',
				sharedKey: String(talent._id),
				description: talent.name + ' ' + talent.lastName + ' terminated ',
				user: req.user
			};
			log = new Log(log);
			log.save();

			talent.remove(function(err) {
				if (err) {
					done(err);
				} else {
					var socketio = req.app.get('socketio');
					socketio.sockets.emit('talentsListUpdate');

					res.jsonp(talent);
					done(err);
				}
			});
		}
	], function(err) {
		if (err) return console.log(err);
	});


};

// assemble filters
var getTalentsFilters = function(req){

	// gen filter object
	var filterObj = {};
	// filter by project title
	if(req.body.filter.fName){
		filterObj.name = new RegExp(req.body.filter.fName, 'i');
	}
	if(req.body.filter.lName){
		filterObj.lastName = new RegExp(req.body.filter.lName, 'i');
	}
	if(req.body.filter.email){
		filterObj.email = new RegExp(req.body.filter.email, 'i');
	}
	// filter by gender
	if(req.body.filter.gender){
		filterObj.gender = req.body.filter.gender;
	}
	// unionStatus
	if(req.body.filter.unionStatus){
		filterObj.unionStatus = req.body.filter.unionStatus;
	}
	// type
	if(req.body.filter.type){
		filterObj.type = req.body.filter.type;
	}
	// ageRange
	if(req.body.filter.ageRange){
		filterObj.ageRange = req.body.filter.ageRange;
	}
	// locationISDN
	if(req.body.filter.locationISDN){
		filterObj.locationISDN = req.body.filter.locationISDN;
	}
	// locationISDN
	if(req.body.filter.typeCasts){
		filterObj.typeCasts = req.body.filter.typeCasts;
		if(filterObj.typeCasts === 'Spanish'){
			delete filterObj.typeCasts;
			//filterObj.typeCasts = ['Spanish-Dialect','Spanish-Showcase'];
			filterObj.prefLanguage = 'Spanish';
		}
	}

	return filterObj;
};
// retrieve talents count
exports.getTalentsCnt = function(req, res){

	// set filter vars
	var filterObj = getTalentsFilters(req);

	Talent.find(filterObj).count({}, function(err, count){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(count);
		}
	});

};

exports.findLimitWithFilter = function(req, res) {

	// set filter vars
	var filterObj = getTalentsFilters(req);
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

	Talent.find(filterObj).sort({'locationISDN': 1,'lastName': 1,'-created': -1}).skip(startVal).limit(limitVal).populate('user', 'displayName').exec(function(err, talents) {
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
 * List of Talents
 */
exports.list = function(req, res) { Talent.find().sort({'locationISDN': 1,'lastName': 1,'-created': -1}).populate('user', 'displayName').exec(function(err, talents) {
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
	var allowedRoles = ['admin','producer/auditions director', 'audio intern', 'production coordinator', 'talent director'];

	if (!_.intersection(req.user.roles, allowedRoles).length) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
