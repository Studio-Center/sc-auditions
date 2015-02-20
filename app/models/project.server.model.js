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
						name: 'Casting',
						status: 'in progress',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'in progress',
						startDate: '',
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'in progress',
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
						status: 'not started',
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
			enum: ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned']
		}],
		default: ['Not started']
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