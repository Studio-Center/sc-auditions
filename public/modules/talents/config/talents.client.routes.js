'use strict';

//Setting up route
angular.module('talents').config(['$stateProvider',
	function($stateProvider) {
		// Talents state routing
		$stateProvider.
		state('listTalents', {
			url: '/talents',
			templateUrl: 'modules/talents/views/list-talents.client.view.html'
		}).
		state('createTalent', {
			url: '/talents/create',
			templateUrl: 'modules/talents/views/create-talent.client.view.html'
		}).
		state('viewTalent', {
			url: '/talents/:talentId',
			templateUrl: 'modules/talents/views/view-talent.client.view.html'
		}).
		state('editTalent', {
			url: '/talents/:talentId/edit',
			templateUrl: 'modules/talents/views/edit-talent.client.view.html'
		});
	}
]);