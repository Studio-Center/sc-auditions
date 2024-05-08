

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    User = mongoose.model('User'),
    Log = mongoose.model('Log'),
    config = require('../../../../config/config'),
    async = require('async'),
    sgMail = require('@sendgrid/mail'),
    radash = require('radash'),
    dateFormat = require('dateformat'),
    Talent = mongoose.model('Talent');
    
// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

const emailFuncs = {
    clients: function(client, email, project, req, res){
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
                var fromEmail = req.user.email || config.mailer.from;

                var mailOptions = {
                                    to: client.email,
                                    from: fromEmail,
                                    cc: config.mailer.notifications,
                                    subject: emailSubject,
                                    html: clientEmailHTML
                                };
                
                try{
                    sgMail
                    .send(mailOptions).then(() => {
                        // write change to log
                        var log = {
                            type: 'project',
                            sharedKey: String(project._id),
                            description: 'client ' + clientInfo.displayName + ' sent project created email ' + project.title,
                            user: req.user
                        };
                        log = new Log(log);
                        log.save();

                        done(null);
                    }, error => {
                        done(error);
                    });
                }catch (error) {
                    console.error("Email could not be sent: ", error);
                }
                    
            }
        ], function(err) {
            if (err) {
                return res.status(400).json(err);
            } else {
                res.status(200).jsonp();
            }
        });
    },
    talent: function(selTalent, talentInfo, email, project, req, res, subjectAd){

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
                var emailSubject = '',
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

                // rem dups
                var fromEmail = owner.email || config.mailer.from;
                talentEmails = radash.unique(talentEmails);
                talentEmails = radash.diff(talentEmails, [fromEmail]);

                var mailOptions = {
                    to: talentEmails,
                    from: fromEmail,
                    subject: emailSubject,
                    html: talentEmailHTML
                };

                try{
                    sgMail
                    .send(mailOptions)
                    .then(() => {
                        // write change to log
                        var log = {
                            type: 'talent',
                            sharedKey: selTalent.talentId,
                            description: 'sent new project email to talent ' + selTalent.name + ' for ' + project.title,
                            user: req.user
                        };
                        log = new Log(log);
                        log.save();
    
                        done(null);
                    }, error => {
                        done(error);
                    });
                }catch (error) {
                    console.error("Email could not be sent: ", error);
                }
                
                
            },
            ], function(err) {
            //return res.status(400).json(err);
        });
    
    },
    talentStartEmail: function(req, res, project, talent, override){

        async.waterfall([
            // gather info for selected talent
            function(done) {
                Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
                    done(null, talentInfo);
                }).catch(function (err) {
                    done(err, null);
                });
            },
            // generate email body
            function(talentInfo, done) {
                var email =  {
                                projectId: '',
                                to: [],
                                bcc: [],
                                subject: '',
                                header: '',
                                footer: '',
                                scripts: '',
                                referenceFiles: ''
                            };
                if(talentInfo.type.toLowerCase() === 'email' || override === true){
                    var i;
    
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
                }
    
                done('', email, talentInfo);
            },
            // update talent email status
            function(email, talentInfo, done){
    
                // update talent email status
                for(var i = 0; i < project.talent.length; ++i){
                    if(project.talent[i].talentId === talent.talentId){
                        if(talentInfo.type.toLowerCase() === 'email' || override === true){
                            project.talent[i].status = 'Emailed';
                        }
                        done('', email, talentInfo);
                    }
                }
    
            },
            // email selected talent
            function(email, talentInfo, done){
                // only send email to talent if that is the preferred contact method
                if(talentInfo.type.toLowerCase() === 'email' || override === true){
                    emailFuncs.talent(talent, talentInfo, email, project, req, res);
                }
    
                var newProject = project;
    
                // write change to log
                if(typeof project.log !== 'undefined'){
                    var log = project.log;
                    log.user = req.user;
    
                    log = new Log(log);
                    log.save();
    
                    // also send log for project if talent log attribute
                    if(log.type === 'talent'){
                        log = log.toObject();
                        delete log._id;
    
                        log.type = 'project';
                        log.sharedKey = String(project._id);
    
                        log = new Log(log);
                        log.save();
                    }
                }
    
                Project.findById(project._id).then(function (project) {
                    project.populate('user', 'displayName');
    
                    project = Object.assign(project, newProject);
    
                    req.project = project;
    
                    project.save().then(function () {
                        res.status(200).json(project);
                    }).catch(function (err) {
                        done(err);
                    });
    
                });
    
    
            }
            ], function(err) {
            if (err) {
                if (err) {
                    return res.status(400).json(err);
                } else {
                    return res.status(200).send();
                }
            }
        });
    
    }
}
    
module.exports = emailFuncs;