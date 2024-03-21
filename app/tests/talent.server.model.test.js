'use strict';

/**
 * Module dependencies.
 */
var Talent = require('../models/talent.server.model.js'),
	config = require('./../../config/config');

var chai = require('chai'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent');

/**
 * Globals
 */
var talent, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Talent Model Unit Tests:', function() {
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
		talent = new Talent({
			name: 'Talent Name',
			lastName: 'namer',
			type: 'type',
			unionStatus: ['union'],
			locationISDN: 'ISDN'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no talents', function(done) {
			Talent.find().then(function (talents) {
				expect(talents).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to save without problems', function(done) {
			talent.save().then(function (talent) {
				expect(talent).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			talent.name = '';

			talent.save().then(function (talent) {
				expect(talent).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		talent.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
