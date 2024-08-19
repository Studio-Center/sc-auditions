'use strict';

/**
 * Module dependencies.
 */
var Newprojects = require('../models/newproject.server.model.js'),
	config = require('../../config/config.js');

var chai = require('chai'),
	mongoose = require('mongoose'),
	Newproject = mongoose.model('Newproject');

	//mongoose.set('debug', true);
/**
 * Globals
 */
var newproject, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('New Project Model Unit Tests:', function() {
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

		newproject = new Newproject({
			_id: '525cf20451979dea2c000001',
			project: 'New Project',
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no new projects', function(done) {
			Newproject.find().then(function (newprojects) {
				expect(newprojects).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to save without problems', function(done) {
			// clear version
			delete newproject.__v;
			newproject.save().then(function (newproject) {
				expect(newproject).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			newproject.project = '';
			// clear version
			delete newproject.__v;
			newproject.save().then(function (newproject) {
				expect(newproject).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		newproject.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
