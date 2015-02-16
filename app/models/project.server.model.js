'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date
	},
	estimatedCompletionDate: {
		type: Date
	},
	estimatedTime: {
		type: Number
	},
	actualTime: {
		type: Number
	},
	scopeCreep: {
		type: Number
	},
	phases: {
		type: Array
	},
	status: {
		type: [{
			type: String,
			enum: ['Not started', 'Open', 'Client Completed', 'Completed', 'Suspended']
		}],
		default: ['Not started']
	},
	priority: {
		type: [{
			type: String,
			enum: ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high']
		}],
		default: ['None']
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	scripts: {
		type: Array
	},
	auditions: {
		type: Array
	},
	discussion: {
		type: Array
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	team: {
		type: Array
	},
	talent: {
		type: Array
	},
	client: {
		type: Array
	},
	deleteFiles: {
		type: Array
	}
});

/**
 * Hook append default project phases
 */
ProjectSchema.pre('save', function(next) {

	var now = new Date();

	this.phases = [
					{
						name: 'Project Creation',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Casting',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Recording',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Client Review',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Followup',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Session Booked',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Talent Booked',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Session Produced',
						status: 'open',
						startDate: now.toJSON(),
						endDate: ''
					}
				];

	next();
});

mongoose.model('Project', ProjectSchema);