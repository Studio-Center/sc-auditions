'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Projecttalent Schema
 */
var ProjecttalentSchema = new Schema({
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
	locationISDN : {
		type: String
	},
	nameLnmCode : {
		type: String
	},
	requested : {
		type: Boolean
	},
	regular : {
		type: Boolean
	},
	part : {
		type: String
	},
	status : {
		type: String
	},
	booked : {
		type: Boolean,
		default: false
	},
	email : {
		type: String
	},
	name : {
		type: String
	},
	talentId : {
		type: String
	},
});

mongoose.model('Projecttalent', ProjecttalentSchema);
