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
	let message = '';

	if(typeof err === 'string'){
		message = err;
	} else {
		// if (err.code) {
		// 	switch (err.code) {
		// 		case 11000:
		// 		case 11001:
		// 			message = getUniqueErrorMessage(err);
		// 			break;
		// 		default:
		// 			message = 'Something went wrong';
		// 	}
		// } else {
		// 	for (let errName in err.errors) {
		// 		if (err.errors[errName].message) message = err.errors[errName].message;
		// 	}
		// }
		message = err;
	}

	// write message to console
	console.log(moment().format('MM-DD-YYYY hh:mm a') + ' ' + message);
	// return value
	return message;
};