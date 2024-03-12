'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Talent Schema
 */
const TalentSchema = new Schema({
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
	birthYear: {
		type: String
	},
	type: {
		type: String,
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
	unionJoined: {
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
		type: String,
		required: 'Please select a location',
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
	producerOptional: {
		type: String
	},
	demoLink: {
		type: String
	},
	typeCasts: {
		type: Array
	},
	prefLanguage: {
		type: String
	},
	note: {
		type: String
	},
	voa: {
		type: Boolean,
		default: false
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
