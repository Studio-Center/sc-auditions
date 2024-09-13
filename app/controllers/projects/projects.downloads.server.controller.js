'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Audition = mongoose.model('Audition'),
	fs = require('fs'),
	async = require('async'),
	archiver = require('archiver'),
    errorHandler = require('../errors'),
    archive = archiver('zip');


exports.downloadAllAuditionsClient = function(req, res, next){

    Audition.find({'project': Object(req.body.project._id),'published':{ "$in": ["true",true] }}).sort('-created').then(function (auditionsFiles) {
        
        let appDir = global.appRoot,
            relativePath =  'res/auditions/' + req.body.project._id + '/',
            newPath = appDir + '/public/' + relativePath,
            savePath = appDir + '/public/res/archives/',
            zipName = req.body.project.title.replace('/','-') + '.zip',
            newZip = savePath + zipName;

        // check for existing parent directory, create if needed
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath);
        }

        let output = fs.createWriteStream(newZip);

        output.on('close', function() {
            res.jsonp({zip:zipName});
        });

        archive.on("error", function (err) {
            errorHandler.getErrorMessage(err);
        });

        // add all booked auditions
        async.eachSeries(auditionsFiles, function (audition, next) {

            if (fs.existsSync(newPath + audition.file.name)) {
                archive.file(newPath + audition.file.name, { name:audition.file.name });
            }
            next();

        }, function (err) {

            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                archive.pipe(output);
            }

        });

    }).catch(function (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
    
};


exports.downloadAllAuditions = function(req, res, next){
    // get app dir
    let appDir = global.appRoot,
        relativePath =  'res/auditions/' + req.body.project._id + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/res/archives/',
        zipName = req.body.project.title.replace('/','-') + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip);

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    archive.on("error", function (err) {
        errorHandler.getErrorMessage(err);
    });

    archive.directory(newPath, 'my-auditions');
    archive.pipe(output);

};

exports.downloadBookedAuditions = function(req, res, next){

    // method vars
    let projectId = req.body.projectId,
        projectTitle = req.body.projectTitle.replace('/','-'),
        bookedAuds = req.body.bookedAuds,
        appDir = global.appRoot,
        relativePath =  'res/auditions/' + projectId + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/res/archives/',
        zipName = projectTitle + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip);

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    archive.on("error", function (err) {
        errorHandler.getErrorMessage(err);
    });

    // add all booked auditions
    async.eachSeries(bookedAuds, function (audition, next) {

        if (fs.existsSync(newPath + audition)) {
            archive.file(newPath + audition, { name:audition });
        }

        next();

    }, function done(err) {

        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            archive.pipe(output);
        }
        
    });

};


exports.downloadSelectedAuditions = function(req, res, next){

    // method vars
    let projectId = req.body.projectId,
        projectTitle = req.body.projectTitle.replace('/','-'),
        selAuds = req.body.selectedAuds,
        appDir = global.appRoot,
        relativePath =  'res/auditions/' + projectId + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/res/archives/',
        zipName = projectTitle + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip);

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    archive.on("error", function (err) {
        errorHandler.getErrorMessage(err);
    });

    // add all booked auditions
    if(selAuds.length > 0){
        async.eachSeries(selAuds, function (audition, next) {

            if (fs.existsSync(newPath + audition)) {
                archive.file(newPath + audition, { name:audition });
            }
            next();
    
        }, function (err) {
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                archive.pipe(output);
            }
    
        });
    } else {
        archive.pipe(output);
    }
    

};
