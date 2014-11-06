'use strict';

(function() {
	// Typecasts Controller Spec
	describe('Typecasts Controller Tests', function() {
		// Initialize global variables
		var TypecastsController,
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

			// Initialize the Typecasts controller.
			TypecastsController = $controller('TypecastsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Typecast object fetched from XHR', inject(function(Typecasts) {
			// Create sample Typecast using the Typecasts service
			var sampleTypecast = new Typecasts({
				name: 'New Typecast'
			});

			// Create a sample Typecasts array that includes the new Typecast
			var sampleTypecasts = [sampleTypecast];

			// Set GET response
			$httpBackend.expectGET('typecasts').respond(sampleTypecasts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.typecasts).toEqualData(sampleTypecasts);
		}));

		it('$scope.findOne() should create an array with one Typecast object fetched from XHR using a typecastId URL parameter', inject(function(Typecasts) {
			// Define a sample Typecast object
			var sampleTypecast = new Typecasts({
				name: 'New Typecast'
			});

			// Set the URL parameter
			$stateParams.typecastId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/typecasts\/([0-9a-fA-F]{24})$/).respond(sampleTypecast);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.typecast).toEqualData(sampleTypecast);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Typecasts) {
			// Create a sample Typecast object
			var sampleTypecastPostData = new Typecasts({
				name: 'New Typecast'
			});

			// Create a sample Typecast response
			var sampleTypecastResponse = new Typecasts({
				_id: '525cf20451979dea2c000001',
				name: 'New Typecast'
			});

			// Fixture mock form input values
			scope.name = 'New Typecast';

			// Set POST response
			$httpBackend.expectPOST('typecasts', sampleTypecastPostData).respond(sampleTypecastResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Typecast was created
			expect($location.path()).toBe('/typecasts/' + sampleTypecastResponse._id);
		}));

		it('$scope.update() should update a valid Typecast', inject(function(Typecasts) {
			// Define a sample Typecast put data
			var sampleTypecastPutData = new Typecasts({
				_id: '525cf20451979dea2c000001',
				name: 'New Typecast'
			});

			// Mock Typecast in scope
			scope.typecast = sampleTypecastPutData;

			// Set PUT response
			$httpBackend.expectPUT(/typecasts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/typecasts/' + sampleTypecastPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid typecastId and remove the Typecast from the scope', inject(function(Typecasts) {
			// Create new Typecast object
			var sampleTypecast = new Typecasts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Typecasts array and include the Typecast
			scope.typecasts = [sampleTypecast];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/typecasts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTypecast);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.typecasts.length).toBe(0);
		}));
	});
}());