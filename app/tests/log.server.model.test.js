'use strict';

/**
 * Module dependencies.
 */
var Logs = require('../models/log.server.model.js'),
	config = require('./../../config/config');

var should = require('should'),
	mongoose = require('mongoose'),
	Log = mongoose.model('Log');

mongoose.connect(config.db);

/**
 * Globals
 */
var log;

/**
 * Unit tests
 */
describe('Log Model Unit Tests:', function() {
	beforeEach(function(done) {

		log = new Log({
			type: 'test',
			sharedKey: String('test'),
			description: 'test-log',
			user: Object('test-user')
		});

		done();
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return log.save().then(function (log) {
				should.exist(log);
				done();
			}).catch(function (err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without type', function(done) {
			log.type = '';

			return log.save().then(function (log) {
				should.exist(log);
				done();
			}).catch(function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		log.remove();

		done();
	});
});
