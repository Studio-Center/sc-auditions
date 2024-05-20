'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent'),
	Log = mongoose.model('Log'),
	Newproject = mongoose.model('Newproject'),
	config = require('../../../config/config'),
	async = require('async'),
    sgMail = require('@sendgrid/mail'),
    radash = require('radash'),
	dateFormat = require('dateformat'),
	emailTalent = require('./classes/email.class').talent,
    talentStartEmail = require('./classes/email.class').talentStartEmail;

// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

exports.sendEmail = function(req, res){

    // ensure email body is not blank
    if(typeof req.body.email !== 'undefined'){

        // gather admin and producers emails to include in send
        async.waterfall([
            function(done) {
                let email = req.body.email;

                res.render('templates/email-message', {
                    email: email
                }, function(err, emailHTML) {
                    done(err, emailHTML, email, bcc);
                });
            },
            function(emailHTML, email, done) {

                // remove email dups
                if(radash.isArray(email.to)){
                    email.to = email.to.map(v => v.toLowerCase());
                    email.to = radash.unique(email.to);
                    email.to = radash.diff(email.to, config.mailer.notifications);
                }

                // send email                
                let mailOptions = {
                    to: email.to,
                    cc: config.mailer.notifications,
                    from: config.mailer.from,
                    subject: email.subject,
                    html: emailHTML
                };

                try{
                    sgMail
                    .send(mailOptions)
                    .then(() => {
                        done();
                    }, error => {
                        done(error);
                    });
                }catch (error) {
                    console.error("Email could not be sent: ", error);
                    done(error);
                }
            },
            ], function(err) {
                if (err) {
                    return res.status(400).json(err);
                } else {
                    res.status(200).jsonp();
                }
        });

    }
};

exports.sendTalentCanceledEmail = function(req, res){

    let projectId = req.body.projectId,
        talents = req.body.talents,
        override = req.body.override || false;

    // reload project
    Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

        // walk through and email all selected clients
        async.eachSeries(talents, function (selTalent, callback) {

            Talent.findOne({'_id':selTalent.talentId}).sort('-created').then(function (talentInfo) {

                // check for null talent return
                if(talentInfo !== null){

                    // filter based on current talent status
                    if((talentInfo.type.toLowerCase() === 'email' || override === true) && selTalent.status.toLowerCase() === 'emailed'){

                        async.waterfall([
                            // update talent email status
                            function(done){

                                // update talent email status
                                for(var i = 0; i < project.talent.length; ++i){
                                    if(project.talent[i].talentId === selTalent.talentId){

                                        project.talent[i].status = 'Canceled';

                                        done('');
                                    }
                                }

                            },
                            function(done) {
                                let ownerId = project.owner || project.user._id;
                                User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
                                    owner = owner || req.user;
                                    done(null, owner);
                                }).catch(function (err) {
                                    done(err, req.user);
                                });
                            },
                            function(owner, done) {

                                let newDate = new Date(project.estimatedCompletionDate);
                                newDate = newDate.setHours(newDate.getHours() - 1);
                                newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');
                                let part = '';

                                // generate email signature
                                let emailSig = '';
                                if(owner.emailSignature){
                                    emailSig = owner.emailSignature;
                                } else {
                                    emailSig = '';
                                }

                                res.render('templates/cancelled-project-email', {
                                    emailSignature: emailSig,
                                    talent: talentInfo,
                                    project: project
                                }, function(err, talentEmailHTML) {
                                    done(err, talentEmailHTML, owner);
                                });

                            },
                            // send out talent project creation email
                            function(talentEmailHTML, owner, done) {
                                // send email
                                let emailSubject = '',
                                    newDate = new Date(project.estimatedCompletionDate);
                                newDate = newDate.setHours(newDate.getHours() - 1);

                                // assign email subject line
                                emailSubject = 'The Audition Project ' + project.title + ' Has Been Cancelled';

                                let mailOptions = {
                                    to: talentInfo.email,
                                    from: owner.email || config.mailer.from,
                                    cc: config.mailer.notifications,
                                    subject: emailSubject,
                                    html: talentEmailHTML
                                };

                                try{
                                    sgMail
                                    .send(mailOptions)
                                    .then(() => {

                                        // write change to log
                                        let log = {
                                            type: 'talent',
                                            sharedKey: selTalent.talentId,
                                            description: 'sent cancelled email for ' + project.title,
                                            user: req.user
                                        };
                                        log = new Log(log);
                                        log.save();

                                        done();
                                    }, error => {
                                        done(error);
                                    });
                                }catch (error) {
                                    console.error("Email could not be sent: ", error);
                                    done(error);
                                }

                            }
                            ], function(err) {
                                callback(err);
                        });

                    } else {
                        callback();
                    }

                } else {
                    callback();
                }
            });

        }, function (err) {
            if( err ) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                // save on finish, no error
                res.jsonp(project);

            }
            });

    });

};

// send project assigned talent new emails if projects gets new scripts
exports.sendTalentScriptUpdateEmail = function(req, res){

    // pause execution for project save
    setTimeout(function() {

    let i,
        projectId = req.body.projectId,
        talents = req.body.talents,
        chgMade = req.body.chgMade;

    // reload project
    Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

        let email =  {
                            projectId: '',
                            to: [],
                            bcc: [],
                            subject: '',
                            header: '',
                            footer: '',
                            scripts: '',
                            referenceFiles: ''
                        };

        // add scripts and assets to email body
        email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
        if(typeof project.scripts !== 'undefined'){
            if(project.scripts.length > 0){
                for(i = 0; i < project.scripts.length; ++i){
                    email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
                }
            } else {
                email.scripts += 'None';
            }
        } else {
            email.scripts += 'None';
        }
        email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
        if(typeof project.referenceFiles !== 'undefined'){
            if(project.referenceFiles.length > 0){
                for(var j = 0; j < project.referenceFiles.length; ++j){
                    email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
                }
            } else {
                email.referenceFiles += 'None';
            }
        } else {
            email.referenceFiles += 'None';
        }

        // walk through and email all selected clients
        async.eachSeries(talents, function (selTalent, callback) {

            Talent.findOne({'_id':selTalent.talentId}).sort('-created').then(function (talentInfo) {

                // check for null talent return
                if(talentInfo !== null){

                    // filter based on current talent status
                    if(talentInfo.type.toLowerCase() === 'email'){

                        emailTalent(selTalent, talentInfo, email, project, req, res, chgMade);

                        callback();

                    } else {
                        callback();
                    }

                } else {
                    callback();
                }
            });

        }, function (err) {

            if( err ) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.status(200).jsonp();
            }

        });

    });

    }, 3500);
};


// send talent project start email
exports.sendTalentEmail = function(req, res){

    let project = req.body.project,
        talent = req.body.talent,
        override = req.body.override || false;

    talentStartEmail(req, res, project, talent, override);

};

// send talent director talent add email
exports.sendTalentDirectorsEmail = function(req, res){

    let projectId = req.body.projectId;

    // reload project
    Project.findOne({'_id':projectId}).sort('-created').then(function (project) {

        // walk through and email all selected clients
        async.waterfall([
        function(done) {
            let ownerId = project.owner || project.user._id;
            User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
                owner = owner || req.user;
                done(null, owner);
            }).catch(function (err) {
                done(err, req.user);
            });
        },
        function(owner, done) {
            User.find({'roles':'talent director'}).sort('-created').then(function (talentdirectors) {
                done(null, owner, talentdirectors);
            });
        },
        function(owner, talentdirectors, done) {

            let i = 0,
                to = [];

            for(i = 0; i < talentdirectors.length; ++i){
                to.push(talentdirectors[i].email);
            }

            res.render('templates/added-talent-email', {
                project: project
            }, function(err, talentEmailHTML) {
                done(err, owner, to, talentEmailHTML);
            });

        },
        // send out talent project creation email
        function(owner, to, talentEmailHTML, done) {
            // send email
            let emailSubject = '',
                newDate = new Date(project.estimatedCompletionDate);
            newDate = newDate.setHours(newDate.getHours() - 1);

            // assign email subject line
            emailSubject = project.title + ' - Additional Talent Added';

            if(to.length > 0){

                to = radash.unique(to);
                to = radash.diff(to, [owner.email]);

                let mailOptions = {
                    to: to,
                    from: owner.email || config.mailer.from,
                    cc: config.mailer.notifications,
                    subject: emailSubject,
                    html: talentEmailHTML
                };
                
                try{
                    sgMail
                    .send(mailOptions)
                    .then(() => {

                        // write change to log
                        let log = {
                            type: 'project',
                            sharedKey: project._id,
                            description: 'sent talent added email for ' + project.title,
                            user: req.user
                        };
                        log = new Log(log);
                        log.save();

                        done();
                    }, error => {
                        console.error(error);
                        done(error);
                    });
                }catch (error) {
                    console.error("Email could not be sent: ", error);
                    done(error);
                }

            } else {
                done();
            }
            
        }
        ], function(err) {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).jsonp();
            }
        });

    });

};

exports.sendTalentEmailById = function(req, res){

    let projectId = req.body.projectId,
        talent = req.body.talent,
        override = req.body.override || false;

    async.waterfall([
        // gather info for selected talent
        function(done) {
            Project.findOne({'_id':projectId}).sort('-created').then(function (project) {
                done(null, project);
            }).catch(function (err) {
                done(err, null);
            });
        },
        function(project, done) {
            project = project.toObject();
            talentStartEmail(req, res, project, talent, override);
        }
        ], function(err) {
        if (err) {
            return res.status(400).json(err);
        } else {
            return res.status(200).send();
        }
    });

};

// convert number to word
var a = ['','First ','Second ','Third ','Fourth ', 'Fifth ','Sixth ','Seventh ','Eighth ','Ninth ','Tenth ','Eleventh ','Twelfth ','Thirteenth ','Fourteenth ','Fifteenth ','Sixteenth ','Seventeenth ','Eighteenth ','Nineteenth '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    // str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) : '';
    // str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) : '';
    // str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]])  : '';
    // str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
    str += a[n[5][1]];
    return str;
}

// send client email based on user button click
exports.sendClientEmail = function(req, res){

	// determine email type
	let template,
        type = req.body.type,
        emlCnt = req.body.count;

	switch(type){
		case 'opening':
			template = 'templates/projects/create-project-client-email';
		break;
		case 'carryover':
			template = 'templates/projects/carryover-email';
		break;
		case 'closing':
			template = 'templates/projects/closing-email';
		break;
	}


	// gather clients ids
	let clientIds = [];
	for(var i = 0; i < req.body.clients.length; ++i){
		if(typeof req.body.clients[i] !== 'undefined' && req.body.clients[i] !== null && req.body.clients[i] !== false){
			clientIds.push(req.body.clients[i]);
		}
	}

	// query required data then email clients
	User.where('_id').in(clientIds).sort('-created').then(function (foundClients) {

		// walk through and email all selected clients
		async.eachSeries(foundClients, function (foundClient, callback) {

			// wrap in anonymous function to preserve client values per iteration
			let curClient = foundClient,
                client = {name: curClient.displayName};

			async.waterfall([
				function(done) {
					let ownerId = req.body.project.owner || req.body.project.user._id;
					User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
						done(null, owner);
					}).catch(function (err) {
						done(err, '');
					});
				},
				function(owner, done) {

					let emailSig = '';
					if(owner.emailSignature){
						emailSig = owner.emailSignature;
					} else if(req.user.emailSignature){
						emailSig = req.user.emailSignature;
					} else {
						emailSig = '';
					}

					res.render(template, {
						emailSignature: emailSig,
						project: req.body.project,
						client: client,
						clientInfo: curClient,
						audURL: 'http://' + req.headers.host + '/#!/signin',
						dueDate: dateFormat(req.body.project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT'),
						dueDateDay: dateFormat(req.body.project.estimatedCompletionDate, 'dddd')
					}, function(err, clientEmailHTML) {
						done(err, clientEmailHTML, owner);
					});

				},
				function(clientEmailHTML, owner, done){

					let emailSubject;

					switch(type){
						case 'opening':
							emailSubject = 'Your audition project: ' + req.body.project.title + ' Due ' + dateFormat(req.body.project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
						break;
						case 'carryover':
							emailSubject = 'Your '+inWords(emlCnt)+' Batch of ' + req.body.project.title + '  Auditions - Studio Center';
						break;
						case 'closing':
							emailSubject = 'Your Audition Project ' + req.body.project.title + ' is Complete';
						break;
					}

					// send email
					let mailOptions = {
										to: curClient.email,
										from: owner.email || req.user.email || config.mailer.from,
										cc: config.mailer.notifications,
										subject: emailSubject,
										html: clientEmailHTML
									};

                    try{
                        sgMail
                        .send(mailOptions)
                        .then(() => {

                            // write change to log
                            let log = {
                                type: 'project',
                                sharedKey: String(req.body.project._id),
                                description: 'client ' + curClient.displayName + ' sent ' + type + ' email ' + req.body.project.title,
                                user: req.user
                            };
                            log = new Log(log);
                            log.save();
        
                            done();
                        }, error => {
                            console.error(error);
                            done(error);
                        });
                    }catch (error) {
                        console.error("Email could not be sent: ", error);
                        done(error);
                    }

				}
				], function(err) {
				callback(err);
			});
		}, function (err) {
			if( err ) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				return res.status(200).send();
			}
       	});

	});

};
    

// send emails from lead form
exports.lead = function(req, res){

	// if honey pot empty perform mailer, if not pretend was success anyway
	if(req.body.acomment.length == 0 && typeof req.user !== 'undefined' && req.user.roles[0] !== 'user'){

		// build email
		let emailBody = 'First Name: ' + req.body.firstName + '\n';
			emailBody += 'Last Name: ' + req.body.lastName + '\n';
			emailBody += 'Company: ' + req.body.company + '\n';
			emailBody += 'Phone: ' + req.body.phone + '\n';
			emailBody += 'Email: ' + req.body.email + '\n';
			emailBody += 'Description: ' + req.body.describe + '\n';

		//var file = req.files.file;
        let appDir = global.appRoot,
            relativePath =  'res' + '/' + 'scripts' + '/temp/',
            newPath = appDir + '/public/' + relativePath,
            attachements = [];

		for(var i = 0; i < req.body.scripts.length; ++i){
			attachements[i] = {
				filename: req.body.scripts[i].file.name,
				path: newPath + req.body.scripts[i].file.name
			};
		}

		// send email
		mailOptions = {
			from: config.mailer.from,
			to: 'scripts@studiocenter.com, william@studiocenter.com',
			cc: config.mailer.notifications,
			subject: 'Start a new Audition Project Form Submission',
			text: emailBody,
			attachments: attachements
		};

        sgMail
        .send(mailOptions)
        .then(() => {}, error => {
            console.error(error);
        });

		let uid = 'N/A';
		if(typeof req.user !== 'undefined'){
			uid = req.user._id;
		}

		// build submission object
		let sub = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			company: req.body.company,
			phone: req.body.phone,
			email: req.body.email,
			describe: req.body.describe
		};

		// save submission to db for later retrieval
		let newproject = {
			project: emailBody,
			sub: sub,
			attachements: req.body.scripts
		};
		newproject = new Newproject(newproject);
		newproject.save();

		// write change to log
		let log = {
			type: 'system',
			sharedKey: uid,
			description: 'new project lead submitted by ' + req.body.firstName + ' ' + req.body.lastName,
			user: req.user
		};
		log = new Log(log);
		log.save();

	}

	return res.status(200).send();
};

