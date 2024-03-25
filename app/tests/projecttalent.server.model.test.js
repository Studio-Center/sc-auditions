'use strict';

/**
 * Module dependencies.
 */
var Projecttalents = require('../models/projecttalent.server.model.js'),
	config = require('../../config/config.js');

var chai = require('chai'),
	mongoose = require('mongoose'),
	Projecttalent = mongoose.model('Projecttalent');
	
/**
 * Globals
 */
var projecttalent, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Projecttalent Model Unit Tests:', function() {
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
		
		projecttalent = new Projecttalent({
			_id: '525cf20451979dea2c000001',
			project: Object('525cf20451979dea2c000001'),
			owner: 'string string',
			file: Object('525cf20451979dea2c000001')
		});

		done();
	});

	describe('Method Save', function() {

		it('should begin with no auditions', function(done) {
			Projecttalent.find().then(function (projecttalents) {
				expect(projecttalents).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to save without problems', function(done) {
			projecttalent.save().then(function (projecttalent) {
				expect(projecttalent).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without type', function(done) {
			projecttalent.type = '';

			projecttalent.save().then(function (projecttalent) {
				expect(projecttalent).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		projecttalent.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
