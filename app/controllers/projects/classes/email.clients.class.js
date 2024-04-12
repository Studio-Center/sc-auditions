

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
    
var emailClients = function(client, email, project, req, res){
    async.waterfall([
        function(done) {
            User.findOne({'_id':client.userId}).sort('-created').then(function (clientInfo) {
                done(null, clientInfo);
            });
        },
        function(clientInfo, done) {
            var emailSig = '';
            if(req.user.emailSignature){
                emailSig = req.user.emailSignature;
            } else {
                emailSig = '';
            }
            res.render('templates/projects/create-project-client-email', {
                email: email,
                emailSignature: emailSig,
                project: project,
                client: client,
                clientInfo: clientInfo,
                audURL: 'http://' + req.headers.host + '/#!/signin',
                dueDate: dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT')
            }, function(err, clientEmailHTML) {
                done(err, clientInfo, clientEmailHTML);
            });
        },
        function(clientInfo, clientEmailHTML, done){

            var emailSubject = 'Your audition project:  ' + project.title + ' Due ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';

            // send email
            var transporter = nodemailer.createTransport(sgTransport(config.mailer.options));

            var mailOptions = {
                                to: client.email,
                                from: req.user.email || config.mailer.from,
                                replyTo: req.user.email || config.mailer.from,
                                cc: config.mailer.notifications,
                                subject: emailSubject,
                                html: clientEmailHTML
                            };

            transporter.sendMail(mailOptions);

            // write change to log
            var log = {
                type: 'project',
                sharedKey: String(project._id),
                description: 'client ' + clientInfo.displayName + ' sent project created email ' + project.title,
                user: req.user
            };
            log = new Log(log);
            log.save();

        }
    ], function(err) {
        if (err) {
            return res.status(400).json(err);
        } else {
            res.status(200).jsonp();
        }
    });
};
    
module.exports = emailClients;