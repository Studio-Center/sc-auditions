'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	Audition = mongoose.model('Audition'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	config = require('../../../config/config'),
	async = require('async'),
	sgMail = require('@sendgrid/mail'),
	radash = require('radash'),
	dateFormat = require('dateformat');

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

// send email and update project status for selected booked auditions
exports.bookAuditions = function(req, res, next){

	var projectId = req.body.data.project;

	async.waterfall([
		// gather info for selected project
		function(done) {
			Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
				done(null, project);
			});
		},
		// update status for selected booked auditions
		function(project, done) {

			var selAuds = [];

			async.eachSeries(project.auditions, function (audition, next) {
				if(audition.selected === true && (typeof audition.booked === 'undefined' || audition.booked === false)){
					audition.booked = true;
					selAuds.push(audition);
				}
				next();
			}, function (err) {
				done(err, selAuds, project);
			});
		},
		// update status for new selected booked auditions
		function(selAuds, project, done) {

			// gather audition data from auditions collection
			Audition.find({'project': project._id}).sort('-created').then(function (auditions) {
				if (auditions) {
					async.eachSeries(auditions, function (audition, next) {
						if(audition.selected === true && (typeof audition.booked === 'undefined' || audition.booked === false)){
							audition.booked = true;
							selAuds.push(audition);
							audition.save();
						}
						next();
					}, function (err) {
						done(err, selAuds, project);
					});
				}
			});
		},
		// update project
		function(selAuds, project, done) {

			var newProject = project.toObject();

			newProject.status = 'Booked';

			Project.findById(project._id).then(function (project) {

				project = Object.assign(project, newProject);

				project.save().then(function () {
						done(null, selAuds, project);
				});

			});
		},
		// gather client email, send out emails
		function(selAuds, project, done){

			var clients = [];

			async.eachSeries(project.client, function (client, clientCallback) {

				User.findOne({'_id':client.userId}).sort('-created').then(function (clientInfo) {
					clients.push(clientInfo);
					clientCallback();
				});

			}, function (err) {
				done(err, clients, selAuds, project);
		   	});
		},
		function(clients, selAuds, project, done){

			var clientsEmails = [];

			async.eachSeries(clients, function (client, clientCallback) {

				clientsEmails.push(client.email);
				clientCallback();

			}, function (err) {
				done(err, clientsEmails, selAuds, project);
	   	});
		},
		// get project owner data
		function(clientsEmails, selAuds, project, done) {

			// gather project owner data
			var ownerId;
			if(!project.owner){
				ownerId = project.user;
			} else{
				ownerId = project.owner;
			}

			User.findOne({'_id':ownerId}).sort('-created').then(function (ownerInfo) {
				done(null, ownerInfo, clientsEmails, selAuds, project);
			});
		},
		function(ownerInfo, clientsEmails, selAuds, project, done){

			// generate email signature
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

			var emailSig = '';
			if(ownerInfo.emailSignature){
				emailSig = ownerInfo.emailSignature;
			} else {
				emailSig = '';
			}

			// assign booked list
			var bookedText = '<p>';
			for(var i = 0; i < selAuds.length; ++i){
				bookedText += '<a href="http://' + req.headers.host + '/res/auditions/' + project._id + '/' + selAuds[i].file.name + '">' + selAuds[i].file.name + '</a><br>';
			}
			bookedText += '</p>';

			res.render('templates/projects/booked-audition-email', {
				user: req.user,
				project: project,
				dueDate: newDate,
				emailSignature: emailSig,
				bookedText: bookedText
			}, function(err, bookedEmailHTML) {
				done(err, ownerInfo, clientsEmails, selAuds, project, bookedEmailHTML);
			});

		},
		// send out talent project creation email
		function(ownerInfo, clientsEmails, selAuds, project, bookedEmailHTML, done) {
			// send email
			// generate email signature
			var newDate = new Date(project.estimatedCompletionDate);
			newDate = newDate.setHours(newDate.getHours() - 1);
			newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');

			var emailSubject = 'Auditions Booked - ' + project.title;

			// rem dups
			clientsEmails = radash.unique(clientsEmails);

			var mailOptions = {
				to: clientsEmails,
				cc: [ownerInfo.email, config.mailer.notifications],
				from: ownerInfo.email || config.mailer.from,
				replyTo: ownerInfo.email || config.mailer.from,
				subject: emailSubject,
				html: bookedEmailHTML
			};
			sgMail
			.send(mailOptions)
			.then(() => {
				done(null);
			}, error => {
				done(error);
			});
		}
		], function(err) {
		if (err) {
			return res.status(400).json(err);
		} else {
			return res.status(200).send();
		}
	});
};

exports.test = function(req, res, next){
    // method vars
	var audTalent = '',
		firstName = '',
		lastNameCode = '',
		curUser = Object.create(req.user);

    var file = '120-AlanS.mp3';

    var regStr = /([a-zA-Z]+)\.\w{3}$/i.exec(file);
	if(regStr !== null){
		var regStrOP = regStr[1],
			   lastNm = /([A-Z])[a-z]*$/.exec(regStrOP);

		if(lastNm !== null){
			var lastNmPos = lastNm.index;

			firstName = regStrOP.slice(0,lastNmPos);
			lastNameCode = regStrOP.slice(lastNmPos, regStrOP.length);
		}
	}

    Talent.find({'name': new RegExp('^'+firstName+'$', 'i'), 'lastNameCode': new RegExp('^'+lastNameCode+'$', 'i')}).sort('-created').then(function (talent) {
            return res.jsonp(talent);

//            Project.findById('56fd5d370cd11652504b0cd4').populate('user', 'displayName').exec(function(err, project) {
//				// walk through project talent, look for existing assignment
//                var fndTalent = [];
//                async.eachSeries(project.talent, function (curTalent, talentCallback) {
//
//                    if(talent !== null){
//                        if(String(talent._id) == String(curTalent.talentId)){
//                            audTalent = curTalent.talentId;
//                        }
//                        fndTalent.push(talent._id + ' ' + curTalent.talentId);
//                    }
//                    talentCallback();
//
//                }, function (err) {
//                    return res.jsonp(fndTalent);
//                });
//			});
            //return res.jsonp(talent);
	}).catch(function (err) {
		return res.status(400).json(err);
    });

}
