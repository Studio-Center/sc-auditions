'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Talent = mongoose.model('Talent');

/**
 * Globals
 */
var user, talent;

/**
 * Unit tests
 */
describe('Talent Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			talent = new Talent({
				name: 'Talent Name',
				lastName: 'namer',
				type: 'type',
				unionStatus: ['union'],
				locationISDN: 'ISDN',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return talent.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			talent.name = '';

			return talent.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Talent.remove().exec();
		User.remove().exec();

		done();
	});
});
