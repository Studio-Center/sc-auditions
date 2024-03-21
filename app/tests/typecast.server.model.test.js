'use strict';

/**
 * Module dependencies.
 */
var Typecast = require('../models/typecast.server.model.js'),
	config = require('./../../config/config');

var chai = require('chai'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Typecast = mongoose.model('Typecast');

/**
 * Globals
 */
var typecast, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Typecast Model Unit Tests:', function() {
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
		typecast = new Typecast({
			name: 'Full'
		});

		done();
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			typecast.save().then(function (typecast) {
				expect(typecast).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			typecast.name = '';

			typecast.save().then(function (typecast) {
				expect(typecast).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) { 
		Typecast.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});