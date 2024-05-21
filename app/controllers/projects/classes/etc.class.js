
/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	errorHandler = require('../../errors'),
	Project = mongoose.model('Project');

const etcFuncs = {
    /**
     * List of Projects
     */
    performLoadList: function(req, res, allowedRoles, i, j, limit){

        let curUserId = String(req.user._id),
            selLimit = limit || 50;

        if(req.user.roles[i] === allowedRoles[j]){

            switch(allowedRoles[j]){
                case 'user':
                    Project.find({'user._id': curUserId}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
                        return res.jsonp(projects);
                    }).catch(function (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
                break;
                case 'talent':
                // talent does not currently have access, added to permit later access
                    Project.find({'talent': { $elemMatch: { 'talentId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
                        return res.jsonp(projects);
                    }).catch(function (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
                break;
                case 'client':
                    Project.find({'client': { $elemMatch: { 'userId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
                        return res.jsonp(projects);
                    }).catch(function (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
                break;
                case 'client-client':
                    Project.find({'clientClient': { $elemMatch: { 'userId': curUserId}}}).sort('-estimatedCompletionDate').limit(selLimit).then(function (projects) {
                        return res.jsonp(projects);
                    }).catch(function (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
                break;
            }

        }
    },
    // convert number to word
    inWords: function(num) {
        let a = ['','First ','Second ','Third ','Fourth ', 'Fifth ','Sixth ','Seventh ','Eighth ','Ninth ','Tenth ','Eleventh ','Twelfth ','Thirteenth ','Fourteenth ','Fifteenth ','Sixteenth ','Seventeenth ','Eighteenth ','Nineteenth '];
        let b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

        if ((num = num.toString()).length > 9) return 'overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; var str = '';
        // str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) : '';
        // str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) : '';
        // str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]])  : '';
        // str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
        str += a[n[5][1]];
        return str;
    }
};

module.exports = etcFuncs;