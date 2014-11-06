'use strict';

//Setting up route
angular.module('typecasts').config(['$stateProvider',
	function($stateProvider) {
		// Typecasts state routing
		$stateProvider.
		state('listTypecasts', {
			url: '/typecasts',
			templateUrl: 'modules/typecasts/views/list-typecasts.client.view.html'
		}).
		state('createTypecast', {
			url: '/typecasts/create',
			templateUrl: 'modules/typecasts/views/create-typecast.client.view.html'
		}).
		state('viewTypecast', {
			url: '/typecasts/:typecastId',
			templateUrl: 'modules/typecasts/views/view-typecast.client.view.html'
		}).
		state('editTypecast', {
			url: '/typecasts/:typecastId/edit',
			templateUrl: 'modules/typecasts/views/edit-typecast.client.view.html'
		});
	}
]);