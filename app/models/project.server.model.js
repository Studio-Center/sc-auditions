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
		type: Array,
		default: [{
						name: 'Project Creation',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Casting',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Recording',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Client Review',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Followup',
						status: 'open',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Session Booked',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Talent Booked',
						status: 'not started',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Session Produced',
						status: 'not started',
						startDate: '',
						endDate: ''
					}
				]
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

	next();
});

mongoose.model('Project', ProjectSchema);