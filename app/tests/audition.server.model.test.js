'use strict';

/**
 * Module dependencies.
 */
var Auditions = require('../models/audition.server.model.js'),
	config = require('../../config/config.js');

var chai = require('chai'),
	mongoose = require('mongoose'),
	Audition = mongoose.model('Audition');
	
/**
 * Globals
 */
var audition, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Audition Model Unit Tests:', function() {
	before(function(done) {

		mongoose.connect(config.db).then(function () {
			db = mongoose.connection;
			db.dropDatabase();
			db.on('error', console.error.bind(console, 'Error connecting to DB'));
			done();
		}).catch(function (err) {
			done(err);
		});
		
	});

	beforeEach(function(done) {
		
		audition = new Audition({
			_id: '525cf20451979dea2c000001',
			project: Object('525cf20451979dea2c000001'),
			owner: 'string string',
			file: Object('525cf20451979dea2c000001')
		});

		done();
	});

	describe('Method Save', function() {

		it('should begin with no auditions', function(done) {
			Audition.find().then(function (auditions) {
				expect(auditions).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to save without problems', function(done) {
			audition.save().then(function (audition) {
				expect(audition).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without type', function(done) {
			audition.project = '';

			audition.save().then(function (audition) {
				expect(audition).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		audition.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
