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
	parentName: {
		type: String
	},
	type: {
		type: Array,
		required: 'Please select a Talent type',
	},
	exclusivity: {
		type: String
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
		type: Array,
		required: 'Please select a union status'
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
	ISDNLine1: {
		type: String
	},
	ISDNLine2: {
		type: String
	},
	sourceConnectUsername: {
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