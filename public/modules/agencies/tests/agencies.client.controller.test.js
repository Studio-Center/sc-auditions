'use strict';

(function() {
	// Agencies Controller Spec
	describe('Agencies Controller Tests', function() {
		// Initialize global variables
		var AgenciesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
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

		// Then we can start by loading the main application module
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

			// Initialize the Agencies controller.
			AgenciesController = $controller('AgenciesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Agency object fetched from XHR', inject(function(Agencies) {
			// Create sample Agency using the Agencies service
			var sampleAgency = new Agencies({
				name: 'New Agency'
			});

			// Create a sample Agencies array that includes the new Agency
			var sampleAgencies = [sampleAgency];

			// Set GET response
			$httpBackend.expectGET('agencies').respond(sampleAgencies);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.agencies).toEqualData(sampleAgencies);
		}));

		it('$scope.findOne() should create an array with one Agency object fetched from XHR using a agencyId URL parameter', inject(function(Agencies) {
			// Define a sample Agency object
			var sampleAgency = new Agencies({
				name: 'New Agency'
			});

			// Set the URL parameter
			$stateParams.agencyId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/agencies\/([0-9a-fA-F]{24})$/).respond(sampleAgency);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.agency).toEqualData(sampleAgency);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Agencies) {
			// Create a sample Agency object
			var sampleAgencyPostData = new Agencies({
				name: 'New Agency'
			});

			// Create a sample Agency response
			var sampleAgencyResponse = new Agencies({
				_id: '525cf20451979dea2c000001',
				name: 'New Agency'
			});

			// Fixture mock form input values
			scope.name = 'New Agency';

			// Set POST response
			$httpBackend.expectPOST('agencies', sampleAgencyPostData).respond(sampleAgencyResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Agency was created
			expect($location.path()).toBe('/agencies/' + sampleAgencyResponse._id);
		}));

		it('$scope.update() should update a valid Agency', inject(function(Agencies) {
			// Define a sample Agency put data
			var sampleAgencyPutData = new Agencies({
				_id: '525cf20451979dea2c000001',
				name: 'New Agency'
			});

			// Mock Agency in scope
			scope.agency = sampleAgencyPutData;

			// Set PUT response
			$httpBackend.expectPUT(/agencies\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/agencies/' + sampleAgencyPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid agencyId and remove the Agency from the scope', inject(function(Agencies) {
			// Create new Agency object
			var sampleAgency = new Agencies({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Agencies array and include the Agency
			scope.agencies = [sampleAgency];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/agencies\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleAgency);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.agencies.length).toBe(0);
		}));
	});
}());