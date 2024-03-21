'use strict';

/**
 * Module dependencies.
 */
var Logs = require('../models/log.server.model.js'),
	Users = require('../models/user.server.model.js'),
	config = require('./../../config/config');

var chai = require('chai'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

	//mongoose.set('debug', true);

/**
 * Globals
 */
var user, user2, db;
var expect = chai.expect;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
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

	before(function(done) {

		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find().then(function (users) {
				expect(users).to.have.lengthOf(0);
				done();
			}).catch(function (err) {
				expect.fail(err);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save().then(function (user) {
				expect(user).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should fail to save an existing user again', function(done) {
			user.save().then(function (user) {
				expect(user).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
			user2.save().then(function (user2) {
				expect(user2).to.exist;
				done();
			}).catch(function (err) {
				expect.fail(err);
				done(err);
			});
		});

		it('should be able to show an error when try to save without first name', function(done) {
			user.firstName = '';
			user.save().then(function (user) {
				expect(user).to.exist;
				done();
			}).catch(function (err) {
				expect(err).to.throw;
				done();
			});
		});
	});

	after(function(done) {
		user.deleteOne();
		user2.deleteOne();
		done();
	});

	after(function(done) {

		mongoose.connection.close(done);

		done();
	});
});