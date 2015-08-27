'use strict';

(function() {
	// Logs Controller Spec
	describe('Logs Controller Tests', function() {
		// Initialize global variables
		var LogsController,
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

			// Initialize the Logs controller.
			LogsController = $controller('LogsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Log object fetched from XHR', inject(function(Logs) {
			// Create sample Log using the Logs service
			var sampleLog = new Logs({
				name: 'New Log'
			});

			// Create a sample Logs array that includes the new Log
			var sampleLogs = [sampleLog];

			// Set GET response
			$httpBackend.expectGET('logs').respond(sampleLogs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.logs).toEqualData(sampleLogs);
		}));

		it('$scope.findOne() should create an array with one Log object fetched from XHR using a logId URL parameter', inject(function(Logs) {
			// Define a sample Log object
			var sampleLog = new Logs({
				name: 'New Log'
			});

			// Set the URL parameter
			$stateParams.logId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/logs\/([0-9a-fA-F]{24})$/).respond(sampleLog);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.log).toEqualData(sampleLog);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Logs) {
			// Create a sample Log object
			var sampleLogPostData = new Logs({
				name: 'New Log'
			});

			// Create a sample Log response
			var sampleLogResponse = new Logs({
				_id: '525cf20451979dea2c000001',
				name: 'New Log'
			});

			// Fixture mock form input values
			scope.name = 'New Log';

			// Set POST response
			$httpBackend.expectPOST('logs', sampleLogPostData).respond(sampleLogResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Log was created
			expect($location.path()).toBe('/logs/' + sampleLogResponse._id);
		}));

		it('$scope.update() should update a valid Log', inject(function(Logs) {
			// Define a sample Log put data
			var sampleLogPutData = new Logs({
				_id: '525cf20451979dea2c000001',
				name: 'New Log'
			});

			// Mock Log in scope
			scope.log = sampleLogPutData;

			// Set PUT response
			$httpBackend.expectPUT(/logs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/logs/' + sampleLogPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid logId and remove the Log from the scope', inject(function(Logs) {
			// Create new Log object
			var sampleLog = new Logs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Logs array and include the Log
			scope.logs = [sampleLog];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/logs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleLog);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.logs.length).toBe(0);
		}));
	});
}());