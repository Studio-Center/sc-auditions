'use strict';

//Setting up route
angular.module('logs').config(['$stateProvider',
	function($stateProvider) {
		// Logs state routing
		$stateProvider.
		state('listLogs', {
			url: '/logs',
			templateUrl: 'modules/logs/views/list-logs.client.view.html'
		}).
		state('createLog', {
			url: '/logs/create',
			templateUrl: 'modules/logs/views/create-log.client.view.html'
		}).
		state('viewLog', {
			url: '/logs/:logId',
			templateUrl: 'modules/logs/views/view-log.client.view.html'
		}).
		state('editLog', {
			url: '/logs/:logId/edit',
			templateUrl: 'modules/logs/views/edit-log.client.view.html'
		});
	}
]);