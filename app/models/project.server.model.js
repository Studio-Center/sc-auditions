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
						options: ['in progress','complete'],
						startDate: '',
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'in progress',
						options: ['in progress','complete'],
						startDate: '',
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'in progress',
						options: ['in progress','Holding for more talent','Holding For Requested Talent','complete'],
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
	clientClient: {
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