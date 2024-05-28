
const mongoose = require('mongoose'),
	Log = mongoose.model('Log'),
	fs = require('fs'),
	async = require('async'),
	mv = require('mv'),
    errorHandler = require('../../errors');
    
const fileFuncs = {
    moveFile: function(tempPath, newPath){
        mv(tempPath, newPath, function(err) {
            if (err){
                errorHandler.getErrorMessage(err);
            }
            // if (err){
            //     res.status(500).end();
            // }else{
            //     res.status(200).end();
            // }
        });
    },
    // rename file from local file system
    renameFiles: function(project, res, req){

        let appDir = global.appRoot;

        for(const i in project.auditions) {
            let file = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].file.name;
            let newFile = appDir + '/public/res/auditions/' + project._id + '/' + project.auditions[i].rename;

            // move file if exists
            if (fs.existsSync(file) && project.auditions[i].rename !== '') {
                moveFile(file, newFile);

                // write change to log
                let log = {
                    type: 'project',
                    sharedKey: String(project._id),
                    description: project.title + ' project file ' + project.auditions[i].file.name + ' renamed to ' + project.auditions[i].rename,
                    user: req.user
                };
                log = new Log(log);
                log.save();

                // change stored file name
                project.auditions[i].file.name = project.auditions[i].rename;
                project.auditions[i].rename = '';

            }
        }

    },
    // remove file from local file system
    deleteFiles: function(project, req, user){

        let appDir = global.appRoot;

        for(const i in project.deleteFiles) {
            let file = appDir + '/public' + project.deleteFiles[i];

            // remove file if exists
            if (fs.existsSync(file)) {
                fs.unlinkSync(file, (err) => {
                    if (err) {
                        errorHandler.getErrorMessage(err);
                    }
                });

                // write change to log
                let log = {
                    type: 'project',
                    sharedKey: String(project._id),
                    description: project.title + ' project file ' + project.deleteFiles[i] + ' deleted',
                    user: req.user
                };
                log = new Log(log);
                log.save();
            }

            // remove file from delete queue
            project.deleteFiles.splice(i, 1);
        }

    },
    removeFolder: function(location) {
        fs.readdir(location, function (err, files) {
            async.each(files, function (file, cb) {
                file = location + '/' + file;
                fs.stat(file, function (err, stat) {
                    if (err) {
                        return cb(err);
                    }
                    if (stat.isDirectory()) {
                        fileFuncs.removeFolder(file, cb);
                    } else {
                        if (fs.existsSync(file)) {
                            fs.unlink(file, function (err) {
                                if (err) {
                                    return cb(err);
                                }
                                return cb();
                            });
                        }
                    }
                });
            });
        });
    },
    walk: function(dir, done) {
        let results = [], fileData = {}, fileInfo, fileName, fileExt;
        fs.readdir(dir, function(err, list) {
          if (err) return done(err);
          let pending = list.length;
          if (!pending) return done(null, results);
          list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
              if (stat && stat.isDirectory()) {
                walk(file, function(err, res) {
                  results = results.concat(res);
                  if (!--pending) done(null, results);
                });
              } else {
                fileInfo = file.split('/');
                fileName = fileInfo[fileInfo.length-1];
                fileExt = fileName.split('.');
                fileExt = fileExt[fileExt.length-1];
      
                fileInfo.pop();
      
                // only push JSON.txt documents
                if(fileName === 'JSON.txt'){
                    fileData = {
                        path: file,
                        parentPath: fileInfo.join('/'),
                        name: fileName,
                        ext: fileExt
                    };
                    results.push(fileData);
                  }
                if (!--pending) done(null, results);
              }
            });
          });
        });
    }
}

module.exports = fileFuncs;