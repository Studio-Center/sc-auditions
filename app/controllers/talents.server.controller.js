'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	radash = require('radash'),
	config = require('../../config/config'),
	async = require('async'),
	sgMail = require('@sendgrid/mail');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

// assemble filters
var getTalentsFilters = function(req){

	// gen filter object
	let filterObj = {},
        orQry = [];

	// filter by project title
	if(req.body.filter.fName){
		filterObj.name = new RegExp(req.body.filter.fName.trim(), 'i');
	}
	if(req.body.filter.lName){
		filterObj.lastName = new RegExp(req.body.filter.lName.trim(), 'i');
	}
	if(req.body.filter.email){
		filterObj.email = new RegExp(req.body.filter.email.trim(), 'i');
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
	// VOA
	if(req.body.filter.voa){
		filterObj.voa = true;
	}
	// producer
	if(typeof req.body.filter.producerOptional != 'undefined'){
		filterObj.producerOptional = req.body.filter.producerOptional;
	}
  // ISDNLine1
	if(req.body.filter.ISDNLine1){
		orQry.push({ISDNLine1: req.body.filter.ISDNLine1});
	}
	if(req.body.filter.sourceConnectUsername){
		orQry.push({sourceConnectUsername: req.body.filter.sourceConnectUsername});
	}
	if(orQry.length > 0){
		filterObj.$or = orQry;
	}

	// locationISDN
	if(req.body.filter.typeCasts){
		filterObj.typeCasts = new RegExp("^" + req.body.filter.typeCasts.toLowerCase().trim(), "i");
		if(filterObj.typeCasts === 'Spanish-Showcase'){
			delete filterObj.typeCasts;
			//filterObj.typeCasts = ['Spanish-Dialect','Spanish-Showcase'];
			filterObj.prefLanguage = 'Spanish';
		}
	}

	return filterObj;
};

/**
 * Create a Talent
 */
exports.create = function(req, res) {

	// clear empty talent _id
	if(typeof req.body != 'undefined' && typeof req.body._id != 'undefined'){
		delete req.body._id;
	}

	let talent = new Talent(req.body);
	talent.user = req.user;

	const allowedRoles = ['admin', 'production coordinator', 'producer/auditions director', 'auditions director', 'audio intern', 'talent director'];

	if (radash.intersects(req.user.roles, allowedRoles)) {
		//console.log(talent);
		talent.save().then(function () {
			// write change to log
			let log = {
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
					let i;
					//generate talent report
					let talentData = '<p><strong>First Name</strong> ' + talent.name + '</p>';
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
					for(const i in talent.unionStatus) {
						talentData += talent.unionStatus[i] + ' ';
					}
					talentData += '<br>';
					for(const i in talent.unionJoined) {
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
					if(talent.voa){
						talentData += '<p><strong>VOA</strong> ' + talent.voa + '</p>';
					}
					talentData += '<p><strong>Typecasts</strong>';
					for(const i in talent.typeCasts) {
						talentData += talent.typeCasts[i] + ' ';
					}
					talentData += '</p>';

					done('', talentData);
				},
				// generate Dave's email
				function(talentData, done) {

					// generate email signature
					let emailSig = '';
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

					let emailSubject = 'NEW TALENT ADDITION TO VO ROSTER:  ' + talent.name + ' ' + talent.lastName,
						mailOptions = {
										to: ['dave@studiocenter.com','samantha@studiocenter.com','shippley@studiocenter.com '],
										from: req.user.email || config.mailer.from,
										subject: emailSubject,
										html: emailHTML
									};

					sgMail
					.send(mailOptions)
					.then(() => {
						done(null, talentData, emailSig );
					}, error => {
						done(error, talentData, emailSig );
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

					let emailSubject = 'NEW TALENT ADDITION TO VO ROSTER:  ' + talent.name + ' ' + talent.lastName,
						mailOptions = {
										to: ['Ken@studiocenter.com'],
										from: req.user.email || config.mailer.from,
										subject: emailSubject,
										html: emailHTML
									};
					
					sgMail
					.send(mailOptions)
					.then(() => {
						done(null, talentData, emailSig );
					}, error => {
						done(error, talentData, emailSig );
					});

				},
				], function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
			});
				return res.jsonp(talent);
		}).catch(function (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else {
		return res.status(403).send({
			message: errorHandler.getErrorMessage('User is not authorized')
		});
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
	let talent = req.talent ;

	talent = Object.assign(talent , req.body);

	talent.save().then(function () {

		// write change to log
		let log = {
			type: 'talent',
			sharedKey: String(talent._id),
			description: talent.name + ' ' + talent.lastName + ' updated ',
			user: req.user
		};
		log = new Log(log);
		log.save();

		res.jsonp(talent);

	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Delete an Talent
 */
exports.delete = function(req, res) {
	let talent = req.talent;

	// send delete talent emails
	async.waterfall([
		// generate Dave's email
		function(done) {

			// generate email signature
			let emailSig = '';
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

			let emailSubject = 'TALENT TERMINATED FROM VO ROSTER: ' + talent.name + ' ' + talent.lastName;

			// send email
			let mailOptions = {
								to: 'Dave@studiocenter.com',
								from: req.user.email || config.mailer.from,
								cc: config.mailer.notifications,
								subject: emailSubject,
								html: emailHTML
							};
			
			sgMail
			.send(mailOptions)
			.then(() => {
				done(null, emailSig);
			}, error => {
				done(error, emailSig);
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

			let emailSubject = 'TALENT TERMINATED FROM VO ROSTER: ' + talent.name + ' ' + talent.lastName,
				mailOptions = {
								to: 'Ken@studiocenter.com',
								from: req.user.email || config.mailer.from,
								cc: config.mailer.notifications,
								subject: emailSubject,
								html: emailHTML
							};
			
			sgMail
			.send(mailOptions)
			.then(() => {
				done(null);
			}, error => {
				done(error);
			});

		},
		function(done) {

			// write change to log
			let log = {
				type: 'talent',
				sharedKey: String(talent._id),
				description: talent.name + ' ' + talent.lastName + ' terminated ',
				user: req.user
			};
			log = new Log(log);
			log.save();

			talent.deleteOne().then(function(talent) {
				res.jsonp(talent);
			}).catch(function (err) {
				done(err);
			});
		}
	], function(err) {
		if (err) {
			return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
		}
	});


};

// retrieve talents count
exports.getTalentsCnt = function(req, res){

	// set filter vars
	let filterObj = getTalentsFilters(req);
	Talent.find(filterObj).count({}).then(function (count) {
		res.jsonp(count);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});

};

exports.findLimitWithFilter = function(req, res) {

	// set filter vars
	let filterObj = getTalentsFilters(req),
		startVal = 0, 
		limitVal = 100;
		
	if(req.body.startVal){
		startVal = req.body.startVal;
	}
	if(req.body.limitVal){
		limitVal = req.body.limitVal;
	}

	Talent.find(filterObj).sort({'firstName': 1,'lastName': 1,'locationISDN': 1,'created': -1}).skip(startVal).limit(limitVal).then(function (talents) {
		res.jsonp(talents);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * List of Talents
 */
exports.list = function(req, res) { Talent.find().sort({'locationISDN': 1,'lastName': 1,'created': -1}).then(function (talents) {
		res.jsonp(talents);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Talent middleware
 */
exports.talentByID = function(req, res, next, id) { 
	Talent.findById(id).then(function (talent) {
		if (! talent) return next(new Error('Failed to load Talent ' + id));
		req.talent = talent ;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Talent authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	const allowedRoles = ['admin','producer/auditions director', 'auditions director', 'audio intern', 'production coordinator', 'talent director'];

	if (!radash.intersects(req.user.roles, allowedRoles)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
