'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Agency Schema
 */
var AgencySchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Agency name',
		trim: true
	},
	description: {
		type: String,
		trim: true
	},
	clients: {
		type: Object
	},
	notes: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Agency', AgencySchema);