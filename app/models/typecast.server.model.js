'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Typecast Schema
 */
const TypecastSchema = new Schema({
	sort: {
		type: Number,
		default: 0
	},
	name: {
		type: String,
		default: '',
		required: 'Please fill Typecast name',
		trim: true,
		unique: true, 
		dropDups: true
	},
	attributes: {
		type: Array,
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

mongoose.model('Typecast', TypecastSchema);