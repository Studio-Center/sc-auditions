'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Talent Schema
 */
var TalentSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Talent name',
		trim: true
	},
	type: {
		type: String
	},
	gender: {
		type: String,
		trim: true
	},
	unionStatus: {
		type: Array
	},
	producerID: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	demoProducer: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	lastNameCode: {
		type: String,
		trim: true
	},
	outageTimes: {
		type: String
	},
	locationISDN: {
		type: String
	},
	typeCasts: {
		type: Array
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

mongoose.model('Talent', TalentSchema);