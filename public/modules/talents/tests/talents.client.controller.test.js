'use strict';

(function() {
	// Talents Controller Spec
	describe('Talents Controller Tests', function() {
		// Initialize global variables
		var TalentsController,
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

			// Initialize the Talents controller.
			TalentsController = $controller('TalentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Talent object fetched from XHR', inject(function(Talents) {
			// Create sample Talent using the Talents service
			var sampleTalent = new Talents({
				name: 'New Talent'
			});

			// Create a sample Talents array that includes the new Talent
			var sampleTalents = [sampleTalent];

			// Set GET response
			$httpBackend.expectGET('talents').respond(sampleTalents);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.talents).toEqualData(sampleTalents);
		}));

		it('$scope.findOne() should create an array with one Talent object fetched from XHR using a talentId URL parameter', inject(function(Talents) {
			// Define a sample Talent object
			var sampleTalent = new Talents({
				name: 'New Talent'
			});

			// Set the URL parameter
			$stateParams.talentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/talents\/([0-9a-fA-F]{24})$/).respond(sampleTalent);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.talent).toEqualData(sampleTalent);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Talents) {
			// Create a sample Talent object
			var sampleTalentPostData = new Talents({
				name: 'New Talent'
			});

			// Create a sample Talent response
			var sampleTalentResponse = new Talents({
				_id: '525cf20451979dea2c000001',
				name: 'New Talent'
			});

			// Fixture mock form input values
			scope.name = 'New Talent';

			// Set POST response
			$httpBackend.expectPOST('talents', sampleTalentPostData).respond(sampleTalentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Talent was created
			expect($location.path()).toBe('/talents/' + sampleTalentResponse._id);
		}));

		it('$scope.update() should update a valid Talent', inject(function(Talents) {
			// Define a sample Talent put data
			var sampleTalentPutData = new Talents({
				_id: '525cf20451979dea2c000001',
				name: 'New Talent'
			});

			// Mock Talent in scope
			scope.talent = sampleTalentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/talents\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/talents/' + sampleTalentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid talentId and remove the Talent from the scope', inject(function(Talents) {
			// Create new Talent object
			var sampleTalent = new Talents({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Talents array and include the Talent
			scope.talents = [sampleTalent];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/talents\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTalent);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.talents.length).toBe(0);
		}));
	});
}());