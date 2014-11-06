'use strict';

//Setting up route
angular.module('agencies').config(['$stateProvider',
	function($stateProvider) {
		// Agencies state routing
		$stateProvider.
		state('listAgencies', {
			url: '/agencies',
			templateUrl: 'modules/agencies/views/list-agencies.client.view.html'
		}).
		state('createAgency', {
			url: '/agencies/create',
			templateUrl: 'modules/agencies/views/create-agency.client.view.html'
		}).
		state('viewAgency', {
			url: '/agencies/:agencyId',
			templateUrl: 'modules/agencies/views/view-agency.client.view.html'
		}).
		state('editAgency', {
			url: '/agencies/:agencyId/edit',
			templateUrl: 'modules/agencies/views/edit-agency.client.view.html'
		});
	}
]);