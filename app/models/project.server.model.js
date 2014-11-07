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
		type: Object
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
		type: Object
	},
	mediaFiles: {
		type: Object
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	team: {
		type: Object
	},
	talent: {
		type: Object
	},
	client: {
		type: Object
	}
});

/**
 * Hook append default project phases
 */
ProjectSchema.pre('save', function(next) {

	this.phases = [
					{
						name: 'Project Creation',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Casting',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Recording',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Client Review',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Followup',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Session Booked',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Talent Booked',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Session Produced',
						status: 'Open',
						startDate: Date.now,
						endDate: ''
					}
				];

	next();
});

mongoose.model('Project', ProjectSchema);