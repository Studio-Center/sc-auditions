

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
    Talent = mongoose.model('Talent'),
    errorHandler = require('../../errors');
    
// set sendgrid api key
sgMail.setApiKey(config.mailer.options.auth.api_key);

const emailFuncs = {
    clients: function(client, email, project, req, res){
        async.waterfall([
            function(done) {
                try{
                    User.findOne({'_id':client.userId}).sort('-created')
                    .then(function (clientInfo) {
                        done(null, clientInfo);
                    });
                }catch (error) {
                    done(error, '');
                }
            },
            function(clientInfo, done) {
                let emailSig = '';
                if(req.user.emailSignature){
                    emailSig = req.user.emailSignature;
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
    
                let emailSubject = 'Your audition project:  ' + project.title + ' Due ' + dateFormat(project.estimatedCompletionDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
    
                // send email
                let fromEmail = req.user.email || config.mailer.from,
                    mailOptions = {
                                    to: client.email,
                                    from: fromEmail,
                                    bcc: config.mailer.notifications,
                                    subject: emailSubject,
                                    html: clientEmailHTML
                                };
                
                try{
                    sgMail
                    .send(mailOptions).then(() => {
                        // write change to log
                        let log = {
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
                    done(error);
                }
                    
            }
        ], function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.status(200).jsonp();
            }
        });
    },
    talent: function(selTalent, talentInfo, email, project, req, res, subjectAd){

        async.waterfall([
            function(done) {

                let ownerId = project.owner || project.user._id;

                try{
                    User.findOne({'_id':ownerId}).sort('-created')
                    .then(function (owner) {
                        owner = owner || req.user;
                        done(null, owner);
                    });
                }catch (error) {
                    done(error, req.user);
                }
            },
            function(owner, done) {

                let emailTmpl = 'templates/projects/new-project-talent-email';
                // load language specific email templates
                if(typeof talentInfo.prefLanguage !== 'undefined' && talentInfo.prefLanguage.toLowerCase() === 'spanish'){
                    emailTmpl = 'templates/projects/new-project-talent-email-spanish';
                }
    
                let newDate = new Date(project.estimatedCompletionDate);
                newDate = newDate.setHours(newDate.getHours() - 1);
                newDate = dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT');
                let part = '';
    
                // generate email signature
                let emailSig = '';
                if(owner.emailSignature){
                    emailSig = owner.emailSignature;
                }
    
                // assign part text
                if(typeof selTalent.part !== 'undefined'){
                    if(typeof talentInfo.prefLanguage !== 'undefined' && talentInfo.prefLanguage.toLowerCase() !== 'spanish'){
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
                let requestedTxt = '';
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
                let emailSubject = '',
                    newDate = new Date(project.estimatedCompletionDate),
                    nameArr = [],
                    talentEmails = [talentInfo.email];
    
                // set vars
                newDate = newDate.setHours(newDate.getHours() - 1);
                nameArr = talentInfo.name.split(' ');
                // add second email contact is available
                if(typeof talentInfo.email2 !== 'undefined' && talentInfo.email2 != ''){
                    talentEmails.push(talentInfo.email2);
                }
    
                // assign email subject line
                emailSubject = nameArr[0] + ' has a '+(selTalent.requested === true ? 'REQUESTED ' : '')+'Audition - ' + project.title + ' - Due ' + dateFormat(newDate, 'dddd, mmmm dS, yyyy, h:MM TT') + ' EST';
                if(typeof subjectAd !== 'undefined' && subjectAd !== ''){
                    emailSubject = 'NEW ' + subjectAd + ' FILE ' + emailSubject;
                }

                // rem dups
                let fromEmail = owner.email || config.mailer.from;
                talentEmails = talentEmails.map(v => v.toLowerCase());
                talentEmails = radash.unique(talentEmails);
                talentEmails = radash.diff(talentEmails, [fromEmail]);

                let mailOptions = {
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
                        let log = {
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
                    done(error);
                }
                
                
            },
            ], function(err) {
                if(err){
                    console.log(errorHandler.getErrorMessage(err));
                }
        });
    
    },
    talentStartEmail: function(req, res, project, talent, override){

        async.waterfall([
            // gather info for selected talent
            function(done) {
                try{
                    Talent.findOne({'_id':talent.talentId}).sort('-created').then(function (talentInfo) {
                        done(null, talentInfo);
                    });
                }catch (error) {
                    done(error, null);
                }
            },
            // generate email body
            function(talentInfo, done) {
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
                if(talentInfo.type.toLowerCase() === 'email' || override === true){
    
                    // add scripts and assets to email body
                    email.scripts = '\n' + '<strong>Scripts:</strong>' + '<br>';
                    if(typeof project.scripts !== 'undefined' && project.scripts.length > 0){
                        for(const i in project.scripts) {
                            email.scripts += '<a href="http://' + req.headers.host + '/res/scripts/' + project._id + '/' + project.scripts[i].file.name + '">' + project.scripts[i].file.name + '</a><br>';
                        }
                    } else {
                        email.scripts += 'None';
                    }
                    email.referenceFiles = '\n' + '<strong>Reference Files:</strong>' + '<br>';
                    if(typeof project.referenceFiles !== 'undefined' && project.referenceFiles.length > 0){
                        for(const j in project.referenceFiles) {
                            email.referenceFiles += '<a href="http://' + req.headers.host + '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[j].file.name + '">' + project.referenceFiles[j].file.name + '</a><br>';
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
                for(const i in project.talent) {
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
    
                let newProject = project;
    
                // write change to log
                if(typeof project.log !== 'undefined'){
                    let log = project.log;
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
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    return res.status(200).send();
                }
            }
        });
    
    }
}
    
module.exports = emailFuncs;