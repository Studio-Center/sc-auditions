'use strict';

const moment = require('moment-timezone');

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	let output;

	try {
		let fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch(ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	let message = '',
		logString = '';

	if(typeof err === 'string'){
		message = err;
	} else {
		message = err;
	}

	logString = moment().format('MM-DD-YYYY hh:mm a') + ' ' + message;

	// write message to console
	console.log(logString);

	// return value
	return logString;
};