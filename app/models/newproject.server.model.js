'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Log Schema
 */
const NewprojectSchema = new Schema({
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
},{
	versionKey: false
});

mongoose.model('Newproject', NewprojectSchema);
