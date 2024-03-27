'use strict';

(function() {
	// Authentication controller Spec
	describe('AuthenticationController', function() {
		// Initialize global variables
		var AuthenticationController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Authentication controller
			AuthenticationController = $controller('AuthenticationController', {
				$scope: scope
			});
		}));

		it('$scope.signup() should register with correct data', function() {
			// Test expected GET request
			scope.credentials = {
				firstName: 'rob rob test test',
				lastName: 'test rtob',
				company: 'sc',
				email: 'doodersrage@gmail.com',
				username: 'robtesttest',
				phone: '0123456789',
				password: 'production1',
				roles: ['admin'],
				noemail: false,
				displayName: 'rob rob test test test rtob'
			  };

			$httpBackend.expectPOST('/auth/signup').respond(200);

			scope.signup();
			$httpBackend.flush();

			// test scope value
			expect($location.url()).toBe('/');
		});

		it('$scope.signup() should fail to register with duplicate Username', function() {
			// Test expected POST request

			scope.credentials = {
				firstName: 'rob rob test test',
				lastName: 'test rtob',
				company: 'sc',
				email: 'doodersrage@gmail.com',
				username: 'robtesttest',
				phone: '0123456789',
				password: 'production1',
				roles: ['admin'],
				noemail: false,
				displayName: 'rob rob test test test rtob'
			};

			expect(function () {
				scope.signup();
				$httpBackend.flush();
			}).toThrow();

		});

		it('$scope.signin() should login with a correct user and password', function() {

			scope.credentials = {
				username: 'robtesttest',
				password: 'production1'
			  };

			// Test expected GET request
			$httpBackend.expectPOST('/auth/signin').respond(200);

			scope.signin();
			$httpBackend.flush();

			// Test scope value
			expect($location.url()).toEqual('/');
		});

		it('$scope.signin() should fail to log in with nothing', function() {
			// Test expected POST request
			$httpBackend.expectPOST('/auth/signin').respond(400, {
				'message': 'Missing credentials'
			});

			scope.signin();
			$httpBackend.flush();

			// Test scope value
			expect(scope.error).toEqual('Missing credentials');
		});

		it('$scope.signin() should fail to log in with wrong credentials', function() {
			// Foo/Bar combo assumed to not exist
			scope.authentication.username = 'Foo';
			scope.credentials = 'Bar';

			// Test expected POST request
			$httpBackend.expectPOST('/auth/signin').respond(400, {
				'message': 'Unknown user'
			});

			scope.signin();
			$httpBackend.flush();

			// Test scope value
			expect(scope.error).toEqual('Unknown user');
		});

	});
}());