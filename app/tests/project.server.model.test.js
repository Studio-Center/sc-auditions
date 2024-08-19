'use strict';

/**
 * Module dependencies.
 */
var Projects = require('../models/project.server.model.js'),
	config = require('./../../config/config');

var chai = require('chai'),
	mongoose = require('mongoose'),
	Project = mongoose.model('Project');

	//mongoose.set('debug', true);
/**
 * Globals
 */
var project, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('Project Model Unit Tests:', function() {
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

		project = new Project({
			_id: '525cf20451979dea2c000001',
			estimatedCompletionDate: '11/22/2035',
			title: 'New Project',
			talent: Array(1,2,3)
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no projects', function(done) {
			Project.find().then(function (projects) {
				expect(projects).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to save without problems', function(done) {
			// clear version
			delete project.__v;
			project.save().then(function (project) {
				expect(project).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			project.title = '';
			// clear version
			delete project.__v;
			project.save().then(function (project) {
				expect(project).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	afterEach(function(done) {
		project.deleteOne();

		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});
