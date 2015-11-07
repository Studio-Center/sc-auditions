'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Log Schema
 */
var NewprojectSchema = new Schema({
	project: {
		type: String,
		required: 'Please enter a project',
		trim: true
	},
	sub: {
		type: Object,
		trim: true
	},
  attachements: {
		type: Array
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Newproject', NewprojectSchema);
