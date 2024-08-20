'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Log Schema
 */
const LogSchema = new Schema({
	type: {
		type: String,
		required: 'Please enter a type',
		trim: true
	},
	sharedKey: {
		type: String,
		required: 'Please enter a shared key',
		trim: true
	},
	description: {
		type: String,
		required: 'Please enter a description',
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
},{
	versionKey: false
});

mongoose.model('Log', LogSchema);