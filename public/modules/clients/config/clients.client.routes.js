'use strict';

//Setting up route
angular.module('clients').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Projects state routing
		$stateProvider.
		state('clientProjectsList', {
			url: '/clients/projects',
			templateUrl: 'modules/clients/views/client-list-projects.client.view.html'
		}).
		state('clientProjectsSingleList', {
			url: '/clients/projects/:projectId',
			templateUrl: 'modules/clients/views/client-list-projects.client.view.html'
		}).
		state('newAudProject', {
			url: '/clients/new-audition-form',
			templateUrl: 'modules/clients/views/new-audition-project.client.view.html'
		}).
		state('newAudProjectThanks', {
			url: '/clients/new-audition-form/thanks',
			templateUrl: 'modules/clients/views/new-audition-project-thanks.client.view.html'
		});
	}
]);
