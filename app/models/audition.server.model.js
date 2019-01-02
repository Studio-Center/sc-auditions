'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Audition Schema
 */
var AuditionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},
	project: {
		type: Schema.ObjectId,
		ref: 'Project'
	},
	owner: {
		type: String
	},
	file: {
		type: Object
	},
	discussion: {
		type: Array
	},
	description: {
		type: String
	},
	rating: {
		type: Array
	},
	published: {
		type: Boolean,
		default: true
	},
	rename: {
		type: String
	},
	curRating: {
		type: Number
	},
	avgRating: {
		type: Number
	},
	playCnt: {
		type: Number
	},
	favorite: {
		type: Number
	},
	talent:  {
		type: String
	},
	selected: {
		type: Boolean,
		default: false
	},
	booked: {
		type: Boolean,
		default: false
	},
	hidden: {
		type: Boolean,
		default: false
	},
	approved: {
		type: Object
	},
});

mongoose.model('Audition', AuditionSchema);
