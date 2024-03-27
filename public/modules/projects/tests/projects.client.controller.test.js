'use strict';

(function() {
	// Projects Controller Spec
	describe('Projects Controller Tests', function() {
		// Initialize global variables
		var ProjectsController,
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

			// Initialize the Projects controller.
			ProjectsController = $controller('ProjectsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Project object fetched from XHR', inject(function(Projects) {
			// Create sample Project using the Projects service
			var sampleProject = new Projects({
				_id: '65f1f1cd9745bcab7c15489b',
				estimatedCompletionDate: '2024-03-30T19:30:00.000Z',
				title: 'New Project',
				talent: [{
					talentId: '65ea02e5bc4477b0772241ca',
					name: 'test talent',
					email: 'test@talent.com',
					booked: false,
					status: 'Posted',
					part: '',
					regular: false,
					requested: true,
					added: '2024-03-13T14:34:29-04:00',
					nameLnmCode: 'test ttt',
					locationISDN: 'Las Vegas'
				  }]
			});

			// Create a sample Projects array that includes the new Project
			var sampleProjects = [sampleProject];

			// Set GET response
			$httpBackend.expectGET('projects').respond(sampleProjects);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.projects).toEqualData(sampleProjects);
		}));

		it('$scope.findOne() should create an array with one Project object fetched from XHR using a projectId URL parameter', inject(function(Projects) {
			// Define a sample Project object
			var sampleProject = new Projects({
				_id: '65f1f1cd9745bcab7c15489b',
				estimatedCompletionDate: '2024-03-30T19:30:00.000Z',
				title: 'New Project',
				talent: [{
					talentId: '65ea02e5bc4477b0772241ca',
					name: 'test talent',
					email: 'test@talent.com',
					booked: false,
					status: 'Posted',
					part: '',
					regular: false,
					requested: true,
					added: '2024-03-13T14:34:29-04:00',
					nameLnmCode: 'test ttt',
					locationISDN: 'Las Vegas'
				  }]
			});

			// Set the URL parameter
			$stateParams.projectId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/projects\/([0-9a-fA-F]{24})$/).respond(sampleProject);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.project).toEqualData(sampleProject);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Projects) {
			// Create a sample Project object
			scope.newProject = new Projects({
				_id: '65f1f1cd9745bcab7c15489b',
				estimatedCompletionDate: '2024-03-30T19:30:00.000Z',
				title: 'New Project',
				talent: [{
					talentId: '65f1f1cd9745bcab7c15489b',
					name: 'test talent',
					email: 'test@talent.com',
					booked: false,
					status: 'Posted',
					part: '',
					regular: false,
					requested: true,
					added: '2024-03-13T14:34:29-04:00',
					nameLnmCode: 'test ttt',
					locationISDN: 'Las Vegas'
				  }]
			});

			// Create a sample Project response
			var sampleProjectResponse = new Projects({
				_id: '65f1f1cd9745bcab7c15489b',
				estimatedCompletionDate: '2024-03-30T19:30:00.000Z',
				title: 'New Project',
				talent: [{
					talentId: '65ea02e5bc4477b0772241ca',
					name: 'test talent',
					email: 'test@talent.com',
					booked: false,
					status: 'Posted',
					part: '',
					regular: false,
					requested: true,
					added: '2024-03-13T14:34:29-04:00',
					nameLnmCode: 'test ttt',
					locationISDN: 'Las Vegas'
				  }]
			});

			// Fixture mock form input values
			scope.title = 'New Project';

			// Set POST response
			$httpBackend.expectPOST('projects/'+ scope.newProject._id).respond(200);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Project was created
			expect($location.path()).toBe('/projects/' + sampleProjectResponse._id);
		}));

		it('$scope.update() should update a valid Project', inject(function(Projects) {
			// Define a sample Project put data
			var sampleProjectPutData = new Projects({
				_id: '65f1f1cd9745bcab7c15489b',
				estimatedCompletionDate: '2024-03-30T19:30:00.000Z',
				title: 'New Project',
				talent: [{
					talentId: '65ea02e5bc4477b0772241ca',
					name: 'test talent',
					email: 'test@talent.com',
					booked: false,
					status: 'Posted',
					part: '',
					regular: false,
					requested: true,
					added: '2024-03-13T14:34:29-04:00',
					nameLnmCode: 'test ttt',
					locationISDN: 'Las Vegas'
				  }]
			});

			// Mock Project in scope
			scope.project = sampleProjectPutData;

			// Set PUT response
			$httpBackend.expectPUT(/projects\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/projects/' + sampleProjectPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid projectId and remove the Project from the scope', inject(function(Projects) {
			// Create new Project object
			var sampleProject = new Projects({
				_id: '65f1f1cd9745bcab7c15489b'
			});

			// Create new Projects array and include the Project
			scope.projects = [sampleProject];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/projects\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleProject);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.projects.length).toBe(0);
		}));
	});
}());