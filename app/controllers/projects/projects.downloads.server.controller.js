'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Audition = mongoose.model('Audition'),
	fs = require('fs'),
	async = require('async'),
	archiver = require('archiver');


exports.downloadAllAuditionsClient = function(req, res, next){

    Audition.find({'project': Object(req.body.project._id),'published':{ "$in": ["true",true] }}).sort('-created').then(function (auditionsFiles) {
        
        let i = 0,
            fileLoc = '';
        // get app dir
        let appDir = global.appRoot,
            relativePath =  'res' + '/' + 'auditions' + '/' + req.body.project._id + '/',
            newPath = appDir + '/public/' + relativePath,
            savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/',
            zipName = req.body.project.title.replace('/','-') + '.zip',
            newZip = savePath + zipName;

        // check for existing parent directory, create if needed
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath);
        }

        let output = fs.createWriteStream(newZip),
            archive = archiver('zip');

        output.on('close', function() {
            res.jsonp({zip:zipName});
        });

        for(const i in auditionsFiles) {
            fileLoc = newPath + auditionsFiles[i].file.name;
            archive.file(fileLoc, { name:auditionsFiles[i].file.name });
        }

        archive.pipe(output);
        archive.finalize();

    }).catch(function (err) {
        res.status(500).end();
    });
    
};


exports.downloadAllAuditions = function(req, res, next){
    // get app dir
    let appDir = global.appRoot,
        relativePath =  'res' + '/' + 'auditions' + '/' + req.body.project._id + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/',
        zipName = req.body.project.title.replace('/','-') + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip),
        archive = archiver('zip');

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    archive.directory(newPath, 'my-auditions');

    archive.pipe(output);
    archive.finalize();

    //    res.setHeader('Content-Type', 'application/zip');
    // res.setHeader('content-disposition', 'attachment; filename="auditions.zip"');
    //    return archive.pipe(res);

};

exports.downloadBookedAuditions = function(req, res, next){

    // method vars
    let projectId = req.body.projectId,
        projectTitle = req.body.projectTitle.replace('/','-'),
        bookedAuds = req.body.bookedAuds;

    // get app dir
    let appDir = global.appRoot,
        relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/',
        zipName = projectTitle + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip),
        archive = archiver('zip');

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    // add all booked auditions
    async.eachSeries(bookedAuds, function (audition, next) {

        if (fs.existsSync(newPath + audition)) {
            archive.file(newPath + audition, { name:audition });
        }

        next();

    }, function done(err) {

        archive.pipe(output);
        archive.finalize();

    });

};


exports.downloadSelectedAuditions = function(req, res, next){

    // method vars
    let projectId = req.body.projectId,
        projectTitle = req.body.projectTitle.replace('/','-'),
        selAuds = req.body.selectedAuds;

    // get app dir
    let appDir = global.appRoot,
        relativePath =  'res' + '/' + 'auditions' + '/' + projectId + '/',
        newPath = appDir + '/public/' + relativePath,
        savePath = appDir + '/public/' + 'res' + '/' + 'archives' + '/',
        zipName = projectTitle + '.zip',
        newZip = savePath + zipName;

    // check for existing parent directory, create if needed
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    let output = fs.createWriteStream(newZip),
        archive = archiver('zip');

    output.on('close', function() {
        res.jsonp({zip:zipName});
    });

    // add all booked auditions
    async.eachSeries(selAuds, function (audition, next) {

        if (fs.existsSync(newPath + audition)) {
            archive.file(newPath + audition, { name:audition });
        }
        next();

    }, function (err) {

        archive.pipe(output);
        archive.finalize();

    });

};
