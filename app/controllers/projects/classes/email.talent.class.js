

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Log = mongoose.model('Log'),
	config = require('../../../../config/config'),
	async = require('async'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	dateFormat = require('dateformat');
    
var emailTalent = function(selTalent, talentInfo, email, project, req, res, subjectAd){

    async.waterfall([
        function(done) {
            var ownerId = project.owner || project.user._id;
            User.findOne({'_id':ownerId}).sort('-created').then(function (owner) {
                owner = owner || req.user;
                done(null, owner);
            }).catch(function (err) {
                done(err, req.user);
            });
        },
        function(owner, done) {

            var emailTmpl = 'templates/projects/new-project-talent-email';
            // load language specific email templates
            if(talentInfo.prefLanguage === 'Spanish'){
                emailTmpl = 'templates/projects/new-project-talent-email-spanish';
            }

            var newDate = new Date(project.estimatedCompletionDate);
            newDate = newDate.setHours(newDate.getHours() - 1);
            newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');
            var part = '';

            // generate email signature
            var emailSig = '';
            if(owner.emailSignature){
                emailSig = owner.emailSignature;
            } else {
                emailSig = '';
            }

            // assign part text
            if(typeof selTalent.part !== 'undefined'){
                if(talentInfo.prefLanguage !== 'Spanish'){
                    if(selTalent.part !== ''){
                        part = '<p>You are cast for the part of ' + selTalent.part + '</p>';
                    }
                } else {
                    if(selTalent.part !== ''){
                        part = '<p>Usted está echado para el papel de ' + selTalent.part + '</p>';
                    }
                }
            }

            // add requested text if needed
            var requestedTxt = '';
            if(selTalent.requested === true){
                requestedTxt = 'REQUESTED ';
            }

            res.render(emailTmpl, {
                email: email,
                emailSignature: emailSig,
                dueDate: newDate,
                part: part,
                requestedTxt: requestedTxt
            }, function(err, talentEmailHTML) {
                done(err, talentEmailHTML, owner);
            });

        },
        // send out talent project creation email
        function(talentEmailHTML, owner, done) {
            // send email
            var transporter = nodemailer.createTransport(sgTransport(config.mailer.options)),
                emailSubject = '',
                newDate = new Date(project.estimatedCompletionDate),
                nameArr = [],
                talentEmails = [talentInfo.email];

            // set vars
            newDate = newDate.setHours(newDate.getHours() - 1);
            nameArr = talentInfo.name.split(' ');
            // add second email contact is available
            if(typeof talentInfo.email2 !== 'undefined'){
                talentEmails.push(talentInfo.email2);
            }

            // assign email subject line
            if(selTalent.requested === true){
                emailSubject = nameArr[0] + ' has a REQUESTED Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
            } else {
                emailSubject = nameArr[0] + ' has an Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
            }
            if(typeof subjectAd !== 'undefined'){
                emailSubject = 'NEW ' + subjectAd + ' FILE ' + emailSubject;
            }

            var mailOptions = {
                to: talentEmails,
                from: owner.email || config.mailer.from,
                replyTo: owner.email || config.mailer.from,
                subject: emailSubject,
                html: talentEmailHTML
            };

            transporter.sendMail(mailOptions, function(err){

                // write change to log
                var log = {
                    type: 'talent',
                    sharedKey: selTalent.talentId,
                    description: 'sent new project email to talent ' + selTalent.name + ' for ' + project.title,
                    user: req.user
                };
                log = new Log(log);
                log.save();

                done(err);
            });
        },
        ], function(err) {
        //return res.status(400).json(err);
    });

};

module.exports = emailTalent;