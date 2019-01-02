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
		type: Date,
		default: Date.now
	},
	owner: {
		type: String
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
	preClose: {
		type: Boolean,
		default: false
	},
	phases: {
		type: Array,
		default: [{
						name: 'Casting',
						status: 'complete',
						options: [
							'in progress',
							'complete'
						],
						changeDate: '',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Talent Notification',
						status: 'in progress',
						options: [
							'in progress',
							'complete'
						],
						changeDate: '',
						startDate: Date.now,
						endDate: ''
					},
					{
						name: 'Posting and Publishing',
						status: 'in progress',
						options: [
							'in progress',
							'Holding for more talent',
							'Holding For Requested Talent',
							'Waiting For Clients to Be Added',
							'complete'
						],
						changeDate: '',
						startDate: Date.now,
						endDate: ''
					}
				]
	},
	status: {
		type: [{
			type: String,
			enum: [
				'In Progress',
				'On Hold',
				'Booked',
				'Canceled',
				'ReAuditioned',
				'Dead',
				'Closed - Pending Client Decision',
				'Complete'
			]
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
			enum: [
				'Sounders',
				'No Sounders - Approved By William'
			]
		}],
		default: ['Sounders']
	},
	scripts: {
		type: Array
		//required: 'You must assign a script'
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
		type: Array
	},
	clientClient: {
		type: Array
	},
	deleteFiles: {
		type: Array
	},
	counts: {
		type: Object
	},
	clientNotes: {
		type: Array
	},
});

/**
 * Hook append default project phases
 */
//ProjectSchema.pre('save', function(next) {
//
//	next();
//});

mongoose.model('Project', ProjectSchema);
