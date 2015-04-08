'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	now = new Date();

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
		type: Date,
		required: 'Please fill an estimated completion date',
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
						status: 'complete',
						options: ['in progress','complete'],
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'in progress',
						options: ['in progress','complete'],
						startDate: now.toJSON(),
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'in progress',
						options: ['in progress','Holding for more talent','Holding For Requested Talent','complete'],
						startDate: now.toJSON(),
						endDate: ''
					}
				]
	},
	status: {
		type: [{
			type: String,
			enum: ['In Progress', 'On Hold', 'Pending Client Decision', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed']
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
	sounders: {
		type: [{
			type: String,
			enum: ['Sounders', 'No Sounders - Approved By William']
		}],
		default: ['Sounders']
	},
	scripts: {
		type: Array,
		required: 'You must assign a script'
	},
	referenceFiles: {
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
		type: Array,
		required: 'You must assign a talent'
	},
	client: {
		type: Array,
		required: 'Please select main clients for the project!',
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