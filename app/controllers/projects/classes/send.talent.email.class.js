

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    Talent = mongoose.model('Talent'),
    Log = mongoose.model('Log'),
    _ = require('lodash'),
    async = require('async');
    
var sendTalentEmail = function(req, res, project, talent, override){

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
                emailTalent(talent, talentInfo, email, project, req, res);
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

                project = _.extend(project, newProject);

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
                return res.status(200);
            }
        }
    });

};
    
module.exports = sendTalentEmail;