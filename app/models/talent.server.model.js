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
	lastName: {
		type: String,
		default: '',
		required: 'Please fill Talent last name',
		trim: true
	},
	type: {
		type: Array,
		required: 'Please select a Talent type',
	},
	email: {
		type: String
	},
	email2: {
		type: String
	},
	phone: {
		type: String
	},
	phone2: {
		type: String
	},
	gender: {
		type: String,
		trim: true
	},
	ageRange: {
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