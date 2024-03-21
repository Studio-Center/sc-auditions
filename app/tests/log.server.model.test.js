'use strict';

/**
 * Module dependencies.
 */
var Logs = require('../models/log.server.model.js'),
	Users = require('../models/user.server.model.js'),
	config = require('./../../config/config');

var chai = require('chai'),
	mongoose = require('mongoose'),
	Log = mongoose.model('Log'),
	User = mongoose.model('User');
	
/**
 * Globals
 */
var log, user, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Log Model Unit Tests:', function() {
	before(function(done) {

		mongoose.connect(config.db).then(function () {
			db = mongoose.connection;
			db.dropDatabase();
			db.on('error', console.error.bind(console, 'Error connecting to DB'));
			db.once('open', () => {
				console.log('Connected to new_demo db');
			});
			done();
		}).catch(function (err) {
			done(err);
		});
		
	});

	beforeEach(function(done) {
		
		user = new User({
			'firstName':'test',
			'lastName':'user',
			'username':'testeruser'
		});

		log = new Log({
			type: 'test',
			sharedKey: String('test'),
			description: 'test-log',
			user: user
		});

		done();
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			log.save().then(function (log) {
				expect(log).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without type', function(done) {
			log.type = '';

			log.save().then(function (log) {
				expect(log).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		log.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
