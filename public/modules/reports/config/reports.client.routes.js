'use strict';

//Setting up route
angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		// Reports state routing
		$stateProvider.
		state('listReports', {
			url: '/reports',
			templateUrl: 'modules/reports/views/list-reports.client.view.html'
		}).
		state('missingAuditionsReports', {
			url: '/reports/missing-auditions',
			templateUrl: 'modules/reports/views/missing-auditions-reports.client.view.html'
		}).
		state('missingAuditionsBooked', {
			url: '/reports/auditions-booked',
			templateUrl: 'modules/reports/views/auditions-booked.client.view.html'
		}).
		state('serverStats', {
			url: '/reports/server-stats',
			templateUrl: 'modules/reports/views/server-stats.client.view.html'
		}).
		state('audsPerProducer', {
			url: '/reports/auds-per-producer',
			templateUrl: 'modules/reports/views/auds-per-producer.client.view.html'
		});
		// state('createReport', {
		// 	url: '/reports/create',
		// 	templateUrl: 'modules/reports/views/create-report.client.view.html'
		// }).
		// state('viewReport', {
		// 	url: '/reports/:reportId',
		// 	templateUrl: 'modules/reports/views/view-report.client.view.html'
		// }).
		// state('editReport', {
		// 	url: '/reports/:reportId/edit',
		// 	templateUrl: 'modules/reports/views/edit-report.client.view.html'
		// });
	}
]);
